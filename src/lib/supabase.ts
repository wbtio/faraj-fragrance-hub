import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iytwchrbpawcfjrbjsuc.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5dHdjaHJicGF3Y2ZqcmJqc3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzkxMzAsImV4cCI6MjA3NjIxNTEzMH0.oj7k1R64-IuhZJhPNB5l3Vba3x3y_wSrXHI5lz5sjIg'

export const supabase = createClient(supabaseUrl, supabaseKey)