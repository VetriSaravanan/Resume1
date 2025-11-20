import { createClient } from '@supabase/supabase-js';

// Use environment variables with safe access and fallback to process.env which is polyfilled by Vite define
// Optional chaining (?.) prevents the "Cannot read properties of undefined" error
// Casting import.meta to any to avoid TypeScript errors if vite types are missing
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://chaylrjnxxkbidqplglb.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYXlscmpueHhrYmlkcXBsZ2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNjM4NzEsImV4cCI6MjA3NTczOTg3MX0._eVaAMjmo5ZV9fssOcVBs8cbr57BZmYFa46YZNPy5fs';

let supabase: any = null;
let supabaseError: string | null = null;

if (!supabaseUrl || !supabaseAnonKey) {
    supabaseError = "Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.";
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e: any) {
        supabaseError = e.message || "Failed to initialize Supabase client";
    }
}

export { supabase, supabaseError };