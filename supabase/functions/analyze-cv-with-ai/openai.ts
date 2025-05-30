
import { createAnalysisPrompt } from './prompt.ts';
import { cleanAndParseJSON, validateEnhancedAnalysisResult } from './validation.ts';
import { EnhancedAIAnalysisResult } from './types.ts';

export const callOpenAIAnalysis = async (
  cvText: string,
  jobDescriptionText: string,
  jobTitle: string | undefined,
  openAIApiKey: string
): Promise<EnhancedAIAnalysisResult> => {
  const prompt = createAnalysisPrompt(cvText, jobDescriptionText, jobTitle);

  console.log('Calling OpenAI API with enhanced comprehensive prompt...');

  // Call OpenAI API with retry logic
  let openAIResponse;
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a senior career consultant and CV optimization expert with 15+ years of experience in talent acquisition, career coaching, and industry analysis. Your analysis is known for being thorough, comprehensive, and highly actionable. You provide detailed, multi-faceted analysis that matches professional career consulting standards. You always provide multiple detailed items for each analysis section to ensure comprehensive coverage. Always respond with valid JSON only, no additional text or formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        }),
      });

      if (openAIResponse.ok) {
        break;
      } else {
        console.error(`OpenAI API error (attempt ${attempts + 1}):`, openAIResponse.status);
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`OpenAI API error: ${openAIResponse.status}`);
        }
      }
    } catch (error) {
      console.error(`OpenAI request failed (attempt ${attempts + 1}):`, error);
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
    }
  }

  const openAIData = await openAIResponse.json();
  const aiResponseText = openAIData.choices[0].message.content;
  
  console.log('Enhanced OpenAI response received, length:', aiResponseText.length);

  // Parse and validate AI response
  try {
    const parsedResult = cleanAndParseJSON(aiResponseText);
    const analysisResult = validateEnhancedAnalysisResult(parsedResult);
    console.log('Enhanced AI response successfully parsed and validated');
    return analysisResult;
  } catch (parseError) {
    console.error('Failed to parse/validate enhanced AI response:', parseError);
    throw new Error(`Invalid AI response format: ${parseError.message}`);
  }
};
