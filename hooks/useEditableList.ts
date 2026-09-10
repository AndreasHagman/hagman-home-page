'use client'

import { useEffect, useRef, useState } from 'react'
import { makeId, type ListKey } from '@/lib/content'

export interface EditableListError {
  itemId: string | null
  message: string
}

const SAVE_FAILED = 'Could not save'
export const SESSION_EXPIRED = 'Session expired — sign in again'

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
    // A new `initial` is fresh ground truth from the server, so anything still
    // queued would persist state that has just been superseded.
    abortedRef.current = true
    setItems(initial)
    persistedRef.current = initial
    itemsRef.current = initial
    setError(null)
  }, [initial])

  function save(next: T[], itemId: string | null): Promise<boolean> {
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
    const savePromise = chainRef.current.then(async () => {
      if (abortedRef.current) return false

      try {
        const res = await fetch('/api/admin/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [listKey]: next }),
        })
        if (!res.ok) {
          revert(res.status === 401 ? SESSION_EXPIRED : SAVE_FAILED)
          return false
        }
        persistedRef.current = next
        return true
      } catch {
        revert(SAVE_FAILED)
        return false
      }
    })

    // Keep the chain non-rejecting so a failure cannot poison subsequent saves
    chainRef.current = savePromise.then(() => {}).catch(() => {})
    return savePromise
  }

  async function addItem(values: Record<string, string | number>): Promise<boolean> {
    const current = itemsRef.current
    const name = typeof values.name === 'string' ? values.name : ''
    const id = makeId(name, current.map((item) => item.id))
    return save([...current, { ...values, id } as unknown as T], null)
  }

  async function updateItem(id: string, values: Record<string, string | number>): Promise<boolean> {
    return save(
      itemsRef.current.map((item) => (item.id === id ? ({ ...values, id } as unknown as T) : item)),
      id,
    )
  }

  async function removeItem(id: string): Promise<boolean> {
    return save(itemsRef.current.filter((item) => item.id !== id), id)
  }

  return { items, error, addItem, updateItem, removeItem }
}
