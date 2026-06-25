import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL; // full URL to your Gemini/Generative API endpoint

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // If Gemini is configured, prefer calling Gemini endpoint
    if (!GEMINI_API_KEY || !GEMINI_API_URL) {
      return NextResponse.json(
        { error: 'Gemini is not configured. Set GEMINI_API_KEY and GEMINI_API_URL.' },
        { status: 500 }
      );
    }

    try {
      const inputText = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');

      // Google Gemini API expects the key as a query parameter and a specific body format
      const apiUrl = new URL(GEMINI_API_URL);
      apiUrl.searchParams.append('key', GEMINI_API_KEY);

      let gemRes;
      let maxRetries = 3;
      let backoffDelay = 2000;

      for (let i = 0; i < maxRetries; i++) {
        gemRes = await fetch(apiUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: inputText,
                  },
                ],
              },
            ],
          }),
        });

        if (gemRes.ok || (gemRes.status !== 503 && gemRes.status !== 429)) {
          break;
        }

        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          backoffDelay *= 2;
        }
      }

      if (!gemRes) {
        return NextResponse.json({ error: 'Failed to execute fetch request' }, { status: 500 });
      }

      const text = await gemRes.text();
      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch {}

      if (!gemRes.ok) {
        const errMessage = parsed?.error?.message || parsed?.error || parsed?.message || text || 'Gemini request failed';
        return NextResponse.json({ error: errMessage }, { status: gemRes.status || 500 });
      }

      if (text.trim().startsWith('<')) {
        return NextResponse.json(
          { error: 'Gemini endpoint returned unexpected HTML. Verify GEMINI_API_URL and GEMINI_API_KEY.' },
          { status: 500 }
        );
      }

      const reply = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
        || parsed?.output?.[0]?.content?.[0]?.text
        || parsed?.reply
        || parsed?.output
        || text;

      if (!reply || typeof reply !== 'string' || !reply.trim()) {
        const errMessage = parsed?.error?.message || 'Empty response from Gemini';
        return NextResponse.json({ error: errMessage }, { status: 500 });
      }

      return NextResponse.json({ reply });
    } catch (gerr: any) {
      console.error('Gemini call failed:', gerr);
      return NextResponse.json(
        { error: gerr?.message || 'Gemini request failed' },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('Chat API error:', err);
    const message = err?.error?.message || err?.message || 'Failed to generate response';
    const status = err?.status || (err?.code === 'insufficient_quota' ? 429 : 500);
    return NextResponse.json({ error: message }, { status });
  }
}