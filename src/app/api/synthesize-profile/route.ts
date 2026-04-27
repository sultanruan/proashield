import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `You are analyzing an executive's onboarding profile for ProaShield, an AI outreach firewall. Extract structured data from their free-text responses to power an AI screening system.

Return ONLY a valid JSON object with this exact structure, no preamble:
{
  "accepted_categories": ["string"],
  "rejected_categories": ["string"],
  "objectives": ["string"],
  "green_flags": ["string"],
  "red_flags": ["string"],
  "key_context": "2-3 sentence summary"
}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, job_title, company_name, company_description, professional_context, outreach_profile, current_focus } = body

    const userMessage = `Name: ${full_name}
Title: ${job_title}
Company: ${company_name}
Description: ${company_description}

Professional context: ${professional_context}
Outreach reality: ${outreach_profile}
Current focus: ${current_focus}

Extract the structured profile.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      return Response.json({ error: 'Claude API error' }, { status: 500 })
    }

    const result = await response.json()
    const text: string = result.content?.[0]?.text ?? ''

    const parsed = JSON.parse(text)
    return Response.json({ profile: parsed })
  } catch {
    return Response.json({ error: 'Failed to synthesize profile' }, { status: 500 })
  }
}
