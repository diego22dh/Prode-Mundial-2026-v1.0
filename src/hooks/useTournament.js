import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTournament(userId) {
  const [tournaments, setTournaments] = useState([])
  const [myMemberships, setMyMemberships] = useState([])
  const [activeTournament, setActiveTournamentState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('activeTournament')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const [{ data: t }, { data: m }] = await Promise.all([
      supabase.from('tournaments').select('*, profiles(username)').order('created_at'),
      supabase.from('tournament_members').select('*').eq('user_id', userId)
    ])
    setTournaments(t || [])
    setMyMemberships(m || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchAll() }, [fetchAll])

  function setActiveTournament(t) {
    setActiveTournamentState(t)
    if (t) localStorage.setItem('activeTournament', JSON.stringify(t))
    else localStorage.removeItem('activeTournament')
  }

  async function requestCreate(name, description) {
    const { error } = await supabase.from('tournaments').insert({
      name: name.trim(),
      description: description.trim() || null,
      created_by: userId,
      status: 'pending'
    })
    if (!error) await fetchAll()
    return { error }
  }

  async function joinTournament(tournamentId) {
    const { error } = await supabase.from('tournament_members').insert({
      tournament_id: tournamentId,
      user_id: userId
    })
    if (!error) await fetchAll()
    return { error }
  }

  async function leaveTournament(tournamentId) {
    const { error } = await supabase.from('tournament_members')
      .delete().eq('tournament_id', tournamentId).eq('user_id', userId)
    if (!error) {
      if (activeTournament?.id === tournamentId) setActiveTournament(null)
      await fetchAll()
    }
    return { error }
  }

  function getMembership(tournamentId) {
    return myMemberships.find(m => m.tournament_id === tournamentId) || null
  }

  return {
    tournaments, myMemberships, activeTournament,
    setActiveTournament, requestCreate, joinTournament,
    leaveTournament, getMembership, loading, refresh: fetchAll
  }
}
