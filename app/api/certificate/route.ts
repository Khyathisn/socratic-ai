import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const { problemTitle, mode, messages, questionCount, language } = await req.json()

    const conversation = messages.map((m: any) => 
      `${m.role === 'assistant' ? 'AI' : 'Student'}: ${m.content}` 
    ).join('\n\n')

    const prompt = `Analyze this Socratic learning session and generate a certificate of understanding.

PROBLEM/TOPIC: ${problemTitle}
MODE: ${mode}
LANGUAGE: ${language || 'N/A'}
QUESTIONS USED: ${questionCount} of 5

CONVERSATION:
${conversation}

SCORING RULES:
- Student used ${questionCount} questions out of 5
- Fewer questions = better understanding = higher score
- If questionCount <= 2: score should be 90-100, grade A or A+
- If questionCount <= 3: score should be 75-89, grade B+ or A-  
- If questionCount <= 4: score should be 60-74, grade B or B-
- If questionCount === 5: score should be 50-59, grade C+ or C
- Calculate score and grade based on this

Generate a JSON certificate with exactly this structure (no markdown, pure JSON):
{
  "conceptsmastered": ["concept1", "concept2", "concept3"],
  "reasoningpath": ["step1 of their thinking", "step2", "step3"],
  "strengths": ["strength1", "strength2"],
  "improvement": "one specific area to improve",
  "score": [dynamic score based on questionCount],
  "grade": [dynamic grade based on questionCount],
  "summary": "2 sentence summary of what of student demonstrated"
}`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Groq API error')
    
    const text = data.choices[0].message.content
    const clean = text.replace(/```json|```/g, '').trim()
    const certificate = JSON.parse(clean)
    
    return NextResponse.json({ certificate })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
