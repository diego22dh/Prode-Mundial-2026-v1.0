import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useRefresh } from '../lib/refreshContext'

export function useNextMatch(userId) {
  const [nextMatch, setNextMatch] = useState(null)
  const [myPred, setMyPred] = useState(null)

  const fetchNext = useCallback(async () => {
    const cutoff = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'upcoming')
      .gt('match_date', cutoff)
      .order('match_date')
      .limit(1)

    if (!matches?.length) { setNextMatch(null); setMyPred(null); return }
    const match = matches[0]
    setNextMatch(match)

    if (userId) {
      const { data: pred } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .eq('match_id', match.id)
        .maybeSingle()
      setMyPred(pred || null)
    }
  }, [userId])

  const { tick } = useRefresh()
  useEffect(() => { fetchNext() }, [fetchNext, tick])

  return { nextMatch, myPred, refresh: fetchNext }
}
