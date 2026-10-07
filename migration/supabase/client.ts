import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  console.warn("Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(url ?? "https://placeholder.supabase.co", anonKey ?? "placeholder-anon-key");

export async function signInWithLogin(login: string, password: string) {
  return supabase.auth.signInWithPassword({ email: login, password });
}

export async function signUpWithProfile(email: string, password: string, profile: { name: string; nickname: string; position: string; monthly: boolean; isAdmin: boolean }) {
  return supabase.auth.signUp({ email, password, options: { data: profile } });
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` });
}

export async function signOut() {
  return supabase.auth.signOut();
}
