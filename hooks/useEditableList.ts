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

  // The last array known to be on the server. A failed save reverts to this.
  const persistedRef = useRef<T[]>(initial)
  // Mirrors `items`, but updated synchronously: a mutation triggered before
  // React has re-rendered still builds on the previous one's result.
  const itemsRef = useRef<T[]>(initial)
  // Serializes requests so at most one PATCH is ever in flight. Each request
  // sends the whole list, so overlapping ones would race in the server.
  const chainRef = useRef<Promise<void>>(Promise.resolve())
  // Set when a save fails. Saves already queued behind it are skipped, because
  // the state they would persist has just been reverted.
  const abortedRef = useRef(false)

  useEffect(() => {
    setItems(initial)
    persistedRef.current = initial
    itemsRef.current = initial
  }, [initial])

  function save(next: T[], itemId: string | null) {
    itemsRef.current = next
    setItems(next)
    setError(null)
    abortedRef.current = false

    function revert(message: string) {
      abortedRef.current = true
      itemsRef.current = persistedRef.current
      setItems(persistedRef.current)
      setError({ itemId, message })
    }

    // `next` is captured here rather than read back from a ref at execution
    // time: the queued callback runs in a microtask, which can beat React's
    // commit, so a ref read could still see the pre-edit array.
    chainRef.current = chainRef.current.then(async () => {
      if (abortedRef.current) return

      try {
        const res = await fetch('/api/admin/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [listKey]: next }),
        })
        if (!res.ok) {
          revert(res.status === 401 ? SESSION_EXPIRED : SAVE_FAILED)
          return
        }
        persistedRef.current = next
      } catch {
        revert(SAVE_FAILED)
      }
    })
  }

  async function addItem(values: Record<string, string | number>) {
    const current = itemsRef.current
    const name = typeof values.name === 'string' ? values.name : ''
    const id = makeId(name, current.map((item) => item.id))
    save([...current, { ...values, id } as unknown as T], null)
  }

  async function updateItem(id: string, values: Record<string, string | number>) {
    save(
      itemsRef.current.map((item) => (item.id === id ? ({ ...values, id } as unknown as T) : item)),
      id,
    )
  }

  async function removeItem(id: string) {
    save(itemsRef.current.filter((item) => item.id !== id), id)
  }

  return { items, error, addItem, updateItem, removeItem }
}
