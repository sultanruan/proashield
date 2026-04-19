'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X, Lock } from 'lucide-react'
import { OnboardingData, CategoryItem, CustomCategory } from '../types'
import { Field, Input, Textarea, StepHeader, StepFooter, SectionTitle, ErrorMsg } from './primitives'

interface Props {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const NOTES_PLACEHOLDER: Record<string, string> = {
  recruiting: 'e.g. Only C-level or director-level roles',
  investors: 'e.g. Series B+ only, no cold prospecting',
  partnerships: 'e.g. Integration partnerships only, no reseller agreements',
  events: 'e.g. Speaking slots only, no sponsorship requests',
}

export function Step2Outreach({ data, onChange, onNext, onBack }: Props) {
  const [descError, setDescError] = useState('')

  function toggleCategory(id: string) {
    const updated = data.categories.map((c) =>
      c.id === id && !c.locked ? { ...c, enabled: !c.enabled, notes: c.enabled ? '' : c.notes } : c
    )
    onChange({ categories: updated })
  }

  function updateCategoryNotes(id: string, notes: string) {
    const updated = data.categories.map((c) => (c.id === id ? { ...c, notes } : c))
    onChange({ categories: updated })
  }

  function addCustomCategory() {
    const newCat: CustomCategory = {
      id: `custom-${Date.now()}`,
      name: '',
      notes: '',
    }
    onChange({ customCategories: [...data.customCategories, newCat] })
  }

  function updateCustomCategory(id: string, field: 'name' | 'notes', value: string) {
    const updated = data.customCategories.map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    )
    onChange({ customCategories: updated })
  }

  function removeCustomCategory(id: string) {
    onChange({ customCategories: data.customCategories.filter((c) => c.id !== id) })
  }

  function handleContinue() {
    if (!data.outreachDescription.trim()) {
      setDescError('Please describe the outreach you receive.')
      return
    }
    setDescError('')
    onNext()
  }

  // Categories that are enabled and have a notes field
  const enabledNotesCategories = data.categories.filter(
    (c) => c.enabled && !c.locked && c.hasNotes
  )

  return (
    <>
      <StepHeader
        title="What outreach do you receive?"
        subtitle="Help your AI understand your inbox so it can protect it."
      />

      <div className="flex flex-col gap-4">
        {/* Description textarea */}
        <Field label="Describe the outreach you typically receive">
          <Textarea
            placeholder="e.g. Mainly SaaS vendors, occasional recruiters, and a lot of event invitations I don't care about…"
            rows={4}
            value={data.outreachDescription}
            onChange={(e) => {
              onChange({ outreachDescription: e.target.value })
              if (e.target.value.trim()) setDescError('')
            }}
          />
          <ErrorMsg message={descError} />
        </Field>

        {/* Accept section */}
        <div>
          <SectionTitle>What will you accept?</SectionTitle>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {data.categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                onToggle={() => toggleCategory(cat.id)}
              />
            ))}
          </div>

          {/* Notes inputs for enabled categories */}
          <AnimatePresence initial={false}>
            {enabledNotesCategories.map((cat) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <Field label={`${cat.name} — any specific criteria?`}>
                  <Input
                    placeholder={NOTES_PLACEHOLDER[cat.id] ?? 'Optional criteria…'}
                    value={cat.notes}
                    onChange={(e) => updateCategoryNotes(cat.id, e.target.value)}
                  />
                </Field>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Custom categories */}
          <AnimatePresence initial={false}>
            {data.customCategories.map((cc) => (
              <motion.div
                key={cc.id}
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="flex flex-col gap-2 p-3.5 rounded-lg border border-[#E4E4E7] bg-[#FAFAFA]">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Category name (e.g. Academia / Research)"
                      value={cc.name}
                      onChange={(e) => updateCustomCategory(cc.id, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomCategory(cc.id)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-[#A1A1AA] hover:text-[#09090B] hover:bg-[#F4F4F5] transition-colors duration-150"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Input
                    placeholder="Any specific criteria? (optional)"
                    value={cc.notes}
                    onChange={(e) => updateCustomCategory(cc.id, 'notes', e.target.value)}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add category button */}
          <button
            type="button"
            onClick={addCustomCategory}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#0EA5E9] hover:text-[#0284C7] transition-colors duration-150 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add a category
          </button>
        </div>
      </div>

      <StepFooter onBack={onBack} onContinue={handleContinue} />
    </>
  )
}

// ─── Category chip ─────────────────────────────────────────────────────────────

function CategoryChip({
  category,
  onToggle,
}: {
  category: CategoryItem
  onToggle: () => void
}) {
  const isActive = category.enabled

  if (category.locked) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#0EA5E9] bg-[#E0F2FE] text-[#0EA5E9] text-sm font-medium cursor-default select-none">
        <Lock className="w-3 h-3" />
        {category.name}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        isActive
          ? 'px-3.5 py-1.5 rounded-full border border-[#0EA5E9] bg-[#E0F2FE] text-[#0EA5E9] text-sm font-medium cursor-pointer transition-all duration-150'
          : 'px-3.5 py-1.5 rounded-full border border-[#E4E4E7] bg-white text-[#52525B] text-sm cursor-pointer hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-all duration-150'
      }
    >
      {category.name}
    </button>
  )
}
