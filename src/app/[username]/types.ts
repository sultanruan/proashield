export type AiStructuredProfile = {
  accepted_categories: string[]
  rejected_categories: string[]
  objectives: string[]
  green_flags: string[]
  red_flags: string[]
  key_context: string
}

export type ExecProfile = {
  id: string
  username: string
  full_name: string
  job_title: string
  company_name: string
  company_description: string
  professional_context: string | null
  outreach_profile: string | null
  current_focus: string | null
  ai_structured_profile: AiStructuredProfile | null
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  hidden?: boolean
}

export type VerdictResult = {
  verdict: 'PASS' | 'HOLD' | 'FAIL'
  score: number
  category: string
  summary: string
  reason: string
}
