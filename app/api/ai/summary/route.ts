import { NextRequest, NextResponse } from 'next/server'
import type { AIRequest, SummaryResponse } from '@/lib/ai/types'
import { extractTextFromBlocks, truncateText } from '@/lib/ai/utils'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { blocks }: AIRequest = await req.json()

    if (!blocks || blocks.length === 0) {
      return NextResponse.json({ error: 'Blocks are required' }, { status: 400 })
    }

    const text = extractTextFromBlocks(blocks)
    const truncatedText = truncateText(text, 3000)

    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    if (!openaiKey && !anthropicKey) {
      // Demo mode
      return NextResponse.json<SummaryResponse>({
        summary: 'This is a demo summary of the article. The main topic discusses key concepts and important points.',
        keyPoints: [
          'First key point from the article',
          'Second important takeaway',
          'Third significant insight',
        ],
        mainIdea: 'The central theme revolves around the core concepts presented in the text.',
      })
    }

    // Use OpenAI if available
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise summaries. Respond with JSON: { "summary": string, "keyPoints": string[], "mainIdea": string }',
            },
            {
              role: 'user',
              content: `Please summarize the following text:\n\n${truncatedText}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        throw new Error('OpenAI API failed')
      }

      const data = await response.json()
      const result = JSON.parse(data.choices[0].message.content)

      return NextResponse.json<SummaryResponse>(result)
    }

    // Use Claude if available
    if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Please summarize the following text and respond with JSON: { "summary": string, "keyPoints": string[], "mainIdea": string }\n\nText:\n${truncatedText}`,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('Claude API failed')
      }

      const data = await response.json()
      const content = data.content[0].text
      const result = JSON.parse(content)

      return NextResponse.json<SummaryResponse>(result)
    }

    return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 })
  } catch (error: any) {
    console.error('[AI Summary Error]', error)
    return NextResponse.json(
      { error: error.message || 'Summary generation failed' },
      { status: 500 }
    )
  }
}
