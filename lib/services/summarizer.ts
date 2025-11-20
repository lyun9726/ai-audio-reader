import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

interface SummaryResult {
  summary: string
  keyTakeaways: string[]
  reflectionQuestion: string
}

/**
 * Generate a summary for given paragraphs
 */
export async function generateSummary(
  paragraphs: string[],
  scope: 'today' | 'chapter' | 'range' = 'today'
): Promise<SummaryResult> {
  const combinedText = paragraphs.join('\n\n')

  const systemPrompt = `You are an assistant that creates concise study notes. Given the following text paragraphs, produce:
1) A 3-5 sentence summary of the main points
2) 5 bullet point key takeaways
3) One thought-provoking question for reflection

Format your response as JSON with the following structure:
{
  "summary": "Your 3-5 sentence summary here",
  "keyTakeaways": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
  "reflectionQuestion": "Your reflection question here"
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: combinedText },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content || '{}'
    const result = JSON.parse(content)

    return {
      summary: result.summary || '',
      keyTakeaways: result.keyTakeaways || [],
      reflectionQuestion: result.reflectionQuestion || '',
    }
  } catch (error: any) {
    console.error('Summary generation error:', error)
    throw new Error(`Summary generation failed: ${error.message}`)
  }
}

/**
 * Generate a mind map structure from chapter summaries
 */
export async function generateMindMap(
  chapterSummaries: Array<{ chapterNumber: number; summary: string }>
): Promise<any> {
  const systemPrompt = `You are an assistant that converts book chapters into a hierarchical mind map. Given chapter titles and summaries, output JSON in this format:
{
  "title": "Book Overview",
  "nodes": [
    {
      "id": "ch1",
      "label": "Chapter 1 Title",
      "summary": "Brief summary",
      "children": [
        { "id": "ch1_1", "label": "Key Point 1" },
        { "id": "ch1_2", "label": "Key Point 2" }
      ]
    }
  ]
}`

  const chaptersText = chapterSummaries
    .map(ch => `Chapter ${ch.chapterNumber}:\n${ch.summary}`)
    .join('\n\n')

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: chaptersText },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content || '{}'
    return JSON.parse(content)
  } catch (error: any) {
    console.error('Mind map generation error:', error)
    throw new Error(`Mind map generation failed: ${error.message}`)
  }
}
