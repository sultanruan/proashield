'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { OnboardingData } from '../types'
import { Input, StepHeader, StepFooter, ErrorMsg } from './primitives'

interface Props {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const MAX_OBJECTIVES = 10
const PLACEHOLDERS = [
  'e.g. Complete SOC2 certification by Q3',
  'e.g. Migrate off legacy monolith to microservices',
  'e.g. Reduce infrastructure costs by 20%',
  'e.g. Launch in two new European markets',
  'e.g. Hire a VP of Sales',
]

export function Step3Objectives({ data, onChange, onNext, onBack }: Props) {
  const hasAtLeastOne = data.objectives.some((o) => o.trim() !== '')

  function updateObjective(index: number, value: string) {
    const updated = [...data.objectives]
    updated[index] = value
    onChange({ objectives: updated })
  }

  function addObjective() {
    if (data.objectives.length >= MAX_OBJECTIVES) return
    onChange({ objectives: [...data.objectives, ''] })
  }

  function removeObjective(index: number) {
    if (data.objectives.length <= 1) return
    const updated = data.objectives.filter((_, i) => i !== index)
    onChange({ objectives: updated })
  }

  return (
    <>
      <StepHeader
        title="What are you focused on right now?"
        subtitle="Your AI uses these to decide whether inbound outreach is relevant to you."
      />

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {data.objectives.map((obj, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center justify-center w-6 h-6 shrink-0 rounded-full bg-[#F4F4F5] text-[#A1A1AA] text-xs font-medium">
                {i + 1}
              </div>
              <Input
                placeholder={PLACEHOLDERS[i % PLACEHOLDERS.length]}
                value={obj}
                onChange={(e) => updateObjective(i, e.target.value)}
              />
              {data.objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeObjective(i)}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-[#A1A1AA] hover:text-red-400 hover:bg-red-50 transition-colors duration-150"
                  aria-label="Remove objective"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {!hasAtLeastOne && (
          <ErrorMsg message="Add at least one objective to continue." />
        )}

        {data.objectives.length < MAX_OBJECTIVES && (
          <button
            type="button"
            onClick={addObjective}
            className="self-start mt-1 inline-flex items-center gap-1.5 text-sm text-[#0EA5E9] hover:text-[#0284C7] transition-colors duration-150 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add another objective
          </button>
        )}
      </div>

      <StepFooter
        onBack={onBack}
        onContinue={onNext}
        continueDisabled={!hasAtLeastOne}
      />
    </>
  )
}
