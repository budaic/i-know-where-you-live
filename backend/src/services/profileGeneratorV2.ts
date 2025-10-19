import OpenAI from 'openai';
import { config } from '../config';
import { Profile, ProfileCreationLog, Source } from '../types';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

/**
 * Generate profile from ProfileCreationLog
 */
export async function generateProfileFromLog(log: ProfileCreationLog): Promise<Profile> {
  console.log('\n=== Generating Profile ===');
  console.log(`Subject: ${log.subjectName}`);
  console.log(`High-quality sources: ${log.finalSources.length}`);

  if (log.finalSources.length === 0) {
    return {
      name: log.subjectName,
      aliases: [],
      profileSummary: `No reliable information found for ${log.subjectName} matching the provided context.`,
      sources: [],
      hardContext: log.hardContext,
      softContext: log.softContext,
      generatedContext: log.generatedContext,
      searchLogs: log.searchLogs,
    };
  }

  // Generate aliases and profile summary
  const { aliases, profileSummary } = await createProfileSummary(
    log.subjectName,
    log.finalSources,
    log.generatedContext
  );

  // Convert ValidationResults to Sources
  console.log('\n=== DEBUG: Converting Final Sources ===');
  console.log(`Number of final sources: ${log.finalSources.length}`);
  log.finalSources.forEach((source, index) => {
    console.log(`Source ${index + 1}:`, {
      url: source.url,
      reasoning: source.reasoning,
      relevancyScore: source.relevancyScore,
      confidence: source.confidence,
      samePersonElements: source.samePersonElements
    });
  });

  const sources: Source[] = log.finalSources.map(source => ({
    url: source.url,
    siteSummary: source.reasoning,
    depth: 0, // All sources are from the new validated system
    relevancyScore: source.relevancyScore,
    validationReasoning: source.reasoning,
    confidence: source.confidence,
  }));

  console.log('Converted sources:', sources);
  console.log('=== END DEBUG ===\n');

  return {
    name: log.subjectName,
    aliases,
    profileSummary,
    sources,
    hardContext: log.hardContext,
    softContext: log.softContext,
    generatedContext: log.generatedContext,
    searchLogs: log.searchLogs,
  };
}

/**
 * Create profile summary with strict alias rules
 */
async function createProfileSummary(
  subjectName: string,
  sources: any[],
  generatedContext: any
): Promise<{ aliases: string[]; profileSummary: string }> {
  console.log('\n=== DEBUG: Generated Context Structure ===');
  console.log('Generated Context:', JSON.stringify(generatedContext, null, 2));
  console.log('LinkedIn Data:', generatedContext.linkedinData);
  console.log('GitHub Data:', generatedContext.githubData);
  console.log('Website Data:', generatedContext.websiteData);
  console.log('Additional Findings:', generatedContext.additionalFindings);
  console.log('=== END DEBUG ===\n');

  const generatedContextText = [
    generatedContext.linkedinData,
    generatedContext.githubData,
    generatedContext.websiteData,
    ...(generatedContext.additionalFindings || []),
  ]
    .filter(Boolean)
    .join(' | ');

  console.log('Final Generated Context Text:', generatedContextText);

  const sourcesText = sources
    .map((s, i) => `[Source ${i + 1}] (Score: ${s.relevancyScore}/10)\nURL: ${s.url}\nReasoning: ${s.reasoning}`)
    .join('\n\n');

  const prompt = `Based on verified sources about ${subjectName}, create a comprehensive profile summary and extract aliases.

Generated Context (from validated profiles):
${generatedContextText}

High-Quality Sources (Score 6-10):
${sourcesText}

STRICT ALIAS RULES:
- ONLY extract exact usernames, profile names, or internet IDs
- Aliases MUST directly relate to the subject's actual first/last names
- Valid examples: "john_smith", "jsmith123", "johnsmith", "j.smith"
- INVALID examples: "johnny" (nickname), "jack" (different name), any name that doesn't match first/last
- DO NOT include variations of first names that are different (John → Johnny is NOT valid)
- DO NOT include completely different names
- If no valid aliases exist, return empty array

Generate:
1. A list of STRICT aliases following the rules above
2. A comprehensive profile summary combining all information

Return ONLY valid JSON:
{
  "aliases": ["username1", "profile_name2"],
  "profileSummary": "A comprehensive summary paragraph..."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an expert OSINT analyst creating profiles with STRICT alias rules. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 1,
      max_completion_tokens: 1000,
    });

    const content = response.choices[0].message.content?.trim() || '{}';
    const result = JSON.parse(content);

    // Additional validation: filter aliases to ensure they match name
    const validAliases = validateAliases(subjectName, result.aliases || []);

    return {
      aliases: validAliases,
      profileSummary:
        result.profileSummary ||
        `Profile based on ${sources.length} high-quality source(s) with scores 6-10.`,
    };
  } catch (error) {
    console.error('Error creating profile summary:', error);

    return {
      aliases: [],
      profileSummary: `Profile based on ${sources.length} validated source(s). ${generatedContextText || ''}`,
    };
  }
}

/**
 * Validate aliases against strict rules
 */
function validateAliases(fullName: string, aliases: string[]): string[] {
  const nameParts = fullName.toLowerCase().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];

  return aliases.filter(alias => {
    const aliasLower = alias.toLowerCase();
    
    // Must contain some form of the actual first or last name
    // Not nickname variations
    const containsFirstName = aliasLower.includes(firstName);
    const containsLastName = aliasLower.includes(lastName);
    
    // Check if it's a common username pattern (name + numbers, name_name, etc.)
    const isValidPattern = /^[a-z]+[_\-.]?[a-z]*\d*$/i.test(alias);
    
    return (containsFirstName || containsLastName) && isValidPattern;
  });
}

