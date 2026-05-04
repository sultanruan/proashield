import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendPassEmail } from '@/lib/notifications/sendPassEmail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      username,
      verdict,
      score,
      category,
      summary,
      reason,
      transcript,
      prompt_snapshot,
    } = body

    // Look up exec_profile_id
    const supabase = await createServerSupabaseClient()

    // Extract seller_id from the authenticated session (server-side, not client-provided)
    const { data: { user } } = await supabase.auth.getUser()
    const seller_id: string | null = user?.id ?? null
    const { data: profile } = await supabase
      .from('exec_profiles')
      .select('id, notification_email, full_name')
      .eq('username', username)
      .maybeSingle()

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get sender info from seller profile if user is logged in
    let senderEmail = ''
    let senderName = ''
    let senderCompany = ''

    if (seller_id) {
      const { data: sellerUser } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', seller_id)
        .single()

      if (sellerUser) {
        senderEmail = sellerUser.email ?? ''
        senderName = sellerUser.full_name ?? ''
      }

      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('company_name, full_name')
        .eq('user_id', seller_id)
        .maybeSingle()

      if (sellerProfile) {
        senderCompany = sellerProfile.company_name ?? ''
        if (!senderName) senderName = sellerProfile.full_name ?? ''
      }
    }

    const statusMap: Record<string, string> = { pass: 'passed', hold: 'pending', fail: 'failed' }

    // Use admin client to bypass RLS for insert
    const admin = createAdminClient()
    await admin.from('conversations').insert({
      exec_profile_id: profile.id,
      seller_id: seller_id ?? null,
      sender_name: senderName,
      sender_company: senderCompany,
      sender_email: senderEmail,
      verdict: verdict as 'pass' | 'hold' | 'fail',
      status: statusMap[verdict] ?? 'pending',
      score,
      category,
      summary,
      reason,
      transcript,
      prompt_snapshot: prompt_snapshot ?? '',
    })

    // Fire notifications — never block the response on email success
    if (verdict === 'pass' && profile.notification_email) {
      await Promise.allSettled([
        sendPassEmail({
          execNotificationEmail: profile.notification_email,
          execFirstName: profile.full_name?.split(' ')[0] ?? '',
          senderName,
          senderCompany,
          category: category ?? '',
          score: score ?? 0,
          summary: summary ?? '',
          reason: reason ?? '',
        }),
      ])
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Save conversation error:', err)
    return Response.json({ error: 'Failed to save' }, { status: 500 })
  }
}
