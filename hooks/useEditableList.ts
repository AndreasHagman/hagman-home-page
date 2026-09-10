'use client'

import { useEffect, useRef, useState } from 'react'
import { makeId, type ListKey } from '@/lib/content'

export interface EditableListError {
  itemId: string | null
  message: string
}

const SAVE_FAILED = 'Could not save'
const SESSION_EXPIRED = 'Session expired — sign in again'

export function useEditableList<T extends { id: string }>(listKey: ListKey, initial: T[]) {
  const [items, setItems] = useState<T[]>(initial)
  const [error, setError] = useState<EditableListError | null>(null)

  const persistedRef = useRef<T[]>(initial)
  const saveChainRef = useRef<Promise<void>>(Promise.resolve())
  const itemsRef = useRef<T[]>(initial)

  useEffect(() => {
    setItems(initial)
    persistedRef.current = initial
    itemsRef.current = initial
  }, [initial])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  async function save(next: T[], itemId: string | null) {
    setItems(next)
    setError(null)

    saveChainRef.current = saveChainRef.current.then(async () => {
      const toSave = itemsRef.current

      try {
        const res = await fetch('/api/admin/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [listKey]: toSave }),
        })
        if (!res.ok) {
          setItems(persistedRef.current)
          setError({ itemId, message: res.status === 401 ? SESSION_EXPIRED : SAVE_FAILED })
          saveChainRef.current = Promise.resolve()
        } else {
          persistedRef.current = toSave
          setError(null)
        }
      } catch {
        setItems(persistedRef.current)
        setError({ itemId, message: SAVE_FAILED })
        saveChainRef.current = Promise.resolve()
      }
    })

    await saveChainRef.current
  }

  async function addItem(values: Record<string, string | number>) {
    const name = typeof values.name === 'string' ? values.name : ''
    const id = makeId(name, items.map((item) => item.id))
    await save([...items, { ...values, id } as unknown as T], null)
  }

  async function updateItem(id: string, values: Record<string, string | number>) {
    await save(
      items.map((item) => (item.id === id ? ({ ...values, id } as unknown as T) : item)),
      id,
    )
  }

  async function removeItem(id: string) {
    await save(items.filter((item) => item.id !== id), id)
  }

  return { items, error, addItem, updateItem, removeItem }
}
