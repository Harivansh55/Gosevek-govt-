import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_SCHEMES } from './src/data/schemes.js';
import { evaluateSchemeEligibility, rankEvaluations } from './src/lib/eligibilityEngine.js';
import { parseConversationalAnswer, getNextStep } from './src/lib/conversationEngine.js';
import { searchAndRetrieveSchemes, generateLocalRAGResponse } from './src/lib/ragEngine.js';
import { Scheme, UserProfile, Language } from './src/types.js';

const PORT = 3000;
let schemesDatabase: Scheme[] = [...INITIAL_SCHEMES];

// Admin stats tracker
let totalSearchesCount = 142;
const categorySearchCounts: Record<string, number> = {
  'Scholarships': 48,
  'Farmer support': 36,
  'Entrepreneurship': 29,
  'Healthcare': 21,
  'Women & child welfare': 18
};

// Lazy initialization for Gemini SDK
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAI;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      schemesCount: schemesDatabase.length,
      mode: process.env.GEMINI_API_KEY ? 'live_ai' : 'demo_mode'
    });
  });

  // Get all schemes (with optional filter)
  app.get('/api/schemes', (req: Request, res: Response) => {
    const { category, state, q } = req.query;
    let filtered = [...schemesDatabase];

    if (category && typeof category === 'string' && category !== 'All') {
      filtered = filtered.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    if (state && typeof state === 'string' && state !== 'All') {
      filtered = filtered.filter(s => s.states.includes('All India') || s.states.some(st => st.toLowerCase() === state.toLowerCase()));
    }
    if (q && typeof q === 'string') {
      const queryLower = q.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(queryLower) ||
        (s.hindi_name && s.hindi_name.toLowerCase().includes(queryLower)) ||
        s.overview.toLowerCase().includes(queryLower) ||
        s.tags.some(t => t.toLowerCase().includes(queryLower))
      );
    }

    res.json({
      schemes: filtered,
      total: filtered.length
    });
  });

  // Get single scheme
  app.get('/api/schemes/:id', (req: Request, res: Response) => {
    const scheme = schemesDatabase.find(s => s.id === req.params.id);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    res.json({ scheme });
  });

  // Get scheme documents
  app.get('/api/schemes/:id/documents', (req: Request, res: Response) => {
    const scheme = schemesDatabase.find(s => s.id === req.params.id);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    res.json({
      schemeId: scheme.id,
      schemeName: scheme.name,
      documents: scheme.documents,
      lastVerified: scheme.last_verified,
      sourceUrl: scheme.source_url
    });
  });

  // Get categories
  app.get('/api/categories', (req: Request, res: Response) => {
    const categoriesMap: Record<string, number> = {};
    schemesDatabase.forEach(s => {
      categoriesMap[s.category] = (categoriesMap[s.category] || 0) + 1;
    });
    const categories = Object.entries(categoriesMap).map(([name, count]) => ({ name, count }));
    res.json({ categories });
  });

  // Conversational profile step processing (Intake API)
  app.post('/api/conversation/next', async (req: Request, res: Response) => {
    try {
      const { profile = {}, answer, currentField, language = 'en' } = req.body;
      let updatedProfile: UserProfile = { ...profile };

      // If user provided an answer for a field
      if (answer !== undefined && currentField) {
        // First try local parser for immediate, reliable, deterministic extraction
        const localParsed = parseConversationalAnswer(String(answer), currentField as keyof UserProfile);
        updatedProfile = { ...updatedProfile, ...localParsed.updatedProfile };

        // If Gemini is available, enhance complex natural language (e.g. Hinglish nuances)
        const ai = getGenAI();
        if (ai && typeof answer === 'string' && answer.length > 5) {
          try {
            const prompt = `You are a structured profile extractor for an Indian Government scheme assistant.
The user was asked about: "${currentField}".
The user's response is: "${answer}".
Extract structured data from this response for an Indian citizen profile.
Available fields: age (number), gender ('Male'|'Female'|'Transgender'), state (Indian state name), occupation ('Student'|'Farmer'|'Entrepreneur'|'Self-Employed'|'Salaried Employee'|'Daily Wage Worker / Laborer'|'Artisan / Craftsperson'|'Unemployed'|'Senior Citizen / Retired'), annual_income (in INR, calculate from lakhs or thousands e.g. "2 lakh" = 200000), category ('General'|'OBC'|'SC'|'ST'|'EWS'|'Minority'), is_student (boolean), is_farmer (boolean), land_size_acres (number), education_level ('School'|'Undergraduate'|'Postgraduate'|'Vocational'), is_disabled (boolean).
Return ONLY a valid JSON object with the extracted keys, e.g. {"age": 21} or {"annual_income": 200000}. If uncertain, return empty JSON {}.`;

            const geminiRes = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
              }
            });

            if (geminiRes.text) {
              const parsed = JSON.parse(geminiRes.text);
              updatedProfile = { ...updatedProfile, ...parsed };
            }
          } catch (aiErr) {
            console.warn('Gemini extraction fallback to local parser:', aiErr);
          }
        }
      }

      const nextStep = getNextStep(updatedProfile);
      const isComplete = nextStep === null;

      res.json({
        updatedProfile,
        nextStep,
        isComplete
      });
    } catch (err: any) {
      console.error('Conversation step error:', err);
      res.status(500).json({ error: 'Failed to process conversation step', details: err.message });
    }
  });

  // Deterministic Rule-Based Eligibility Check API
  app.post('/api/eligibility/check', (req: Request, res: Response) => {
    try {
      const profile: UserProfile = req.body.profile || {};
      totalSearchesCount++;

      // Track search category if occupation or category given
      if (profile.occupation) {
        categorySearchCounts[profile.occupation] = (categorySearchCounts[profile.occupation] || 0) + 1;
      }

      // Strictly evaluate using the deterministic rule engine
      const evaluations = schemesDatabase.map(scheme => evaluateSchemeEligibility(scheme, profile));
      const ranked = rankEvaluations(evaluations);

      const eligibleCount = ranked.filter(e => e.status === 'ELIGIBLE').length;
      const possiblyEligibleCount = ranked.filter(e => e.status === 'POSSIBLY_ELIGIBLE').length;
      const nearMissCount = ranked.filter(e => e.status === 'NEAR_MISS').length;
      const notEligibleCount = ranked.filter(e => e.status === 'NOT_ELIGIBLE').length;

      res.json({
        evaluations: ranked,
        totalChecked: schemesDatabase.length,
        summary: {
          eligible: eligibleCount,
          possiblyEligible: possiblyEligibleCount,
          nearMiss: nearMissCount,
          notEligible: notEligibleCount
        }
      });
    } catch (err: any) {
      console.error('Eligibility check error:', err);
      res.status(500).json({ error: 'Eligibility check failed', details: err.message });
    }
  });

  // RAG Chat API grounded on schemes dataset and user profile
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { query, profile, language = 'en' } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      // 1. Retrieve relevant schemes through RAG
      const retrieved = searchAndRetrieveSchemes(query, schemesDatabase, 4);

      // 2. Compute eligibility for retrieved schemes if profile exists
      let profileContext = '';
      if (profile && Object.keys(profile).length > 0) {
        const evalContext = retrieved.map(m => {
          const evalRes = evaluateSchemeEligibility(m.scheme, profile);
          return `${m.scheme.name}: Status=${evalRes.status} (Reasons: ${evalRes.matchedReasons.join('; ')} | Near-Miss: ${evalRes.nearMissExplanation || 'None'})`;
        }).join('\n');

        profileContext = `User Profile:
Name: ${profile.name || 'Citizen'}
Age: ${profile.age || 'Unknown'}
Gender: ${profile.gender || 'Unknown'}
State: ${profile.state || 'Unknown'}
Occupation: ${profile.occupation || 'Unknown'}
Income: ₹${profile.annual_income?.toLocaleString('en-IN') || 'Unknown'}
Category: ${profile.category || 'Unknown'}
Student: ${profile.is_student ? 'Yes' : 'No'}
Farmer: ${profile.is_farmer ? 'Yes' : 'No'}
Disability: ${profile.is_disabled ? 'Yes' : 'No'}

Evaluated Eligibility for Matched Schemes:
${evalContext}`;
      }

      // 3. Check Gemini API
      const ai = getGenAI();
      if (ai) {
        try {
          const schemesContext = retrieved.map(m => `
---
Scheme Name: ${m.scheme.name} (${m.scheme.hindi_name || ''})
Ministry: ${m.scheme.ministry} (${m.scheme.department})
Category: ${m.scheme.category}
Benefits: ${m.scheme.benefits} (${m.scheme.estimated_benefit_amount || ''})
Eligible Rules: Age ${m.scheme.rules.min_age ?? 0}-${m.scheme.rules.max_age ?? 'Any'}, Occupations: ${m.scheme.rules.occupations?.join(', ') || 'Any'}, Max Income: ${m.scheme.rules.max_income ? '₹' + m.scheme.rules.max_income : 'No ceiling'}, Categories: ${m.scheme.rules.eligible_categories?.join(', ') || 'All'}
Required Documents: ${m.scheme.documents.join(', ')}
Application Steps: ${m.scheme.application_process.join(' -> ')}
Official Portal: ${m.scheme.application_url}
Source: ${m.scheme.source_url} (Verified: ${m.scheme.last_verified})
---`).join('\n');

          const systemPrompt = `You are GOVSAHAYAK AI, an official Indian Government Scheme Assistant.
Your mission is to provide accurate, transparent, and empathetic guidance to Indian citizens in their chosen language: ${language.toUpperCase()} (English, Hindi, or Hinglish).
CRITICAL RULES:
1. Ground your answer ONLY on the verified scheme context below.
2. Explain eligibility clearly with bullet points. Cite official portals and exact required documents.
3. If the user asks about eligibility, reference their profile evaluation rules (e.g. why they qualify or what document they need).
4. If the information is not in the scheme context, state politely: "I don't have verified information for that question."
5. Never hallucinate fake government grants, unverified phone numbers, or false promises.`;

          const userPrompt = `Citizen Query: "${query}"

${profileContext ? profileContext + '\n\n' : ''}
Retrieved Verified Scheme Database Context:
${schemesContext || 'No directly matching schemes found.'}

Please respond concisely and helpfully in ${language === 'hi' ? 'Hindi' : language === 'hinglish' ? 'Hinglish (mix of Hindi & English written in Latin script)' : 'English'}. Include 2-3 short suggested follow-up questions at the end on their own lines prefixed with "SUGGESTION:".`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
            }
          });

          const rawText = response.text || '';
          const lines = rawText.split('\n');
          const suggestions: string[] = [];
          const contentLines: string[] = [];

          for (const line of lines) {
            if (line.startsWith('SUGGESTION:')) {
              suggestions.push(line.replace('SUGGESTION:', '').trim());
            } else {
              contentLines.push(line);
            }
          }

          return res.json({
            answer: contentLines.join('\n').trim(),
            suggestedQuestions: suggestions.length > 0 ? suggestions : [
              'What documents do I need to apply?',
              'How to check application status on official portal?',
              'Show other schemes for my profile'
            ],
            groundedSchemes: retrieved.map(m => m.scheme),
            source: 'gemini_rag'
          });
        } catch (geminiError: any) {
          console.warn('Gemini chat error, falling back to local RAG generator:', geminiError.message);
        }
      }

      // Fallback local RAG answer generator
      const localResp = generateLocalRAGResponse(query, retrieved, profile, language);
      res.json({
        ...localResp,
        source: 'local_rag'
      });
    } catch (err: any) {
      console.error('Chat endpoint error:', err);
      res.status(500).json({ error: 'Chat processing failed', details: err.message });
    }
  });

  // Admin APIs
  app.get('/api/admin/stats', (req: Request, res: Response) => {
    res.json({
      totalSchemes: schemesDatabase.length,
      totalSearches: totalSearchesCount,
      popularCategories: Object.entries(categorySearchCounts).map(([category, count]) => ({ category, count })),
      schemesByMinistry: Array.from(new Set(schemesDatabase.map(s => s.ministry))).map(ministry => ({
        ministry,
        count: schemesDatabase.filter(s => s.ministry === ministry).length
      }))
    });
  });

  app.post('/api/admin/schemes', (req: Request, res: Response) => {
    const newScheme: Scheme = req.body;
    if (!newScheme.id || !newScheme.name || !newScheme.category) {
      return res.status(400).json({ error: 'id, name, and category are required' });
    }
    schemesDatabase.unshift(newScheme);
    res.status(201).json({ message: 'Scheme added successfully', scheme: newScheme });
  });

  app.put('/api/admin/schemes/:id', (req: Request, res: Response) => {
    const idx = schemesDatabase.findIndex(s => s.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    schemesDatabase[idx] = { ...schemesDatabase[idx], ...req.body };
    res.json({ message: 'Scheme updated successfully', scheme: schemesDatabase[idx] });
  });

  app.delete('/api/admin/schemes/:id', (req: Request, res: Response) => {
    const prevLen = schemesDatabase.length;
    schemesDatabase = schemesDatabase.filter(s => s.id !== req.params.id);
    if (schemesDatabase.length === prevLen) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    res.json({ message: 'Scheme deleted successfully' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GOVSAHAYAK server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
