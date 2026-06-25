import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'You are a strict coding assistant. Only answer questions related to programming. If the user asks about anything else, reply: "I can only assist with coding-related questions."' 
      },
      ...messages,
    ],
  });

  return Response.json({ reply: response.choices[0].message.content });
}