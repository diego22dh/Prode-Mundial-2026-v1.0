import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useNextMatch(userId) {
  const [nextMatch, setNextMatch] = useState(null)
  const [myPred, setMyPred] = useState(null)

  useEffect(() => {
    fetchNext()
  }, [userId])

  async function fetchNext() {
    // Próximo partido que todavía acepta pronósticos (>10 min)
    const cutoff = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'upcoming')
      .gt('match_date', cutoff)
      .order('match_date')
      .limit(1)

    if (!matches?.length) { setNextMatch(null); return }
    const match = matches[0]
    setNextMatch(match)

    if (userId) {
      const { data: pred } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .eq('match_id', match.id)
        .single()
      setMyPred(pred || null)
    }
  }

  return { nextMatch, myPred, refresh: fetchNext }
}
