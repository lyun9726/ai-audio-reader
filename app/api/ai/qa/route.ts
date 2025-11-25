import { NextRequest } from 'next/server'
import type { AIRequest } from '@/lib/ai/types'
import { extractTextFromBlocks, truncateText } from '@/lib/ai/utils'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { blocks, question, context }: AIRequest = await req.json()

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const text = blocks ? extractTextFromBlocks(blocks) : ''
    const truncatedText = truncateText(text, 2000)

    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    if (!openaiKey && !anthropicKey) {
      // Demo mode: streaming response
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          const demoAnswer = `This is a demo answer to your question: "${question}". In a real implementation, this would provide a detailed, context-aware response based on the article content.`

          const words = demoAnswer.split(' ')
          let i = 0

          const interval = setInterval(() => {
            if (i < words.length) {
              controller.enqueue(encoder.encode(words[i] + ' '))
              i++
            } else {
              clearInterval(interval)
              controller.close()
            }
          }, 50)
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Use OpenAI streaming
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
              content: `You are a helpful assistant. Answer questions based on the following context:\n\n${truncatedText}`,
            },
            {
              role: 'user',
              content: question,
            },
          ],
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error('OpenAI API failed')
      }

      // Transform OpenAI SSE to plain text stream
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n').filter(line => line.trim() !== '')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') continue

                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices[0]?.delta?.content
                    if (content) {
                      controller.enqueue(encoder.encode(content))
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          } finally {
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Use Claude streaming
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
              content: `Context:\n${truncatedText}\n\nQuestion: ${question}`,
            },
          ],
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Claude API failed')
      }

      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n').filter(line => line.trim() !== '')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)

                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.type === 'content_block_delta') {
                      const content = parsed.delta?.text
                      if (content) {
                        controller.enqueue(encoder.encode(content))
                      }
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          } finally {
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    return new Response(JSON.stringify({ error: 'No AI provider configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[AI Q&A Error]', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Q&A failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
