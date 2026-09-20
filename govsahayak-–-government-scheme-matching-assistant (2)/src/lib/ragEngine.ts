import { Scheme, UserProfile, Language } from '../types';
import { INITIAL_SCHEMES } from '../data/schemes';

export interface RetrievedSchemeMatch {
  scheme: Scheme;
  score: number;
  matchedSnippets: string[];
}

export function searchAndRetrieveSchemes(
  query: string,
  schemes: Scheme[] = INITIAL_SCHEMES,
  limit = 5
): RetrievedSchemeMatch[] {
  const queryLower = query.toLowerCase();
  const queryTokens = queryLower
    .replace(/[^\w\s\u0900-\u097F]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  const results: RetrievedSchemeMatch[] = [];

  for (const scheme of schemes) {
    let score = 0;
    const matchedSnippets: string[] = [];

    const nameLower = scheme.name.toLowerCase();
    const hindiNameLower = (scheme.hindi_name || '').toLowerCase();
    const categoryLower = scheme.category.toLowerCase();
    const overviewLower = scheme.overview.toLowerCase();
    const benefitsLower = scheme.benefits.toLowerCase();
    const tagsLower = scheme.tags.map(t => t.toLowerCase()).join(' ');
    const docsLower = scheme.documents.map(d => d.toLowerCase()).join(' ');

    // Exact name or acronym match (e.g. PM-KISAN, PMMY, Mudra, Ayushman, Ujjwala, PMJAY)
    if (nameLower.includes(queryLower) || hindiNameLower.includes(queryLower)) {
      score += 50;
      matchedSnippets.push(`Exact title match: ${scheme.name}`);
    }

    // Token frequency and keyword matching
    for (const token of queryTokens) {
      if (nameLower.includes(token)) {
        score += 15;
        matchedSnippets.push(`Title contains "${token}"`);
      }
      if (categoryLower.includes(token)) {
        score += 12;
        matchedSnippets.push(`Category match: ${scheme.category}`);
      }
      if (tagsLower.includes(token)) {
        score += 10;
      }
      if (benefitsLower.includes(token)) {
        score += 8;
      }
      if (overviewLower.includes(token)) {
        score += 6;
      }
      if (docsLower.includes(token)) {
        score += 5;
        matchedSnippets.push(`Document requirement mentions "${token}"`);
      }
    }

    // Demographic intent boosts
    if (/(student|scholarship|padhai|college|school)/i.test(queryLower) && scheme.category === 'Scholarships') {
      score += 25;
    }
    if (/(farmer|kisan|kheti|krishi|crop|fasal|land)/i.test(queryLower) && (scheme.category === 'Farmer support' || scheme.category === 'Agriculture')) {
      score += 25;
    }
    if (/(woman|women|mahila|girl|beti|stree)/i.test(queryLower) && scheme.category === 'Women & child welfare') {
      score += 25;
    }
    if (/(loan|business|mudra|entrepreneur|startup|dukaan|vyapar)/i.test(queryLower) && (scheme.category === 'Entrepreneurship' || scheme.category === 'Startup support')) {
      score += 25;
    }
    if (/(senior|old age|pension|vridh|buzurg|60)/i.test(queryLower) && scheme.category === 'Senior citizens') {
      score += 25;
    }
    if (/(health|hospital|ilaj|ayushman|bimari|medical)/i.test(queryLower) && scheme.category === 'Healthcare') {
      score += 25;
    }
    if (/(house|home|makan|awas|ghar)/i.test(queryLower) && scheme.category === 'Housing') {
      score += 25;
    }

    if (score > 0) {
      results.push({
        scheme,
        score,
        matchedSnippets: Array.from(new Set(matchedSnippets)).slice(0, 3)
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

export function generateLocalRAGResponse(
  query: string,
  matches: RetrievedSchemeMatch[],
  profile?: UserProfile,
  language: Language = 'en'
): { answer: string; suggestedQuestions: string[]; groundedSchemes: Scheme[] } {
  if (matches.length === 0) {
    const noInfoAnswers: Record<Language, string> = {
      en: "I don't have verified information for that specific query in the official Government scheme database. You can search by category like 'Scholarship', 'Farmer', 'Women', 'Business Loan', or 'Healthcare'.",
      hi: "मेरे पास आधिकारिक सरकारी योजना डेटाबेस में इस विशिष्ट प्रश्न के लिए सत्यापित जानकारी उपलब्ध नहीं है। आप 'छात्रवृत्ति', 'किसान', 'महिला कल्याण', 'बिजनेस लोन' आदि श्रेणियों में खोज सकते हैं।",
      hinglish: "Mere paas official Government scheme database me is question ke liye verified information nahi hai. Aap 'Scholarship', 'Farmer', 'Women', 'Business Loan', ya 'Healthcare' search kar sakte hain."
    };
    return {
      answer: noInfoAnswers[language],
      suggestedQuestions: [
        language === 'hi' ? "विद्यार्थी छात्रवृत्तियां बताएं" : "Show student scholarship schemes",
        language === 'hi' ? "किसानों के लिए सरकारी योजनाएं" : "Show schemes for farmers",
        language === 'hi' ? "महिलाओं के लिए ऋण योजनाएं" : "Schemes for women entrepreneurs"
      ],
      groundedSchemes: []
    };
  }

  const primary = matches[0].scheme;
  const groundedSchemes = matches.map(m => m.scheme);

  let answer = '';
  const suggestedQuestions: string[] = [];

  if (language === 'hi') {
    answer = `**${primary.name}** (${primary.ministry}):\n\n` +
      `📌 **लाभ:** ${primary.benefits}\n\n` +
      `📋 **आवश्यक दस्तावेज:**\n${primary.documents.map(d => `• ${d}`).join('\n')}\n\n` +
      `🌐 **आवेदन प्रक्रिया:** ${primary.application_process[0] || 'आधिकारिक पोर्टल पर जाएं'}\n` +
      `🔗 **आधिकारिक पोर्टल:** [${primary.application_url}](${primary.application_url})\n\n` +
      `*(सत्यापित स्रोत: ${primary.source_url}, अंतिम सत्यापन: ${primary.last_verified})*`;

    suggestedQuestions.push(
      `क्या मैं ${primary.name} के लिए पात्र हूँ?`,
      `${primary.name} के लिए आवश्यक दस्तावेज क्या हैं?`,
      "अन्य संबंधित योजनाएं दिखाएं"
    );
  } else if (language === 'hinglish') {
    answer = `**${primary.name}** (${primary.ministry}):\n\n` +
      `📌 **Key Benefit:** ${primary.benefits}\n\n` +
      `📋 **Zaroori Documents:**\n${primary.documents.map(d => `• ${d}`).join('\n')}\n\n` +
      `🌐 **Apply Kaise Karein:** ${primary.application_process[0] || 'Official portal par register karein'}\n` +
      `🔗 **Official Website:** [${primary.application_url}](${primary.application_url})\n\n` +
      `*(Verified source: ${primary.source_url} | Last updated: ${primary.last_verified})*`;

    suggestedQuestions.push(
      `Kya main ${primary.name} ke liye eligible hu?`,
      `${primary.name} ke documents checklist`,
      "Mujhe kaunse schemes mil sakte hain?"
    );
  } else {
    answer = `**${primary.name}** (${primary.ministry}):\n\n` +
      `📌 **Key Benefits:** ${primary.benefits}\n\n` +
      `📋 **Required Documents:**\n${primary.documents.map(d => `• ${d}`).join('\n')}\n\n` +
      `🌐 **How to Apply:** ${primary.application_process[0] || 'Visit official website'}\n` +
      `🔗 **Official Portal:** [${primary.application_url}](${primary.application_url})\n\n` +
      `*(Verified Source: ${primary.source_url} | Last verified: ${primary.last_verified})*`;

    suggestedQuestions.push(
      `Am I eligible for ${primary.name}?`,
      `What documents do I need for ${primary.name}?`,
      "Show all matched schemes for my profile"
    );
  }

  return {
    answer,
    suggestedQuestions,
    groundedSchemes
  };
}
