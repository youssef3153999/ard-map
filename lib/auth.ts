import { supabase } from './supabase'

export const getUser = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}