export type NotificationFrequency = 'realtime' | 'daily' | 'weekly'

export type Role = 'ceo' | 'cto' | 'cmo' | 'cfo' | 'default'

export type AiStructuredProfile = {
  accepted_categories: string[]
  rejected_categories: string[]
  objectives: string[]
  green_flags: string[]
  red_flags: string[]
  key_context: string
}

export type OnboardingData = {
  // Step 1
  fullName: string
  jobTitle: string
  companyName: string
  companyDescription: string
  // Step 2
  professionalContext: string
  // Step 3
  outreachProfile: string
  // Step 4
  currentFocus: string
  // Step 5
  notificationEmail: string
  notificationEmailEnabled: boolean
  notificationSmsCountry: string
  notificationSms: string
  notificationSmsEnabled: boolean
  notificationFrequency: NotificationFrequency
}

export function createInitialData(email = ''): OnboardingData {
  return {
    fullName: '',
    jobTitle: '',
    companyName: '',
    companyDescription: '',
    professionalContext: '',
    outreachProfile: '',
    currentFocus: '',
    notificationEmail: email,
    notificationEmailEnabled: true,
    notificationSmsCountry: '+1',
    notificationSms: '',
    notificationSmsEnabled: false,
    notificationFrequency: 'realtime',
  }
}

export function generateUsername(fullName: string): string {
  return (
    fullName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'user'
  )
}

export function detectRole(jobTitle: string): Role {
  const t = jobTitle.toLowerCase()
  if (/ceo|founder|co-founder|director general|managing director|general manager/.test(t)) return 'ceo'
  if (/cto|engineering|technical|technology|infrastructure|platform/.test(t)) return 'cto'
  if (/cmo|marketing|growth|brand|demand/.test(t)) return 'cmo'
  if (/cfo|finance|financial|treasury|accounting/.test(t)) return 'cfo'
  return 'default'
}
