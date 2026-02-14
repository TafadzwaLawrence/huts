import OpenAI from 'openai'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages,
  })

  // Create a readable stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          controller.enqueue(encoder.encode(content))
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
