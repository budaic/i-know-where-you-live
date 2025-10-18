import OpenAI from 'openai';
import { config } from '../config';
import { Profile, Source, SourceSummary, Subject } from '../types';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export async function generateProfile(
  subject: Subject,
  sources: SourceSummary[]
): Promise<Profile> {
  // First, verify which sources are about the same person
  const verifiedSources = await verifyAndFilterSources(subject.name, sources);

  // Then generate the profile
  const { aliases, profileSummary } = await createProfileSummary(
    subject.name,
    verifiedSources
  );

  return {
    name: subject.name,
    aliases,
    profileSummary,
    sources: verifiedSources.map((s) => ({
      url: s.url,
      siteSummary: s.summary,
      depth: s.depth,
    })),
  };
}

async function verifyAndFilterSources(
  subjectName: string,
  sources: SourceSummary[]
): Promise<SourceSummary[]> {
  if (sources.length === 0) {
    return [];
  }

  // Sort sources by depth (lower depth = more trustworthy)
  const sortedSources = [...sources].sort((a, b) => a.depth - b.depth);

  const prompt = `Given these sources found online, determine which ones are about the same person named "${subjectName}".

Sources:
${sortedSources.map((s, i) => `
[Source ${i + 1}] (Depth: ${s.depth})
URL: ${s.url}
Summary: ${s.summary}
`).join('\n')}

Analyze these sources and determine which ones refer to the same person. Lower depth sources are more reliable.

Return a JSON array of source indices (1-based) that are about the same person. If sources conflict or seem to be about different people with the same name, only include the most reliable ones (lower depth).

Return ONLY a JSON array of numbers, e.g., [1, 2, 4, 5]. No other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert OSINT analyst who can determine if multiple sources refer to the same person. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content?.trim() || '[]';
    const validIndices: number[] = JSON.parse(content);

    // Filter sources based on valid indices
    return sortedSources.filter((_, index) => 
      validIndices.includes(index + 1)
    );
  } catch (error) {
    console.error('Error verifying sources:', error);
    // Fallback: return all sources with depth <= 3
    return sortedSources.filter(s => s.depth <= 3);
  }
}

async function createProfileSummary(
  subjectName: string,
  sources: SourceSummary[]
): Promise<{ aliases: string[]; profileSummary: string }> {
  if (sources.length === 0) {
    return {
      aliases: [],
      profileSummary: `No reliable information found for ${subjectName}.`,
    };
  }

  const prompt = `Based on these verified sources about ${subjectName}, create a comprehensive profile summary.

Sources (sorted by reliability):
${sources.map((s, i) => `
[Source ${i + 1}] (Depth: ${s.depth})
${s.summary}
`).join('\n')}

Generate:
1. A list of aliases/usernames found (if any)
2. A comprehensive profile summary combining information from all sources

Lower depth sources are more reliable. If sources conflict, trust lower depth sources.

Return a JSON object with:
{
  "aliases": ["alias1", "username2", ...],
  "profileSummary": "A comprehensive summary paragraph..."
}

Return ONLY valid JSON. No other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert OSINT analyst creating comprehensive profiles from multiple sources. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content?.trim() || '{}';
    const result = JSON.parse(content);

    return {
      aliases: result.aliases || [],
      profileSummary: result.profileSummary || `Information found about ${subjectName} from ${sources.length} sources.`,
    };
  } catch (error) {
    console.error('Error creating profile summary:', error);
    
    // Fallback: create a simple summary
    return {
      aliases: [],
      profileSummary: `Profile based on ${sources.length} source(s). ${sources[0]?.summary.substring(0, 200)}...`,
    };
  }
}

