import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface DomainAIAnalysis {
  acquisition_viability_score: number;
  renewal_efficiency_score: number;
  ai_verdict: string;
  key_pros: string[];
  key_risks: string[];
  strategic_recommendation: string;
  suggested_niche: string;
}

export async function analyzeDomainWithGemini(
  domain: string,
  mode: 'buy' | 'renew',
  metrics: {
    length: number;
    syllables: number;
    tld: string;
    tldTier: string;
    estimatedValue: number;
    annualCarryingCost: number;
    brandabilityScore: number;
  }
): Promise<DomainAIAnalysis | null> {
  const ai = getGeminiClient();
  if (!ai) {
    return null;
  }

  try {
    const prompt = `
Analyze the domain "${domain}" for a domain investor / portfolio manager in Mode: "${mode.toUpperCase()}".
Metrics provided:
- Domain: ${domain}
- Second Level Domain Length: ${metrics.length} characters
- Syllable Count: ${metrics.syllables}
- TLD: ${metrics.tld} (${metrics.tldTier})
- Estimated Fair Market Value: $${metrics.estimatedValue}
- Annual Carrying / Renewal Cost: $${metrics.annualCarryingCost}
- Brandability Score: ${metrics.brandabilityScore}/100

Criteria specification:
- Acquisition Viability: Rate financial ROI of purchasing this domain compared to typical holding duration (High Viability: 1-2 english syllables, generic product/category match, aged history, no spam penalties).
- Renewal Efficiency: Evaluate whether current year renewal fee outweighs estimated exit value or active parking income.
Return a normalized score between 0.0 and 1.0 for each.
Do NOT use emojis. Do NOT use em-dashes. Use standard colons or hyphens.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert domain name appraiser and portfolio asset manager. Analyze commercial viability and ROI deterministically.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            acquisition_viability_score: {
              type: Type.NUMBER,
              description: 'Score from 0.0 to 1.0 for buy suitability',
            },
            renewal_efficiency_score: {
              type: Type.NUMBER,
              description: 'Score from 0.0 to 1.0 for portfolio renewal retention',
            },
            ai_verdict: {
              type: Type.STRING,
              description: 'Short verdict summary without emojis or em-dashes',
            },
            key_pros: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key positive commercial attributes',
            },
            key_risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key risks or carrying liabilities',
            },
            strategic_recommendation: {
              type: Type.STRING,
              description: 'Actionable next step for domain investor',
            },
            suggested_niche: {
              type: Type.STRING,
              description: 'Best target end-user industry or vertical',
            },
          },
          required: [
            'acquisition_viability_score',
            'renewal_efficiency_score',
            'ai_verdict',
            'key_pros',
            'key_risks',
            'strategic_recommendation',
            'suggested_niche',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as DomainAIAnalysis;
  } catch (err) {
    console.error('Gemini domain analysis error:', err);
    return null;
  }
}
