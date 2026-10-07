import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { useAuth } from "./_core/hooks/useAuth";
import { Button } from "./components/ui/button";
import { Loader2, LockKeyhole, ShieldCheck, UserPlus, KeyRound } from "lucide-react";
import { startLogin } from "./const";

const ADMIN_CODE = "fmr2026adm";
const OWNER_EMAIL = "adalbmartinsjr@gmail.com";

type StoredProfile = { id: number; name: string; nickname: string; email?: string; login?: string; passwordHash?: string; isAdmin?: boolean; isReferee?: boolean; position?: "GOL" | "DEF" | "MEI" | "ATA"; monthly?: boolean; [key: string]: unknown };
type AccessMode = "login" | "register" | "forgot";

async function hashPassword(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function readProfiles(): StoredProfile[] {
  try { return JSON.parse(localStorage.getItem("fmr-players") ?? "[]") as StoredProfile[]; } catch { return []; }
}
function saveProfiles(profiles: StoredProfile[]) { localStorage.setItem("fmr-players", JSON.stringify(profiles)); }

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }

function AccessScreen({ user, linkedProfile, onComplete }: { user: { name?: string | null; email?: string | null }; linkedProfile?: StoredProfile; onComplete: () => void }) {
  const ownerAccount = user.email?.toLowerCase() === OWNER_EMAIL;
  const [mode, setMode] = useState<AccessMode>(linkedProfile?.passwordHash ? "login" : "register");
  const [name, setName] = useState(linkedProfile?.name ?? (ownerAccount ? "Adalberto" : user.name ?? ""));
  const [nickname, setNickname] = useState(linkedProfile?.nickname ?? (ownerAccount ? "Adalberto" : ""));
  const [position, setPosition] = useState<StoredProfile["position"]>(linkedProfile?.position ?? "ATA");
  const [monthly, setMonthly] = useState(linkedProfile?.monthly ?? true);
  const [login, setLogin] = useState(linkedProfile?.login ?? (ownerAccount ? "adalberto" : ""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [recoveryLogin, setRecoveryLogin] = useState(linkedProfile?.login ?? "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const switchMode = (next: AccessMode) => { setMode(next); setError(""); setNotice(""); setPassword(""); setConfirmPassword(""); };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setNotice("");
    const profiles = readProfiles();
    if (mode === "login") {
      if (!login.trim() || !password) { setError("Informe o login e a senha."); return; }
      const candidate = profiles.find((item) => item.login?.trim().toLowerCase() === login.trim().toLowerCase() || item.email?.trim().toLowerCase() === login.trim().toLowerCase());
      if (!candidate?.passwordHash || candidate.passwordHash !== await hashPassword(password)) { setError("Login ou senha inválidos."); return; }
      sessionStorage.setItem("fmr-local-login", String(candidate.id)); onComplete(); return;
    }
    if (mode === "forgot") {
      if (!recoveryLogin.trim() || password.length < 6 || password !== confirmPassword) { setError("Informe o login e uma nova senha válida com confirmação."); return; }
      const index = profiles.findIndex((item) => item.login?.trim().toLowerCase() === recoveryLogin.trim().toLowerCase() || item.email?.trim().toLowerCase() === recoveryLogin.trim().toLowerCase());
      if (index < 0) { setError("Cadastro não encontrado para este login ou e-mail."); return; }
      const updated = [...profiles]; updated[index] = { ...updated[index], passwordHash: await hashPassword(password) }; saveProfiles(updated);
      setNotice("Senha redefinida. Agora use a opção Entrar para acessar o app."); setMode("login"); setLogin(updated[index].login ?? recoveryLogin); setPassword(""); setConfirmPassword(""); return;
    }
    const derivedLogin = nickname.trim().toLowerCase().replace(/\s+/g, ".");
    if (!name.trim() || !nickname.trim() || password.length < 6 || password !== confirmPassword) { setError("Preencha nome, apelido, senha e confirmação da senha."); return; }
    const duplicate = profiles.find((item) => item.login?.trim().toLowerCase() === derivedLogin && item.id !== linkedProfile?.id);
    if (duplicate) { setError("Este login já está em uso."); return; }
    const wantsAdmin = adminCode === ADMIN_CODE;
    const existingIndex = linkedProfile ? profiles.findIndex((item) => item.id === linkedProfile.id) : profiles.findIndex((item) => (user.email && item.email?.toLowerCase() === user.email.toLowerCase()) || item.name === user.name || item.nickname === user.name);
    const base = existingIndex >= 0 ? profiles[existingIndex] : undefined;
    const next: StoredProfile = { ...(base ?? {}), id: base?.id ?? Date.now(), name: name.trim(), nickname: nickname.trim(), email: user.email ?? base?.email, login: derivedLogin, passwordHash: await hashPassword(password), position, monthly, presence: base?.presence ?? 0, goals: base?.goals ?? 0, assists: base?.assists ?? 0, wins: base?.wins ?? 0, losses: base?.losses ?? 0, cards: base?.cards ?? 0, rating: base?.rating ?? 6.5, checkedIn: base?.checkedIn ?? false, presenceConfirmed: base?.presenceConfirmed ?? false, color: base?.color ?? (wantsAdmin ? "#d9a52a" : "#5f82ba"), isAdmin: wantsAdmin || Boolean(base?.isAdmin), isReferee: base?.isReferee ?? false, availability: base?.availability ?? "available" };
    const nextProfiles = existingIndex >= 0 ? profiles.map((item, index) => index === existingIndex ? next : item) : [next, ...profiles];
    saveProfiles(nextProfiles); sessionStorage.setItem("fmr-local-login", String(next.id)); onComplete();
  };

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  return <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-4 py-8"><div className="w-full max-w-lg rounded-[28px] border border-[#dce4f0] bg-white p-7 shadow-xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf0ff] text-[#1769ff]">{isLogin ? <LockKeyhole className="h-7 w-7" /> : isRegister ? <UserPlus className="h-7 w-7" /> : <KeyRound className="h-7 w-7" />}</div><h1 className="mt-5 text-center font-display text-3xl font-extrabold text-[#071a38]">Acesso ao app</h1><p className="mt-2 text-center text-sm leading-relaxed text-[#718198]">Entre, crie seu cadastro ou redefina sua senha em um só lugar.</p><div className="mt-6 grid grid-cols-3 rounded-xl bg-[#f6f8fc] p-1"><button onClick={() => switchMode("login")} className={`rounded-lg px-2 py-2 text-[11px] font-extrabold ${isLogin ? "bg-white text-[#1769ff] shadow-sm" : "text-[#8190a5]"}`}>Entrar</button><button onClick={() => switchMode("register")} className={`rounded-lg px-2 py-2 text-[11px] font-extrabold ${isRegister ? "bg-white text-[#1769ff] shadow-sm" : "text-[#8190a5]"}`}>Cadastrar</button><button onClick={() => switchMode("forgot")} className={`rounded-lg px-2 py-2 text-[11px] font-extrabold ${mode === "forgot" ? "bg-white text-[#1769ff] shadow-sm" : "text-[#8190a5]"}`}>Esqueci a senha</button></div><form onSubmit={submit} className="mt-5">{isRegister ? <><div className="grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Nome completo<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Apelido<input value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /></label><div className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Login pelo apelido<div className="mt-2 flex h-11 items-center rounded-xl border border-[#dce4f0] bg-[#f6f8fc] px-3 text-sm font-semibold text-[#63728b]">{nickname.trim() ? nickname.trim().toLowerCase().replace(/\s+/g, ".") : "Será criado a partir do apelido"}</div></div><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Posição<select value={position} onChange={(e) => setPosition(e.target.value as StoredProfile["position"])} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold"><option value="GOL">Goleiro</option><option value="DEF">Defensor</option><option value="MEI">Meia</option><option value="ATA">Atacante</option></select></label></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Senha<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Confirmar senha<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /></label></div><label className="mt-3 block text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Código de administrador<input value={adminCode} onChange={(e) => setAdminCode(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /></label></> : <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">{isLogin ? "Login ou e-mail" : "Login ou e-mail cadastrado"}<input value={isLogin ? login : recoveryLogin} onChange={(e) => isLogin ? setLogin(e.target.value) : setRecoveryLogin(e.target.value)} placeholder="Informe seu login" className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /></label>}{!isRegister && <label className="mt-3 block text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">{isLogin ? "Senha" : "Nova senha"}<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /></label>}{mode === "forgot" ? <label className="mt-3 block text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Confirmar nova senha<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /></label> : null}{notice && <p className="mt-3 rounded-lg bg-[#eaf8f1] px-3 py-2 text-xs font-bold text-[#21855a]">{notice}</p>}{error && <p className="mt-3 rounded-lg bg-[#fff0ec] px-3 py-2 text-xs font-bold text-[#c94f3d]">{error}</p>}<Button type="submit" className="mt-5 h-11 w-full rounded-xl bg-[#1769ff] text-xs font-extrabold">{isLogin ? "Entrar" : isRegister ? "Cadastrar e entrar" : "Redefinir senha"}</Button></form>{linkedProfile && <p className="mt-4 text-center text-[10px] font-semibold text-[#8a98aa]">Cadastro vinculado a {linkedProfile.nickname || linkedProfile.name}.</p>}</div></div>;
}

function AuthGate() {
  const { user, loading, isAuthenticated } = useAuth({ redirectOnUnauthenticated: false });
  const [localAccess, setLocalAccess] = useState(() => Boolean(sessionStorage.getItem("fmr-local-login")));
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] text-[#071a38]"><div className="flex items-center gap-3 text-sm font-bold"><Loader2 className="h-5 w-5 animate-spin text-[#1769ff]" />Verificando seu acesso...</div></div>;
  if (!isAuthenticated || !user) return <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-4"><div className="w-full max-w-md rounded-[28px] border border-[#dce4f0] bg-white p-7 text-center shadow-xl"><LockKeyhole className="mx-auto h-10 w-10 text-[#1769ff]" /><h1 className="mt-5 font-display text-3xl font-extrabold text-[#071a38]">Acesso à pelada</h1><p className="mt-2 text-sm text-[#718198]">Entre com sua conta para acessar a tela única de login e cadastro.</p><Button onClick={() => startLogin()} className="mt-6 h-11 w-full rounded-xl bg-[#1769ff] text-xs font-extrabold">Continuar</Button></div></div>;
  if (localAccess) return <Router />;
  const profiles = readProfiles();
  const linkedProfile = profiles.find((item) => item.email?.toLowerCase() === user.email?.toLowerCase() || (user.email?.toLowerCase() === OWNER_EMAIL && item.name === "Adalberto") || item.name === user.name || item.nickname === user.name);
  return <AccessScreen user={user} linkedProfile={linkedProfile} onComplete={() => setLocalAccess(true)} />;
}

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><AuthGate /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
export default App;
