import { useCallback, useMemo, useState } from 'react'

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장이 막혀도(사파리 프라이빗 등) 데모는 계속 동작해야 한다
  }
}

export function newId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

// 시드 + 로컬 작성분 병합 리스트. 로컬분이 항상 앞(최신순)에 온다.
export function useLocalList<T extends { id: string }>(key: string, seed: T[]) {
  const [local, setLocal] = useState<T[]>(() => readJSON<T[]>(key, []))

  const items = useMemo(() => [...local, ...seed], [local, seed])
  const localIds = useMemo(() => new Set(local.map((item) => item.id)), [local])

  const add = useCallback(
    (item: T) => {
      setLocal((prev) => {
        const next = [item, ...prev]
        writeJSON(key, next)
        return next
      })
    },
    [key],
  )

  const remove = useCallback(
    (id: string) => {
      setLocal((prev) => {
        const next = prev.filter((item) => item.id !== id)
        writeJSON(key, next)
        return next
      })
    },
    [key],
  )

  return { items, localIds, add, remove }
}
