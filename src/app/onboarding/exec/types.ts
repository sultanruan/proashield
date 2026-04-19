export type CategoryItem = {
  id: string
  name: string
  enabled: boolean
  locked?: boolean    // cannot be toggled off (e.g. Software vendors)
  hasNotes?: boolean  // shows a "criteria" input when enabled
  notes: string
}

export type CustomCategory = {
  id: string
  name: string
  notes: string
}

export type NotificationFrequency = 'realtime' | 'daily' | 'weekly'

export type OnboardingData = {
  // Step 1
  fullName: string
  jobTitle: string
  companyName: string
  companyDescription: string
  // Step 2
  outreachDescription: string
  categories: CategoryItem[]
  customCategories: CustomCategory[]
  // Step 3
  objectives: string[]
  // Step 4
  technicalRequirements: string
  // Step 5
  notificationEmail: string
  notificationEmailEnabled: boolean
  notificationSms: string
  notificationSmsEnabled: boolean
  notificationFrequency: NotificationFrequency
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'software',      name: 'Software vendors',        enabled: true,  locked: true,  hasNotes: false, notes: '' },
  { id: 'recruiting',    name: 'Recruiting',              enabled: false, locked: false, hasNotes: true,  notes: '' },
  { id: 'investors',     name: 'Investors / VC',          enabled: false, locked: false, hasNotes: true,  notes: '' },
  { id: 'partnerships',  name: 'Partnerships / BD',       enabled: false, locked: false, hasNotes: true,  notes: '' },
  { id: 'press',         name: 'Press / journalists',     enabled: false, locked: false, hasNotes: false, notes: '' },
  { id: 'events',        name: 'Events & speaking',       enabled: false, locked: false, hasNotes: true,  notes: '' },
  { id: 'consultancies', name: 'Consultancies & agencies',enabled: false, locked: false, hasNotes: false, notes: '' },
]

export function createInitialData(email = ''): OnboardingData {
  return {
    fullName: '',
    jobTitle: '',
    companyName: '',
    companyDescription: '',
    outreachDescription: '',
    categories: DEFAULT_CATEGORIES.map(c => ({ ...c })),
    customCategories: [],
    objectives: [''],
    technicalRequirements: '',
    notificationEmail: email,
    notificationEmailEnabled: true,
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
      .replace(/[\u0300-\u036f]/g, '')  // remove diacritics
      .replace(/[^a-z0-9\s]/g, '')      // remove special chars, keep spaces
      .trim()
      .replace(/\s+/g, '-')             // spaces → hyphens
    || 'user'
  )
}
