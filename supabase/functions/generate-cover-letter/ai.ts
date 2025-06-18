
import { GenerationResult } from './types.ts'

export async function generateCoverLetterWithAI(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.7
): Promise<GenerationResult> {
  const startTime = Date.now()

  // Ensure temperature is within valid range (0.0 to 2.0)
  const validTemperature = Math.max(0.0, Math.min(2.0, temperature));

  console.log(`Generating cover letter with temperature: ${validTemperature}`);

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: validTemperature,
      max_tokens: 1000,
    }),
  })

  if (!openaiResponse.ok) {
    throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
  }

  const openaiData = await openaiResponse.json()
  const content = openaiData.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content generated from OpenAI')
  }

  const processingTime = Date.now() - startTime
  const tokensUsed = openaiData.usage?.total_tokens || 0
  const costEstimate = (tokensUsed / 1000) * 0.0001 // Rough estimate for gpt-4o-mini

  return {
    content,
    processingTime,
    tokensUsed,
    costEstimate
  }
}
