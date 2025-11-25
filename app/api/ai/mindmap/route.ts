import { NextRequest, NextResponse } from 'next/server'
import type { AIRequest, MindmapResponse } from '@/lib/ai/types'
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

    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    if (!openaiKey && !anthropicKey) {
      // Demo mode
      return NextResponse.json<MindmapResponse>({
        title: 'Article Overview',
        nodes: [
          {
            title: 'Main Topic',
            children: [
              { title: 'Key Concept 1' },
              { title: 'Key Concept 2' },
            ],
          },
          {
            title: 'Supporting Ideas',
            children: [
              {
                title: 'Point A',
                children: [
                  { title: 'Detail 1' },
                  { title: 'Detail 2' },
                ],
              },
              { title: 'Point B' },
            ],
          },
          {
            title: 'Conclusion',
          },
        ],
      })
    }

    // Use OpenAI
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
              content: 'You are a helpful assistant that creates hierarchical mind maps. Respond with JSON: { "title": string, "nodes": Array<{ "title": string, "children"?: Node[] }> }',
            },
            {
              role: 'user',
              content: `Create a mind map for the following text:\n\n${truncatedText}`,
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

      return NextResponse.json<MindmapResponse>(result)
    }

    // Use Claude
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
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: `Create a hierarchical mind map for the following text and respond with JSON: { "title": string, "nodes": Array<{ "title": string, "children"?: Node[] }> }\n\nText:\n${truncatedText}`,
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

      return NextResponse.json<MindmapResponse>(result)
    }

    return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 })
  } catch (error: any) {
    console.error('[AI Mindmap Error]', error)
    return NextResponse.json(
      { error: error.message || 'Mindmap generation failed' },
      { status: 500 }
    )
  }
}
