import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hojfbjkdbsdmnhykmbhl.supabase.co'
const supabaseAnonKey = 'sb_publishable_2FW3zWu86LEzrfnth9Qf4A_zpUNNwKh'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
