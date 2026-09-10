'use client'

import { useState } from 'react'
import type { FieldSpec } from '@/lib/content'
import { MAX_TEXT_LENGTH, MAX_TEXTAREA_LENGTH } from '@/lib/content'

interface ItemEditorProps {
  fields: FieldSpec[]
  initial?: object
  submitLabel: string
  onSubmit: (values: Record<string, string | number>) => void
  onCancel: () => void
}

const labelClass = 'text-[10px] font-mono text-muted tracking-[0.15em] uppercase'
const inputClass =
  'w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-200'

export default function ItemEditor({ fields, initial, submitLabel, onSubmit, onCancel }: ItemEditorProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const seed = (initial ?? {}) as Record<string, unknown>
    return Object.fromEntries(
      fields.map((field) => [field.key, seed[field.key] === undefined ? '' : String(seed[field.key])]),
    )
  })

  const incomplete = fields.some((field) => field.required && !values[field.key].trim())

  function set(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (incomplete) return

    const out: Record<string, string | number> = {}
    for (const field of fields) {
      const raw = values[field.key].trim()
      if (!raw) continue
      out[field.key] = field.type === 'number' ? Number(raw) : raw
    }
    onSubmit(out)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-4 rounded-xl bg-surface border border-border flex flex-col gap-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.key}
            className={`flex flex-col gap-1.5 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}
          >
            <span className={labelClass}>
              {field.label}
              {!field.required && <span className="opacity-50"> (optional)</span>}
            </span>
            {field.type === 'textarea' ? (
              <textarea
                value={values[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                rows={3}
                maxLength={MAX_TEXTAREA_LENGTH}
                className={`${inputClass} resize-y leading-relaxed`}
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                inputMode={field.type === 'number' ? 'numeric' : undefined}
                value={values[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                maxLength={field.type === 'number' ? undefined : MAX_TEXT_LENGTH}
                className={inputClass}
              />
            )}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={incomplete}
          className="px-4 py-1.5 rounded-full bg-accent text-background text-[11px] font-mono tracking-[0.1em] uppercase transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 rounded-full border border-border text-muted text-[11px] font-mono tracking-[0.1em] uppercase hover:text-foreground transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
