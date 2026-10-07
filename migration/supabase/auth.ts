import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./client";

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setLoading(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  return { user, loading, isAuthenticated: Boolean(user), logout: () => supabase.auth.signOut() };
}

export async function loginWithEmailAndPassword(email: string, password: string) {
  const result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error) throw result.error;
  return result.data.user;
}

export async function registerWithEmailAndPassword(email: string, password: string, metadata: Record<string, unknown>) {
  const result = await supabase.auth.signUp({ email, password, options: { data: metadata } });
  if (result.error) throw result.error;
  return result.data.user;
}

export async function sendPasswordReset(email: string) {
  const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (result.error) throw result.error;
}
