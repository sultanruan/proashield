import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const SYSTEM_PROMPT = `You are ProaShield, an AI assistant that helps executives manage their professional inbound. Generate two things from the exec profile below:
1. A JSON structured profile (for internal AI screening use)
2. A natural language summary (shown to the exec)

Return ONLY valid JSON in this exact format:
{
  "structured": {
    "accepted_categories": ["string"],
    "rejected_categories": ["string"],
    "objectives": ["string"],
    "green_flags": ["string"],
    "red_flags": ["string"],
    "key_context": "string"
  },
  "summary": "A warm, 2-3 sentence paragraph in second person (you/your) describing what you understand about this executive — their role, what they care about, and what kind of outreach is relevant to them."
}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { professional_context, outreach_profile, current_focus } = body

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('exec_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

    // Save the three profile fields first
    await supabase
      .from('exec_profiles')
      .update({ professional_context, outreach_profile, current_focus })
      .eq('id', profile.id)

    const userMessage = `Professional context: ${professional_context ?? ''}
Outreach profile: ${outreach_profile ?? ''}
Current focus: ${current_focus ?? ''}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) return Response.json({ error: 'Claude API error' }, { status: 500 })

    const result = await response.json()
    const text: string = result.content?.[0]?.text ?? ''
    const parsed = JSON.parse(text)

    // Store structured profile with summary embedded so it persists across page loads
    await supabase
      .from('exec_profiles')
      .update({ ai_structured_profile: { ...parsed.structured, _summary: parsed.summary } })
      .eq('id', profile.id)

    return Response.json({ summary: parsed.summary })
  } catch {
    return Response.json({ error: 'Failed to regenerate shield' }, { status: 500 })
  }
}
