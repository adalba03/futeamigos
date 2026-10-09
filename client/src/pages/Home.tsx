import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  CalendarDays,
  CalendarClock,
  Check,
  MapPin,
  ChevronRight,
  CircleUserRound,
  CircleX,
  ClipboardList,
  Clock3,
  Download,
  Dribbble,
  Gauge,
  Goal,
  HandHelping,
  Menu,
  MoreHorizontal,
  Medal,
  Minus,
  Plus,
  Pencil,
  Settings2,
  Shield,
  UserRoundCog,
  Timer,
  Trash2,
  Swords,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LOGO = "/manus-storage/pasted_file_VdkrqD_image_7b9665fa.png";

interface Player {
  id: number;
  name: string;
  email?: string;
  nickname: string;
  position: "GOL" | "DEF" | "MEI" | "ATA";
  monthly: boolean;
  presence: number;
  goals: number;
  assists: number;
  wins: number;
  losses: number;
  cards: number;
  rating: number;
  checkedIn: boolean;
  presenceConfirmed?: boolean;
  checkInAt?: number;
  color: string;
  isAdmin?: boolean;
  isReferee?: boolean;
  availability?: "available" | "indisponível" | "DM";
}

type MatchEvent = {
  id: number;
  type: "Gol" | "Assistência" | "Cartão" | "Substituição";
  detail: string;
  time: string;
  tone: "blue" | "red" | "gold" | "slate";
};

type View = "resumo" | "pelada" | "ranking" | "configuracoes";

type TeamState = {
  blue: Player[];
  red: Player[];
};

type AppNotification = { id: number; title: string; message: string; createdAt: number; author?: string };

type LeagueSettings = {
  leagueName: string;
  leagueSlug: string;
  logoUrl?: string;
  season: string;
  matchDate: string;
  matchTime: string;
  venue: string;
  durationMinutes: 8 | 10;
  venueLatitude?: number;
  venueLongitude?: number;
  venueRadiusMeters?: number;
};

const initialPlayers: Player[] = [
  { id: 1, presenceConfirmed: true, name: "André Luiz", nickname: "Dedé", position: "GOL", monthly: true, presence: 96, goals: 0, assists: 3, wins: 8, losses: 2, cards: 0, rating: 8.9, checkedIn: false, color: "#1769ff" },
  { id: 2, name: "Carlos Eduardo", nickname: "Cadu", position: "DEF", monthly: true, presence: 92, goals: 2, assists: 5, wins: 7, losses: 3, cards: 1, rating: 8.4, checkedIn: false, color: "#f1b83d" },
  { id: 3, name: "Fábio Santos", nickname: "Fabinho", position: "ATA", monthly: true, presence: 88, goals: 12, assists: 4, wins: 7, losses: 3, cards: 1, rating: 8.8, checkedIn: false, color: "#d95c45" },
  { id: 4, name: "Gustavo Reis", nickname: "Guga", position: "MEI", monthly: true, presence: 84, goals: 6, assists: 9, wins: 6, losses: 4, cards: 0, rating: 8.7, checkedIn: false, color: "#8d68d8" },
  { id: 5, name: "João Victor", nickname: "Japa", position: "DEF", monthly: false, presence: 77, goals: 1, assists: 3, wins: 5, losses: 4, cards: 2, rating: 7.3, checkedIn: false, color: "#50a987" },
  { id: 6, name: "Leonardo Moraes", nickname: "Léo", position: "GOL", monthly: false, presence: 74, goals: 0, assists: 1, wins: 4, losses: 4, cards: 0, rating: 7.1, checkedIn: false, color: "#d4843e" },
  { id: 7, name: "Marcelo Rondon", nickname: "Marcão", position: "ATA", monthly: true, isAdmin: true, presence: 91, goals: 10, assists: 6, wins: 7, losses: 2, cards: 1, rating: 9.2, checkedIn: false, color: "#e776a8" },
  { id: 8, name: "Nando Pereira", nickname: "Nando", position: "DEF", monthly: true, presence: 82, goals: 3, assists: 2, wins: 5, losses: 5, cards: 1, rating: 7.4, checkedIn: false, color: "#4f7ec9" },
  { id: 9, name: "Paulo Henrique", nickname: "Paulinho", position: "MEI", monthly: true, presence: 90, goals: 5, assists: 8, wins: 8, losses: 2, cards: 0, rating: 9.0, checkedIn: false, color: "#a88a56" },
  { id: 10, name: "Rafael Lima", nickname: "Rafa", position: "ATA", monthly: false, presence: 69, goals: 7, assists: 2, wins: 4, losses: 5, cards: 2, rating: 7.2, checkedIn: false, color: "#3b9db4" },
  { id: 11, name: "Renan Alves", nickname: "Renan", position: "MEI", monthly: true, presence: 86, goals: 4, assists: 7, wins: 6, losses: 3, cards: 1, rating: 8.1, checkedIn: false, color: "#bf5e79" },
  { id: 12, name: "Thiago Souza", nickname: "Thiaguinho", position: "DEF", monthly: false, presence: 64, goals: 1, assists: 2, wins: 3, losses: 5, cards: 1, rating: 6.8, checkedIn: false, color: "#6b98aa" },
  { id: 13, name: "Bruno Reis", nickname: "Brunão", position: "ATA", monthly: false, presence: 60, goals: 3, assists: 1, wins: 2, losses: 4, cards: 1, rating: 6.4, checkedIn: false, color: "#8d9a59" },
  { id: 14, name: "Davi Martins", nickname: "Davi", position: "MEI", monthly: true, presence: 80, goals: 2, assists: 5, wins: 5, losses: 4, cards: 0, rating: 7.6, checkedIn: false, color: "#7182bf" },
  { id: 15, name: "Eduardo Costa", nickname: "Dudu", position: "DEF", monthly: true, presence: 79, goals: 1, assists: 4, wins: 4, losses: 4, cards: 0, rating: 7.5, checkedIn: false, color: "#c67b53" },
  { id: 16, name: "Hugo Mendes", nickname: "Huguinho", position: "ATA", monthly: false, presence: 55, goals: 2, assists: 1, wins: 2, losses: 4, cards: 2, rating: 6.1, checkedIn: false, color: "#738986" },
  { id: 17, name: "Igor Freitas", nickname: "Igor", position: "MEI", monthly: false, presence: 62, goals: 2, assists: 3, wins: 3, losses: 5, cards: 0, rating: 6.7, checkedIn: false, color: "#a06d9e" },
  { id: 18, name: "Wesley Rocha", nickname: "Wesley", position: "DEF", monthly: false, presence: 58, goals: 0, assists: 2, wins: 2, losses: 5, cards: 1, rating: 6.0, checkedIn: false, color: "#7d84a4" },
];

const initialTeams: TeamState = {
  blue: [initialPlayers[2], initialPlayers[3], initialPlayers[6], initialPlayers[8], initialPlayers[10]],
  red: [initialPlayers[1], initialPlayers[4], initialPlayers[7], initialPlayers[9], initialPlayers[11]],
};

const defaultLeagueSettings: LeagueSettings = { leagueName: "Amigos do Forte Marechal Rondon", leagueSlug: "amigos-do-forte-marechal-rondon", logoUrl: LOGO, season: "2025", matchDate: "2025-09-27", matchTime: "08:00", venue: "Arena Marrechal · Society 1", durationMinutes: 8 };

const initialEvents: MatchEvent[] = [
  { id: 1, type: "Gol", detail: "Marcão · Time Azul", time: "08:36", tone: "blue" },
  { id: 2, type: "Assistência", detail: "Paulinho → Marcão", time: "08:36", tone: "gold" },
  { id: 3, type: "Gol", detail: "Fabinho · Time Vermelho", time: "08:48", tone: "red" },
  { id: 4, type: "Cartão", detail: "Nando · Amarelo", time: "08:55", tone: "slate" },
];

const navItems: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "resumo", label: "Resumo", icon: BarChart3 },
  { id: "pelada", label: "Pelada", icon: Swords },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "configuracoes", label: "Configurações", icon: Settings2 },
];

function avatarInitials(player: Player) {
  return player.nickname.slice(0, 2).toUpperCase();
}

function calculateScore(player: Player) {
  return Math.max(0, Math.min(10, 6 + player.goals * 0.35 + player.assists * 0.18 + player.wins * 0.18 - player.losses * 0.08 - player.cards * 0.35));
}

function buildTeams(players: Player[], orderedIds?: number[]): TeamState {
  const fieldPlayers = (orderedIds ? orderedIds.map((id) => players.find((player) => player.id === id)).filter((player): player is Player => Boolean(player)) : players.filter((player) => player.checkedIn && player.position !== "GOL" && (player.availability ?? "available") === "available").sort((a, b) => Number(b.monthly) - Number(a.monthly) || (a.checkInAt ?? 0) - (b.checkInAt ?? 0)))
    .filter((player) => player.position !== "GOL" && (player.availability ?? "available") === "available");
  const blue: Player[] = [];
  const red: Player[] = [];
  let blueStrength = 0;
  let redStrength = 0;
  fieldPlayers.forEach((player) => {
    const target = blueStrength <= redStrength ? blue : red;
    target.push(player);
    if (target === blue) blueStrength += player.rating;
    else redStrength += player.rating;
  });
  return { blue: blue.slice(0, 5), red: red.slice(0, 5) };
}

function formatLongDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function distanceInMeters(latitudeA: number, longitudeA: number, latitudeB: number, longitudeB: number) {
  const earthRadius = 6371000;
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = toRadians(latitudeB - latitudeA);
  const dLon = toRadians(longitudeB - longitudeA);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function scoreToLabel(player: Player) {
  return calculateScore(player).toFixed(1);
}

function PlayerAvatar({ player, size = "md" }: { player: Player; size?: "sm" | "md" | "lg" }) {
  const classes = size === "lg" ? "h-12 w-12 text-sm" : size === "sm" ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-xs";
  return (
    <div className="relative shrink-0">
      <div className={`${classes} flex items-center justify-center rounded-full border-2 border-white/80 font-bold text-white shadow-sm`} style={{ background: player.color }}>
        {avatarInitials(player)}
      </div>
      {player.availability && player.availability !== "available" && <span title={player.availability === "DM" ? "DM" : "Indisponível"} className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#e5484d] text-white"><CircleX className="h-3 w-3" /></span>}
    </div>
  );
}

function BrandLogo({ size = "md", src = LOGO, name = "Logo da pelada" }: { size?: "sm" | "md"; src?: string; name?: string }) {
  return <img src={src || LOGO} alt={name} className={size === "sm" ? "h-10 w-10 rounded-xl object-cover" : "h-14 w-14 rounded-2xl object-cover shadow-lg shadow-blue-950/20"} />;
}

function SectionTitle({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#63728b]">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-[#071a38]">{title}</h2>
      </div>
      {action && <button onClick={onAction} className="inline-flex items-center gap-1 text-xs font-bold text-[#1769ff] transition hover:text-[#0745bd]">{action}<ChevronRight className="h-3.5 w-3.5" /></button>}
    </div>
  );
}

export default function Home() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<View>("resumo");
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem("fmr-players");
      if (!saved) return initialPlayers;
      const parsed = JSON.parse(saved) as Player[];
      return parsed.map((player) => ({ ...player, email: player.email ?? (player.name === "Adalberto" || player.nickname === "Adalberto" ? "adalbmartinsjr@gmail.com" : undefined), isAdmin: player.name === "Adalberto" || player.nickname === "Adalberto" || (player.isAdmin ?? player.id === 7), availability: player.availability ?? "available", isReferee: player.isReferee ?? false, presenceConfirmed: player.presenceConfirmed ?? true, checkedIn: Boolean(player.checkInAt), checkInAt: player.checkInAt }));
    } catch {
      return initialPlayers;
    }
  });
  const [teams, setTeams] = useState<TeamState>(() => initialTeams);
  const [manualQueueIds, setManualQueueIds] = useState<number[] | null>(null);
  const [isTeamsEditOpen, setIsTeamsEditOpen] = useState(false);
  const [events, setEvents] = useState<MatchEvent[]>(() => initialEvents);
  const [checkedIn, setCheckedIn] = useState(false);
  const [presenceConfirmed, setPresenceConfirmed] = useState(true);
  const [checkInOrder, setCheckInOrder] = useState<number[]>([]);
  const [matchNumber, setMatchNumber] = useState(1);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [matchStatus, setMatchStatus] = useState<"em andamento" | "aguardando rolar" | "pausado">("em andamento");
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [isRefereeOpen, setIsRefereeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const initialLeagueSlug = new URLSearchParams(window.location.search).get("pelada") || localStorage.getItem("fmr-active-league") || defaultLeagueSettings.leagueSlug;
  const [activeLeagueSlug, setActiveLeagueSlug] = useState(initialLeagueSlug);
  const [leagueSettings, setLeagueSettings] = useState<LeagueSettings>(() => {
    try { return JSON.parse(localStorage.getItem(`fmr-settings-${initialLeagueSlug}`) ?? localStorage.getItem("fmr-settings") ?? "null") ?? defaultLeagueSettings; } catch { return defaultLeagueSettings; }
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try { return JSON.parse(localStorage.getItem(`fmr-notifications-${initialLeagueSlug}`) ?? "[]") as AppNotification[]; } catch { return []; }
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [matchesPlayed, setMatchesPlayed] = useState(() => Number(localStorage.getItem("fmr-match-count") ?? 18) || 18);
  const isAdmin = Boolean(players.find((player) => player.email?.toLowerCase() === user?.email?.toLowerCase() || player.name === user?.name || player.nickname === user?.name)?.isAdmin);
  const [showInviteRegistration, setShowInviteRegistration] = useState(() => new URLSearchParams(window.location.search).has("invite"));
  const [eventType, setEventType] = useState<MatchEvent["type"]>("Gol");
  const [selectedPlayerId, setSelectedPlayerId] = useState(7);
  const [matchScore, setMatchScore] = useState({ blue: 2, red: 1 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("fmr-players", JSON.stringify(players));
  }, [players]);
  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("fmr-settings", JSON.stringify(leagueSettings));
    localStorage.setItem(`fmr-settings-${activeLeagueSlug}`, JSON.stringify(leagueSettings));
    localStorage.setItem("fmr-active-league", activeLeagueSlug);
  }, [leagueSettings, activeLeagueSlug]);
  useEffect(() => {
    localStorage.setItem(`fmr-notifications-${activeLeagueSlug}`, JSON.stringify(notifications));
  }, [notifications, activeLeagueSlug]);
  useEffect(() => {
    localStorage.setItem("fmr-match-count", String(matchesPlayed));
  }, [matchesPlayed]);

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => calculateScore(b) - calculateScore(a)), [players]);
  const currentUser = players.find((player) => player.email?.toLowerCase() === user?.email?.toLowerCase() || player.name === user?.name || player.nickname === user?.name) ?? null;
  const checkInCount = players.filter((player) => player.presenceConfirmed).length;
  const scheduledDateLabel = formatLongDate(leagueSettings.matchDate);
  const scheduledWeekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date(`${leagueSettings.matchDate}T12:00:00`));
  const isCheckInOpen = (() => { const start = new Date(`${leagueSettings.matchDate}T${leagueSettings.matchTime}:00`); const checkInOpensAt = new Date(start.getTime() - 30 * 60 * 1000); return clockNow >= checkInOpensAt.getTime() && clockNow < start.getTime(); })();
  const checkInEligible = Boolean(currentUser?.presenceConfirmed) && isCheckInOpen;
  const baseWaitingPlayers = players.filter((player) => player.position !== "GOL" && player.checkedIn && (player.availability ?? "available") === "available" && !teams.blue.some((p) => p.id === player.id) && !teams.red.some((p) => p.id === player.id)).sort((a, b) => (a.checkInAt ?? 0) - (b.checkInAt ?? 0));
  const waitingPlayers = manualQueueIds ? manualQueueIds.map((id) => baseWaitingPlayers.find((player) => player.id === id)).filter((player): player is Player => Boolean(player)) : baseWaitingPlayers;
  const canManageQueue = Boolean(currentUser?.isAdmin || currentUser?.isReferee);
  const totalGoals = players.reduce((total, player) => total + player.goals, 0);
  const totalAssists = players.reduce((total, player) => total + player.assists, 0);
  const goalsPerMatch = matchesPlayed > 0 ? (totalGoals / matchesPlayed).toFixed(1) : "0.0";
  const assistsPerMatch = matchesPlayed > 0 ? (totalAssists / matchesPlayed).toFixed(1) : "0.0";
  const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];
  const topAssister = [...players].sort((a, b) => b.assists - a.assists)[0];
  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) ?? players[0];

  const handlePresence = () => {
    const next = !presenceConfirmed;
    setPresenceConfirmed(next);
    setPlayers((current) => current.map((player) => player.id === currentUser?.id ? { ...player, presenceConfirmed: next, checkedIn: next ? player.checkedIn : false, checkInAt: next ? player.checkInAt : undefined } : player));
    toast.success(next ? "Presença confirmada para sábado." : "Presença cancelada.");
  };

  const handleCheckIn = async () => {
    if (!currentUser?.presenceConfirmed) { toast.error("Confirme sua presença antes do check-in."); return; }
    if (!isCheckInOpen) { toast.info("O check-in abre 30 minutos antes do início, no dia da pelada."); return; }
    const next = !checkedIn;
    if (!next) {
      setCheckedIn(false);
      setPlayers((current) => current.map((player) => player.id === currentUser?.id ? { ...player, checkedIn: false, checkInAt: undefined } : player));
      toast.success("Check-in cancelado.");
      return;
    }
    const hasVenueFence = typeof leagueSettings.venueLatitude === "number" && typeof leagueSettings.venueLongitude === "number";
    if (hasVenueFence) {
      if (!navigator.geolocation) { toast.error("Seu dispositivo não informou a localização. Ative o GPS para fazer o check-in."); return; }
      setCheckingLocation(true);
      const location = await new Promise<GeolocationPosition | null>((resolve) => navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }));
      setCheckingLocation(false);
      if (!location) { toast.error("Não foi possível confirmar sua localização. Libere o GPS e tente novamente."); return; }
      const distance = distanceInMeters(location.coords.latitude, location.coords.longitude, leagueSettings.venueLatitude!, leagueSettings.venueLongitude!);
      const radius = leagueSettings.venueRadiusMeters ?? 150;
      if (distance > radius) { toast.error("Você tá fora do local correto pro check-in, vai ter revisão no VAR hein", { description: `Chegue mais perto da quadra para entrar na fila. Distância aproximada: ${Math.round(distance)} m.` }); return; }
    }
    const at = Date.now();
    setCheckedIn(true);
    setPlayers((current) => current.map((player) => player.id === currentUser?.id ? { ...player, checkedIn: true, checkInAt: at } : player));
    toast.success("Check-in realizado. Você entrou na fila do sorteio.");
  };

  const resetMatchData = () => { setEvents([]); setMatchScore({ blue: 0, red: 0 }); setMatchStatus("aguardando rolar"); };
  const handleDraw = () => {
    const eligible = matchNumber === 1 ? players.filter((player) => player.checkedIn && player.position !== "GOL").sort((a, b) => Number(b.monthly) - Number(a.monthly) || (a.checkInAt ?? 0) - (b.checkInAt ?? 0)).map((player) => player.id) : waitingPlayers.map((player) => player.id);
    if (eligible.length < 10) { toast.error("São necessários pelo menos 10 jogadores com check-in para sortear."); return; }
    const nextTeams = buildTeams(players, eligible.slice(0, 10));
    setTeams(nextTeams); setMatchNumber((number) => number + 1); setMatchesPlayed((count) => count + 1); resetMatchData(); setIsMatchOpen(true);
    toast.success("Nova partida sorteada.", { description: matchNumber === 1 ? "Primeiro jogo: ordem de check-in com prioridade aos mensalistas." : "Rodízio: os primeiros da fila formaram a nova partida." });
  };

  const moveQueuePlayer = (playerId: number, direction: -1 | 1) => {
    const current = waitingPlayers.map((player) => player.id);
    const index = current.indexOf(playerId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return;
    [current[index], current[nextIndex]] = [current[nextIndex], current[index]];
    setManualQueueIds(current);
    toast.success("Ordem da fila atualizada.");
  };

  const resetTeams = () => {
    if (!window.confirm("Redefinir os times atuais e sortear novamente?")) return;
    setTeams({ blue: [], red: [] });
    setMatchNumber(1);
    resetMatchData();
    setIsTeamsEditOpen(false);
    setIsMatchOpen(false);
    toast.success("Times redefinidos.", { description: "Agora é possível realizar um novo sorteio pelas regras da liga." });
  };

  const swapTeamPlayer = (outgoingId: number, incomingId: number) => {
    const outgoingTeam = teams.blue.some((player) => player.id === outgoingId) ? "blue" : teams.red.some((player) => player.id === outgoingId) ? "red" : null;
    const incomingTeam = teams.blue.some((player) => player.id === incomingId) ? "blue" : teams.red.some((player) => player.id === incomingId) ? "red" : null;
    const outgoing = players.find((player) => player.id === outgoingId);
    const incoming = players.find((player) => player.id === incomingId);
    if (!outgoing || !incoming || !outgoingTeam || outgoingId === incomingId) { toast.error("Selecione jogadores válidos para a troca."); return; }
    const nextBlue = [...teams.blue];
    const nextRed = [...teams.red];
    const source = outgoingTeam === "blue" ? nextBlue : nextRed;
    const outgoingIndex = source.findIndex((player) => player.id === outgoingId);
    if (outgoingIndex < 0) { toast.error("Não foi possível localizar o jogador no time."); return; }
    if (incomingTeam) {
      const target = incomingTeam === "blue" ? nextBlue : nextRed;
      const incomingIndex = target.findIndex((player) => player.id === incomingId);
      if (incomingIndex < 0) { toast.error("Não foi possível localizar o substituto."); return; }
      source[outgoingIndex] = incoming;
      target[incomingIndex] = outgoing;
    } else {
      source[outgoingIndex] = incoming;
      const queueIds = waitingPlayers.map((player) => player.id).filter((id) => id !== incomingId);
      setManualQueueIds([...queueIds, outgoingId]);
    }
    setTeams({ blue: nextBlue, red: nextRed });
    setIsTeamsEditOpen(false);
    toast.success("Time atualizado manualmente.", { description: `${incoming.nickname} entrou no lugar de ${outgoing.nickname}.` });
  };

  const addEvent = () => {
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const team = teams.blue.some((player) => player.id === selectedPlayerId) ? "Time Azul" : "Time Vermelho";
    const detail = eventType === "Assistência" ? `${selectedPlayer.nickname} · passe decisivo` : `${selectedPlayer.nickname} · ${team}`;
    const tone = eventType === "Gol" ? (team === "Time Azul" ? "blue" : "red") : eventType === "Cartão" ? "slate" : "gold";
    setEvents((current) => [{ id: Date.now(), type: eventType, detail, time, tone }, ...current]);
    if (eventType === "Gol") setMatchScore((score) => ({ ...score, [team === "Time Azul" ? "blue" : "red"]: score[team === "Time Azul" ? "blue" : "red"] + 1 }));
    if (eventType === "Gol" || eventType === "Assistência") {
      setPlayers((current) => current.map((player) => player.id === selectedPlayerId ? { ...player, [eventType === "Gol" ? "goals" : "assists"]: player[eventType === "Gol" ? "goals" : "assists"] + 1 } : player));
    }
    toast.success(`${eventType} registrado para ${selectedPlayer.nickname}.`);
  };

  const exportCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const link = document.createElement("a");
      link.download = "fmr-selecao-do-dia.png";
      link.href = dataUrl;
      link.click();
      toast.success("Card exportado em PNG.", { description: "Pronto para compartilhar no WhatsApp ou Instagram." });
    } catch {
      toast.error("Não foi possível exportar o card agora.");
    }
  };

  if (!currentUser) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-4"><div className="w-full max-w-md rounded-[28px] border border-[#dce4f0] bg-white p-7 text-center shadow-xl"><h1 className="font-display text-3xl font-extrabold text-[#071a38]">Cadastro não encontrado</h1><p className="mt-2 text-sm leading-relaxed text-[#718198]">Sua conta está autenticada, mas ainda não foi vinculada a um usuário cadastrado na liga. Peça à Diretoria para concluir seu cadastro.</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#071a38]">
      <header className="sticky top-0 z-30 border-b border-[#dce4f0] bg-[#f6f8fc]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <BrandLogo src={leagueSettings.logoUrl} name={leagueSettings.leagueName} />
            <div>
              <p className="max-w-[230px] truncate font-display text-xl font-extrabold leading-none tracking-tight text-[#071a38]">{leagueSettings.leagueName}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#78869b]">Perfil da pelada · {activeLeagueSlug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsNotificationsOpen(true)} className="relative rounded-full p-2 text-[#63728b] transition hover:bg-white hover:text-[#1769ff]" aria-label="Notificações"><Bell className="h-5 w-5" />{notifications.length > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#ef5b49] ring-2 ring-[#f6f8fc]" />}</button>
            <button onClick={() => setIsSettingsOpen(true)} className="hidden items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-sm ring-1 ring-[#e1e7f0] transition hover:ring-[#b9c9e0] sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#071a38] text-xs font-bold text-white">{currentUser?.nickname.slice(0, 2).toUpperCase()}</div>
              <span className="text-xs font-bold text-[#071a38]">{currentUser?.name}</span>
              <Settings2 className="h-3.5 w-3.5 text-[#91a0b5]" />
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071a38] text-xs font-bold text-white sm:hidden">{currentUser?.nickname.slice(0, 2).toUpperCase()}</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#1769ff]"><span className="h-2 w-2 rounded-full bg-[#f1b83d]" /> {scheduledDateLabel}</p>
            <h1 className="font-display text-[2.25rem] font-extrabold leading-[0.95] tracking-[-0.04em] text-[#071a38] sm:text-5xl">Fala, {currentUser?.nickname}<span className="text-[#1769ff]">.</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#67768d]">O gramado está esperando. Confira a escala, entre na fila e deixe o resto com a Diretoria.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-2xl border border-[#dce4f0] bg-white px-4 py-3 shadow-sm sm:flex">
            <Activity className="h-5 w-5 text-[#1769ff]" />
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#91a0b5]">Status da liga</p><p className="text-sm font-extrabold text-[#071a38]">Temporada {leagueSettings.season} <span className="ml-1 text-[#33a273]">• ativa</span></p></div>
          </div>
        </div>

        <nav className="mb-7 hidden items-center gap-1 border-b border-[#dce4f0] lg:flex">
          {navItems.filter(({ id }) => id !== "configuracoes" || isAdmin).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setView(id)} className={`relative flex items-center gap-2 px-4 pb-3 pt-1 text-sm font-bold transition ${view === id ? "text-[#1769ff]" : "text-[#8190a5] hover:text-[#071a38]"}`}>{<Icon className="h-4 w-4" />}{label}{view === id && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#1769ff]" />}</button>)}
        </nav>

        {view === "resumo" && <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-7">
            <section className="relative overflow-hidden rounded-[28px] bg-[#071a38] p-5 text-white shadow-xl shadow-[#071a38]/15 sm:p-7">
              <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-white/5" /><div className="absolute -bottom-28 right-16 h-56 w-56 rounded-full border-[22px] border-[#1769ff]/20" />
              <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div><div className="mb-4 flex items-center gap-2"><span className="rounded-full bg-[#f1b83d] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#071a38]">Próxima pelada</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-[#c1cddd]">em 3 dias</span></div><h2 className="font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">{scheduledDateLabel.replace(/^./, (letter) => letter.toUpperCase())}, {leagueSettings.matchTime}</h2><p className="mt-3 flex items-center gap-2 text-sm text-[#b7c3d5]"><CalendarDays className="h-4 w-4 text-[#f1b83d]" /> {leagueSettings.venue}</p></div>
                <div className="flex gap-2"><div className="flex h-11 items-center gap-2 rounded-xl bg-[#f1b83d] px-4 text-xs font-extrabold text-[#071a38]"><Users className="h-4 w-4" /> {checkInCount} confirmados</div><button onClick={() => setIsMatchOpen(true)} className="flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20"><Users className="h-4 w-4" /> {checkInCount}/24</button></div>
              </div>
              <div className="relative z-10 mt-7 border-t border-white/10 pt-4"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#9eacc2]"><span>Lista de presença</span><span>{checkInCount} confirmados · 6 na fila</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#1769ff]" style={{ width: `${(checkInCount / 24) * 100}%` }} /></div></div>
            </section>
            <section className="flex flex-col gap-3 rounded-[22px] border border-[#dce4f0] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${checkedIn ? "bg-[#eaf8f1] text-[#21855a]" : "bg-[#eef2f8] text-[#718198]"}`}><Check className="h-5 w-5" /></div><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Check-in da pelada</p><p className="mt-1 text-sm font-extrabold text-[#071a38]">{checkedIn ? "Check-in realizado · você está na fila" : "Realize o check-in para entrar na fila do sorteio"}</p><p className="mt-1 text-[10px] font-semibold text-[#8a98aa]">{presenceConfirmed ? (isCheckInOpen ? "Janela aberta: você pode fazer o check-in." : "Disponível somente 30 minutos antes do horário programado.") : "Confirme sua presença antes de realizar o check-in."}</p></div></div><div className="flex flex-wrap gap-2">{!presenceConfirmed && <Button onClick={handlePresence} variant="outline" className="h-10 rounded-xl border-[#f1b83d] bg-[#fff9e9] px-3 text-xs font-extrabold text-[#9a6a12]">Confirmar presença</Button>}{presenceConfirmed && !checkedIn && <Button onClick={handlePresence} variant="outline" className="h-10 rounded-xl border-[#dce4f0] bg-white px-3 text-xs font-extrabold text-[#63728b]">Cancelar presença</Button>}<Button disabled={!checkInEligible && !checkedIn} onClick={handleCheckIn} variant="outline" className="h-10 rounded-xl border-[#dce4f0] bg-white px-3 text-xs font-extrabold text-[#1769ff]">{checkingLocation ? "Verificando GPS..." : checkedIn ? "Cancelar check-in" : "Fazer check-in"}</Button></div></section>

            <section><SectionTitle eyebrow={`Ao vivo · partida ${String(matchNumber).padStart(2, "0")}`} title="Jogo em andamento" action="Abrir mesário" onAction={() => setIsRefereeOpen(true)} /><div className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex items-center gap-1.5 rounded-full bg-[#eaf8f1] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#21855a]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#32ad70]" /> ao vivo</span><span className="text-xs font-semibold text-[#9aa7b8]">1º tempo · 17:24</span></div><button onClick={() => setIsRefereeOpen(true)} className="rounded-lg p-2 text-[#8190a5] transition hover:bg-[#f3f6fb] hover:text-[#1769ff]"><MoreHorizontal className="h-5 w-5" /></button></div><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"><TeamScore name="Time Azul" score={matchScore.blue} color="blue" logo="AZ" /><div className="text-center"><p className="font-display text-lg font-extrabold text-[#9aa7b8]">×</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#a9b4c3]">partida {String(matchNumber).padStart(2, "0")}</p></div><TeamScore name="Time Vermelho" score={matchScore.red} color="red" logo="VM" /></div><div className="mt-5 flex items-center justify-between border-t border-[#edf1f6] pt-4"><div className="flex -space-x-2">{teams.blue.slice(0, 5).map((player) => <PlayerAvatar key={player.id} player={player} size="sm" />)}<span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#eef2f8] text-[10px] font-extrabold text-[#63728b]">+7</span></div><Button onClick={() => setIsRefereeOpen(true)} variant="outline" className="h-9 rounded-lg border-[#dce4f0] bg-white px-3 text-xs font-bold text-[#071a38] hover:bg-[#f6f8fc]"><ClipboardList className="mr-2 h-3.5 w-3.5 text-[#1769ff]" /> Painel do mesário</Button></div></div></section>

            <section><SectionTitle eyebrow="Últimos registros" title="Linha do tempo" action="Ver histórico" /><div className="rounded-[24px] border border-[#dce4f0] bg-white p-2 shadow-sm">{events.slice(0, 4).map((event) => <EventRow key={event.id} event={event} />)}</div></section>
          </div>

          <aside className="space-y-7">
            <section><SectionTitle eyebrow={`Temporada ${leagueSettings.season}`} title="Panorama da liga" /><div className="grid grid-cols-2 gap-3"><MiniStat label="Jogadores" value={String(players.length)} detail={`${players.filter((player) => player.availability === "available").length} disponíveis`} tone="blue" icon={Users} /><MiniStat label="Peladas" value={String(matchesPlayed)} detail="partidas registradas" tone="gold" icon={CalendarDays} /><MiniStat label="Gols" value={String(totalGoals)} detail={`${goalsPerMatch} por jogo`} tone="red" icon={Goal} /><MiniStat label="Assistências" value={String(totalAssists)} detail={`${assistsPerMatch} por jogo`} tone="green" icon={HandHelping} /></div></section>
            <section><SectionTitle eyebrow="Destaques de hoje" title="Quem vem voando" action="Ranking" onAction={() => setView("ranking")} /><div className="rounded-[24px] border border-[#dce4f0] bg-white p-4 shadow-sm"><HighlightCard label="Artilheiro" player={topScorer} stat={`${topScorer.goals} gols`} color="blue" /><div className="my-3 border-t border-[#edf1f6]" /><HighlightCard label="Maior assistente" player={topAssister} stat={`${topAssister.assists} assist.`} color="gold" /></div></section>
            <section><div className="flex items-center justify-between rounded-[24px] bg-[#eaf0ff] p-5"><div><p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1769ff]">Dica da Diretoria</p><p className="max-w-[190px] text-sm font-bold leading-snug text-[#17366c]">Chegue 10 minutos antes e garanta sua posição na fila.</p></div><Zap className="h-10 w-10 text-[#f1b83d]" /></div></section>
          </aside>
        </div>}

        {view === "pelada" && <MatchView teams={teams} players={players} waitingPlayers={waitingPlayers} onDraw={handleDraw} onReferee={() => setIsRefereeOpen(true)} onCheckIn={handleCheckIn} checkedIn={checkedIn} checkingLocation={checkingLocation} checkInOpen={isCheckInOpen} checkInEligible={checkInEligible} scheduledDateLabel={scheduledDateLabel} scheduledWeekday={scheduledWeekday} scheduledTime={leagueSettings.matchTime} canManageQueue={canManageQueue} onMoveQueuePlayer={moveQueuePlayer} onEditTeams={() => setIsTeamsEditOpen(true)} />}

        {view === "ranking" && <RankingView players={sortedPlayers} onExport={exportCard} cardRef={cardRef} />}

        {view === "configuracoes" && isAdmin && <AdminSettings players={players} setPlayers={setPlayers} leagueSettings={leagueSettings} setLeagueSettings={setLeagueSettings} notifications={notifications} setNotifications={setNotifications} activeLeagueSlug={activeLeagueSlug} setActiveLeagueSlug={setActiveLeagueSlug} onBack={() => setView("resumo")} profileName={currentUser.name} profileRole={currentUser.isAdmin ? "Diretoria" : currentUser.isReferee ? "Mesário" : "Usuário"} onResetStats={() => { setPlayers((current) => current.map((player) => ({ ...player, goals: 0, assists: 0, wins: 0, losses: 0, cards: 0, presence: 0, rating: 6.5 }))); setEvents([]); setMatchScore({ blue: 0, red: 0 }); toast.success("Estatísticas redefinidas."); }} />}
      </main>

      {isNotificationsOpen && <NotificationModal notifications={notifications} onClose={() => setIsNotificationsOpen(false)} />}
      <div className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-32px)] max-w-sm -translate-x-1/2 items-center justify-around rounded-2xl border border-[#dce4f0] bg-white/95 p-2 shadow-xl shadow-[#071a38]/10 backdrop-blur-xl lg:hidden">{navItems.filter(({ id }) => id !== "configuracoes" || isAdmin).map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setView(id)} className={`flex min-w-[82px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-extrabold transition ${view === id ? "bg-[#eaf0ff] text-[#1769ff]" : "text-[#8a98aa]"}`}><Icon className="h-4 w-4" />{label}</button>)}<button onClick={() => setIsSettingsOpen(true)} className="flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-extrabold text-[#8a98aa]"><Menu className="h-4 w-4" />Mais</button></div>

      {isMatchOpen && <Modal title="Escala da partida" subtitle="Sorteio equilibrado · 6 contra 6" onClose={() => setIsMatchOpen(false)}><div className="mb-5 grid grid-cols-2 gap-3"><TeamColumn title="Time Azul" players={teams.blue} color="blue" /><TeamColumn title="Time Vermelho" players={teams.red} color="red" /></div><div className="rounded-xl bg-[#f6f8fc] p-3"><div className="flex items-center justify-between"><p className="text-xs font-extrabold text-[#071a38]">Fila de espera</p><span className="text-[10px] font-bold text-[#8b9ab0]">{waitingPlayers.length} jogadores</span></div><div className="mt-3 space-y-2">{waitingPlayers.slice(0, 4).map((player, index) => <div key={player.id} className="flex items-center gap-2 text-xs"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-[#1769ff]">{index + 1}</span><PlayerAvatar player={player} size="sm" /><span className="font-bold text-[#31425e]">{player.nickname}</span><span className="ml-auto text-[10px] font-bold text-[#8b9ab0]">{player.monthly ? "Mensalista" : "Diarista"}</span></div>)}</div></div><div className="mt-5 flex gap-2"><Button onClick={() => { setIsMatchOpen(false); setView("pelada"); }} className="h-11 flex-1 rounded-xl bg-[#1769ff] text-xs font-extrabold hover:bg-[#0753d7]"><Check className="mr-2 h-4 w-4" />Confirmar escala</Button><Button onClick={handleDraw} variant="outline" className="h-11 rounded-xl border-[#dce4f0] px-4 text-xs font-extrabold">Sortear novamente</Button></div></Modal>}
      {isTeamsEditOpen && <TeamEditModal teams={teams} players={players} onSwap={swapTeamPlayer} onResetTeams={resetTeams} onClose={() => setIsTeamsEditOpen(false)} />}
      {isRefereeOpen && <RefereeModal players={players} teams={teams} events={events} selectedPlayerId={selectedPlayerId} setSelectedPlayerId={setSelectedPlayerId} eventType={eventType} setEventType={setEventType} onAdd={addEvent} onClose={() => setIsRefereeOpen(false)} score={matchScore} durationMinutes={leagueSettings.durationMinutes} matchNumber={matchNumber} matchStatus={matchStatus} onResetEvents={() => setEvents([])} onResetScore={() => setMatchScore({ blue: 0, red: 0 })} />}
      {isSettingsOpen && <Modal title="Acesso rápido" subtitle="Diretoria" onClose={() => setIsSettingsOpen(false)}><div className="space-y-3"><SettingsRow icon={Shield} label="Código da liga" value="FMR-2025" /><SettingsRow icon={CircleUserRound} label="Seu perfil" value="Administrador" badge="Diretoria" /></div><div className="mt-6 grid gap-2"><Button onClick={() => { setIsSettingsOpen(false); setView("configuracoes"); }} className="h-11 w-full rounded-xl bg-[#071a38] text-xs font-extrabold hover:bg-[#102b55]">Abrir configurações</Button><Button onClick={async () => { setIsSettingsOpen(false); sessionStorage.removeItem("fmr-local-login"); await logout(); }} variant="outline" className="h-11 w-full rounded-xl border-[#ffd1c9] bg-white text-xs font-extrabold text-[#d65c45] hover:bg-[#fff5f2]">Sair do app</Button></div></Modal>}
      {showInviteRegistration && <InviteRegistrationModal onClose={() => { setShowInviteRegistration(false); window.history.replaceState({}, "", window.location.pathname); }} onCreate={(player) => { setPlayers((current) => [...current, player]); setShowInviteRegistration(false); window.history.replaceState({}, "", window.location.pathname); toast.success("Cadastro enviado para a liga.", { description: "A Diretoria já pode conferir seu perfil." }); }} />}
    </div>
  );
}

function TeamScore({ name, score, color, logo }: { name: string; score: number; color: "blue" | "red"; logo: string }) {
  return <div className="text-center"><div className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-black ${color === "blue" ? "bg-[#eaf0ff] text-[#1769ff]" : "bg-[#fff0ec] text-[#d65a46]"}`}>{logo}</div><p className="text-[11px] font-bold text-[#63728b]">{name}</p><p className={`font-display text-4xl font-extrabold leading-none ${color === "blue" ? "text-[#1769ff]" : "text-[#d65a46]"}`}>{score}</p></div>;
}

function MiniStat({ label, value, detail, tone, icon: Icon }: { label: string; value: string; detail: string; tone: "blue" | "gold" | "red" | "green"; icon: LucideIcon }) {
  const color = tone === "blue" ? "#1769ff" : tone === "gold" ? "#c48a11" : tone === "red" ? "#d95c45" : "#2c9c69";
  return <div className="rounded-[20px] border border-[#dce4f0] bg-white p-4 shadow-sm"><div className="mb-4 flex items-center justify-between"><Icon className="h-4 w-4" style={{ color }} /><span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} /></div><p className="font-display text-2xl font-extrabold leading-none text-[#071a38]">{value}</p><p className="mt-1 text-[11px] font-bold text-[#718198]">{label}</p><p className="mt-3 text-[10px] font-semibold text-[#2c9c69]">{detail}</p></div>;
}

function HighlightCard({ label, player, stat, color }: { label: string; player: Player; stat: string; color: "blue" | "gold" }) {
  return <div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color === "blue" ? "bg-[#eaf0ff] text-[#1769ff]" : "bg-[#fff7dd] text-[#bd8412]"}`}>{color === "blue" ? <Goal className="h-5 w-5" /> : <HandHelping className="h-5 w-5" />}</div><PlayerAvatar player={player} size="sm" /><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-[#93a0b0]">{label}</p><p className="truncate text-sm font-extrabold text-[#071a38]">{player.nickname}</p></div><span className="text-xs font-extrabold text-[#1769ff]">{stat}</span></div>;
}

function EventRow({ event }: { event: MatchEvent }) {
  const icon = event.type === "Gol" ? <Goal className="h-4 w-4" /> : event.type === "Assistência" ? <HandHelping className="h-4 w-4" /> : event.type === "Cartão" ? <Minus className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />;
  const color = event.tone === "blue" ? "bg-[#eaf0ff] text-[#1769ff]" : event.tone === "red" ? "bg-[#fff0ec] text-[#d65c45]" : event.tone === "gold" ? "bg-[#fff7dd] text-[#bd8412]" : "bg-[#eef2f7] text-[#708096]";
  return <div className="flex items-center gap-3 px-3 py-3"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>{icon}</div><div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-[#273b5d]">{event.type}</p><p className="truncate text-[11px] text-[#8190a5]">{event.detail}</p></div><span className="text-[10px] font-bold text-[#a1adbc]">{event.time}</span></div>;
}

function formatCheckInTime(timestamp?: number) {
  return timestamp ? new Date(timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "horário não registrado";
}

function MatchView({ teams, players, waitingPlayers, onDraw, onReferee, onCheckIn, checkedIn, checkingLocation, checkInOpen, checkInEligible, scheduledDateLabel, scheduledWeekday, scheduledTime, canManageQueue, onMoveQueuePlayer, onEditTeams }: { teams: TeamState; players: Player[]; waitingPlayers: Player[]; onDraw: () => void; onReferee: () => void; onCheckIn: () => void; checkedIn: boolean; checkingLocation: boolean; checkInOpen: boolean; checkInEligible: boolean; scheduledDateLabel: string; scheduledWeekday: string; scheduledTime: string; canManageQueue: boolean; onMoveQueuePlayer: (playerId: number, direction: -1 | 1) => void; onEditTeams: () => void }) {
  return <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769ff]">Painel da pelada</p><h2 className="font-display text-4xl font-extrabold tracking-tight text-[#071a38]">{scheduledWeekday.replace(/^./, (letter) => letter.toUpperCase())} é dia de jogo.</h2><p className="mt-2 text-sm text-[#718198]">{scheduledDateLabel} · início às {scheduledTime}. Acompanhe escala, fila e rodízio sem perder o ritmo.</p></div><div className="flex gap-2"><div className="flex flex-col items-end gap-1"><Button disabled={!checkInEligible && !checkedIn} onClick={onCheckIn} className={`h-10 rounded-xl px-4 text-xs font-extrabold ${checkedIn ? "bg-[#eaf8f1] text-[#21855a] hover:bg-[#d9f3e6]" : "bg-[#1769ff] text-white hover:bg-[#0753d7]"}`}>{checkedIn ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{checkingLocation ? "Verificando GPS..." : checkedIn ? "Estou na lista" : "Fazer check-in"}</Button><span className="text-[10px] font-semibold text-[#8a98aa]">{checkInOpen ? "Check-in liberado" : `Libera 30 min antes · ${scheduledTime}`}</span></div><Button onClick={onDraw} className="h-10 rounded-xl bg-[#071a38] px-4 text-xs font-extrabold hover:bg-[#102b55]"><Swords className="mr-2 h-4 w-4" />Sortear times</Button>{canManageQueue && <Button onClick={onEditTeams} variant="outline" className="h-10 rounded-xl border-[#dce4f0] bg-white px-3 text-xs font-extrabold text-[#1769ff]"><UserRoundCog className="mr-2 h-4 w-4" />Editar times</Button>}</div></div><div className="rounded-2xl border border-[#f3d18b] bg-[#fff9e9] px-4 py-3"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-[#bd8412]" /><p className="text-xs font-extrabold text-[#7d5b0d]">Goleiros fixos · fora do sorteio</p></div><div className="mt-2 flex items-center gap-3 text-[11px] font-bold text-[#9a7a2c]">{players.filter((player) => player.position === "GOL").slice(0, 2).map((player) => <span key={player.id} className="flex items-center gap-1.5"><PlayerAvatar player={player} size="sm" />{player.nickname}</span>)}</div></div><div className="grid gap-4 md:grid-cols-2"><TeamColumn title="Time Azul" players={teams.blue} color="blue" /><TeamColumn title="Time Vermelho" players={teams.red} color="red" /></div><div className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#8e9caf]">Dinâmica de rodízio</p><h3 className="mt-1 font-display text-2xl font-extrabold text-[#071a38]">Fila de espera</h3><p className="mt-1 text-[10px] font-semibold text-[#8a98aa]">{canManageQueue ? "Administradores e mesários podem reordenar" : "Ordem definida pelo check-in"}</p></div><Badge className="bg-[#fff7dd] text-[#9f7111] hover:bg-[#fff7dd]">Perdeu, sai</Badge></div><div className="space-y-2">{waitingPlayers.map((player, index) => <div key={player.id} className="flex items-center gap-3 rounded-xl bg-[#f7f9fc] px-3 py-2.5"><span className="w-5 text-center font-display text-lg font-extrabold text-[#1769ff]">{String(index + 1).padStart(2, "0")}</span><PlayerAvatar player={player} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-[#273b5d]">{player.nickname}</p><p className="text-[10px] font-semibold text-[#8a98aa]">{player.position} · {player.monthly ? "Mensalista" : "Diarista"}</p></div><span className="text-[10px] font-bold text-[#9aa7b8]">Check-in {formatCheckInTime(player.checkInAt)}</span><div className="flex items-center gap-0.5">{canManageQueue && <><button onClick={() => onMoveQueuePlayer(player.id, -1)} className="rounded-lg p-1.5 text-[#8b9ab0] hover:bg-white hover:text-[#1769ff]" title="Subir na fila"><ArrowRight className="h-3.5 w-3.5 -rotate-90" /></button><button onClick={() => onMoveQueuePlayer(player.id, 1)} className="rounded-lg p-1.5 text-[#8b9ab0] hover:bg-white hover:text-[#1769ff]" title="Descer na fila"><ArrowRight className="h-3.5 w-3.5 rotate-90" /></button></>}</div></div>)}</div><button onClick={() => canManageQueue && toast.info("Use as setas ao lado de cada nome para reordenar a fila.")} className={`mt-4 flex items-center gap-1 text-xs font-extrabold ${canManageQueue ? "text-[#1769ff]" : "text-[#a4afbd]"}`}>Reordenar fila manualmente <ArrowRight className="h-3.5 w-3.5" /></button></div></div><aside className="space-y-7"><section><SectionTitle eyebrow="Mesário" title="Ações rápidas" /><div className="grid grid-cols-2 gap-3"><button onClick={onReferee} className="group rounded-[20px] border border-[#dce4f0] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#a8bfe9]"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#1769ff]"><ClipboardList className="h-5 w-5" /></div><p className="text-xs font-extrabold text-[#071a38]">Registrar evento</p><p className="mt-1 text-[10px] font-semibold text-[#8190a5]">Gol, assistência...</p></button><button onClick={onReferee} className="group rounded-[20px] border border-[#dce4f0] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#f2ce7a]"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff7dd] text-[#bd8412]"><Activity className="h-5 w-5" /></div><p className="text-xs font-extrabold text-[#071a38]">Placar ao vivo</p><p className="mt-1 text-[10px] font-semibold text-[#8190a5]">Atualizar partida</p></button></div></section><section><SectionTitle eyebrow="Escala atual" title="Resumo técnico" /><div className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm">{["Goleiros fixos", "Defensores", "Meias", "Atacantes"].map((label, index) => <div key={label} className="mb-4 last:mb-0"><div className="mb-1.5 flex justify-between text-[10px] font-bold"><span className="text-[#718198]">{label}</span><span className="text-[#071a38]">{index === 0 ? "2" : index === 1 ? "4" : index === 2 ? "3" : "3"}</span></div><div className="h-1.5 rounded-full bg-[#edf1f6]"><div className={`h-full rounded-full ${index === 0 ? "bg-[#f1b83d]" : index === 1 ? "bg-[#1769ff]" : index === 2 ? "bg-[#49ad83]" : "bg-[#d65c45]"}`} style={{ width: `${[65, 85, 56, 65][index]}%` }} /></div></div>)}</div></section></aside></div>;
}


function TeamEditModal({ teams, players, onSwap, onResetTeams, onClose }: { teams: TeamState; players: Player[]; onSwap: (outgoingId: number, incomingId: number) => void; onResetTeams: () => void; onClose: () => void }) {
  const [outgoingId, setOutgoingId] = useState(teams.blue[0]?.id ?? teams.red[0]?.id ?? 0);
  const [incomingId, setIncomingId] = useState(0);
  const fieldPlayers = players.filter((player) => player.position !== "GOL" && (player.availability ?? "available") === "available");
  const outgoing = [...teams.blue, ...teams.red].find((player) => player.id === outgoingId);
  return <Modal title="Editar times" subtitle="Ação exclusiva de administradores e mesários" onClose={onClose}><div className="mb-4 rounded-xl bg-[#fff7dd] p-3"><p className="text-xs font-extrabold text-[#7d5b0d]">Faça uma troca técnica manual sem sortear novamente.</p><p className="mt-1 text-[10px] font-semibold text-[#9a7a2c]">Goleiros fixos permanecem fora desta edição.</p></div><label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Jogador que sai<select value={outgoingId} onChange={(event) => setOutgoingId(Number(event.target.value))} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1769ff]">{[...teams.blue, ...teams.red].map((player) => <option key={player.id} value={player.id}>{player.nickname} · {teams.blue.some((item) => item.id === player.id) ? "Azul" : "Vermelho"}</option>)}</select></label><label className="mt-4 block text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Jogador que entra / troca<select value={incomingId} onChange={(event) => setIncomingId(Number(event.target.value))} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1769ff]"><option value={0}>Selecione o novo jogador</option>{fieldPlayers.filter((player) => player.id !== outgoingId).map((player) => <option key={player.id} value={player.id}>{player.nickname} · {[...teams.blue, ...teams.red].some((item) => item.id === player.id) ? (teams.blue.some((item) => item.id === player.id) ? "Azul" : "Vermelho") : "Fila"}</option>)}</select></label><div className="mt-4 rounded-xl border border-[#ffd9d1] bg-[#fff7f4] p-3"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#a84739]">Correção administrativa</p><p className="mt-1 text-[10px] leading-relaxed text-[#9a6a63]">Use para apagar os times atuais e iniciar um novo sorteio da primeira partida.</p><Button onClick={onResetTeams} variant="outline" className="mt-3 h-9 w-full rounded-lg border-[#f1b8ae] bg-white text-[10px] font-extrabold text-[#d65c45]">Redefinir times e sortear novamente</Button></div><div className="mt-5 flex gap-2"><Button onClick={onClose} variant="outline" className="h-11 flex-1 rounded-xl border-[#dce4f0] bg-white text-xs font-extrabold">Cancelar</Button><Button disabled={!incomingId || !outgoing} onClick={() => incomingId && onSwap(outgoingId, incomingId)} className="h-11 flex-1 rounded-xl bg-[#1769ff] text-xs font-extrabold hover:bg-[#0753d7]"><Check className="mr-2 h-4 w-4" />Confirmar troca</Button></div></Modal>;
}

function TeamColumn({ title, players, color }: { title: string; players: Player[]; color: "blue" | "red" }) {
  return <div className="overflow-hidden rounded-[24px] border border-[#dce4f0] bg-white shadow-sm"><div className={`flex items-center justify-between border-b px-5 py-4 ${color === "blue" ? "border-[#dce7ff] bg-[#f3f6ff]" : "border-[#ffe1da] bg-[#fff7f4]"}`}><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color === "blue" ? "bg-[#1769ff]" : "bg-[#d65c45]"}`} /><p className="text-sm font-extrabold text-[#071a38]">{title}</p></div><span className="text-[10px] font-extrabold text-[#8190a5]">{players.length}/5</span></div><div className="divide-y divide-[#edf1f6] px-3">{players.map((player, index) => <div key={player.id} className="flex items-center gap-2.5 py-3"><span className="w-4 text-center text-[10px] font-extrabold text-[#a3afbd]">{index + 1}</span><PlayerAvatar player={player} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-[#273b5d]">{player.nickname}</p><p className="text-[10px] font-semibold text-[#8a98aa]">{player.position}</p></div><span className="text-xs font-extrabold text-[#1769ff]">{player.rating.toFixed(1)}</span></div>)}</div></div>;
}

function RankingView({ players, onExport, cardRef }: { players: Player[]; onExport: () => void; cardRef: React.RefObject<HTMLDivElement | null> }) {
  return <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px]"><div><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769ff]">Performance da liga</p><h2 className="font-display text-4xl font-extrabold tracking-tight text-[#071a38]">Ranking geral</h2><p className="mt-2 text-sm text-[#718198]">A nota combina gols, assistências, vitórias, derrotas e cartões.</p></div><div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#63728b] shadow-sm ring-1 ring-[#dce4f0]"><Gauge className="h-4 w-4 text-[#1769ff]" /> Nota de 0 a 10</div></div><div className="mb-6 grid gap-3 sm:grid-cols-3">{players.slice(0, 3).map((player, index) => <div key={player.id} className={`relative overflow-hidden rounded-[24px] border p-5 shadow-sm ${index === 0 ? "border-[#f3d18b] bg-[#fff9e9]" : "border-[#dce4f0] bg-white"}`}><div className="absolute right-4 top-4 text-[#d7b34d]"><Medal className="h-5 w-5" /></div><p className="font-display text-3xl font-extrabold text-[#bd8412]">{String(index + 1).padStart(2, "0")}</p><div className="mt-4 flex items-center gap-2"><PlayerAvatar player={player} size="sm" /><div><p className="text-sm font-extrabold text-[#071a38]">{player.nickname}</p><p className="text-[10px] font-semibold text-[#8190a5]">{player.position}</p></div></div><div className="mt-4 flex items-end justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-[#9aa7b8]">nota</span><span className="font-display text-3xl font-extrabold text-[#1769ff]">{scoreToLabel(player)}</span></div></div>)}</div><div className="overflow-hidden rounded-[24px] border border-[#dce4f0] bg-white shadow-sm"><div className="hidden grid-cols-[40px_minmax(0,1fr)_80px_70px_70px] gap-3 border-b border-[#edf1f6] bg-[#fbfcfe] px-5 py-3 text-[10px] font-extrabold uppercase tracking-wider text-[#97a4b4] sm:grid"><span>#</span><span>Jogador</span><span>Gols</span><span>Assist.</span><span>Nota</span></div>{players.map((player, index) => <div key={player.id} className="grid grid-cols-[30px_minmax(0,1fr)_52px_52px_52px] items-center gap-2 border-b border-[#edf1f6] px-4 py-3 last:border-0 sm:grid-cols-[40px_minmax(0,1fr)_80px_70px_70px] sm:gap-3 sm:px-5"><span className={`font-display text-lg font-extrabold ${index < 3 ? "text-[#bd8412]" : "text-[#a5b0be]"}`}>{String(index + 1).padStart(2, "0")}</span><div className="flex min-w-0 items-center gap-2"><PlayerAvatar player={player} size="sm" /><div className="min-w-0"><p className="truncate text-xs font-extrabold text-[#273b5d]">{player.nickname}</p><p className="text-[10px] font-semibold text-[#8a98aa]">{player.name} · {player.position}</p></div></div><span className="text-xs font-bold text-[#63728b]">{player.goals}</span><span className="text-xs font-bold text-[#63728b]">{player.assists}</span><span className="rounded-lg bg-[#eaf0ff] px-2 py-1 text-center text-xs font-extrabold text-[#1769ff]">{scoreToLabel(player)}</span></div>)}</div></div><aside><SectionTitle eyebrow="Compartilhamento" title="Os melhores do dia" /><div ref={cardRef} className="relative overflow-hidden rounded-[28px] bg-[#071a38] p-6 text-white shadow-xl shadow-[#071a38]/15"><div className="absolute -right-20 -top-20 h-52 w-52 rounded-full border-[26px] border-[#1769ff]/20" /><div className="relative z-10"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><img src={LOGO} alt="FMR" className="h-9 w-9 rounded-lg object-cover" /><div><p className="font-display text-sm font-extrabold leading-none">FUT · FMR</p><p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#93a7c8]">Seleção do dia</p></div></div><Award className="h-6 w-6 text-[#f1b83d]" /></div><p className="mt-9 max-w-[210px] font-display text-3xl font-extrabold leading-none tracking-tight">Quem jogou,<br /><span className="text-[#f1b83d]">deixou marca.</span></p><div className="mt-7 space-y-2">{players.slice(0, 6).map((player, index) => <div key={player.id} className="flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2"><span className="w-4 text-center text-[10px] font-extrabold text-[#f1b83d]">{index + 1}</span><PlayerAvatar player={player} size="sm" /><span className="flex-1 text-xs font-extrabold">{player.nickname}</span><span className="text-xs font-extrabold text-[#b6c9ea]">{scoreToLabel(player)}</span></div>)}</div><div className="mt-6 border-t border-white/10 pt-4 text-[9px] font-bold uppercase tracking-widest text-[#91a6c8]">27 SET 2025 · ARENA MARRECHAL</div></div></div><Button onClick={onExport} className="mt-4 h-11 w-full rounded-xl bg-[#f1b83d] text-xs font-extrabold text-[#071a38] hover:bg-[#ffc95b]"><Download className="mr-2 h-4 w-4" />Baixar card em PNG</Button><p className="mt-3 text-center text-[10px] font-semibold leading-relaxed text-[#8a98aa]">Gere uma imagem pronta para compartilhar no WhatsApp ou Instagram.</p></aside></div>;
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071a38]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"><div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-[28px] sm:p-6"><div className="mb-5 flex items-start justify-between"><div><h3 className="font-display text-2xl font-extrabold tracking-tight text-[#071a38]">{title}</h3>{subtitle && <p className="mt-1 text-xs font-semibold text-[#8a98aa]">{subtitle}</p>}</div><button onClick={onClose} className="rounded-xl bg-[#f4f6fa] p-2 text-[#7d8ba0] hover:text-[#071a38]"><X className="h-4 w-4" /></button></div>{children}</div></div>;
}

function RefereeModal({ players, teams, events, selectedPlayerId, setSelectedPlayerId, eventType, setEventType, onAdd, onClose, score, durationMinutes, matchNumber, matchStatus, onResetEvents, onResetScore }: { players: Player[]; teams: TeamState; events: MatchEvent[]; selectedPlayerId: number; setSelectedPlayerId: (id: number) => void; eventType: MatchEvent["type"]; setEventType: (type: MatchEvent["type"]) => void; onAdd: () => void; onClose: () => void; score: { blue: number; red: number }; durationMinutes: 8 | 10; matchNumber: number; matchStatus: string; onResetEvents: () => void; onResetScore: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const eventTypes: { type: MatchEvent["type"]; icon: LucideIcon }[] = [{ type: "Gol", icon: Goal }, { type: "Assistência", icon: HandHelping }, { type: "Cartão", icon: Shield }, { type: "Substituição", icon: ArrowRight }];
  return <Modal title="Painel do mesário" subtitle={`Partida ${String(matchNumber).padStart(2, "0")} · ${matchStatus}`}  onClose={onClose}><div className="mb-5 grid grid-cols-3 items-center gap-3 rounded-2xl bg-[#071a38] py-4 text-white"><div className="text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-[#8da4c9]">Azul</p><p className="font-display text-4xl font-extrabold text-[#78a7ff]">{score.blue}</p></div><div className="text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-[#91a6c8]">Cronômetro</p><p className={`font-display text-4xl font-extrabold ${secondsLeft === 0 ? "text-[#ff907d]" : "text-[#f1b83d]"}`}>{minutes}:{seconds}</p><div className="mt-2 flex justify-center gap-1.5"><button onClick={() => setRunning((value) => !value)} className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-extrabold hover:bg-white/20">{running ? "Pausar" : "Iniciar"}</button><button onClick={() => { setRunning(false); setSecondsLeft(durationMinutes * 60); }} className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-extrabold hover:bg-white/20">Zerar</button></div></div><div className="text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-[#d9a69d]">Vermelho</p><p className="font-display text-4xl font-extrabold text-[#ff907d]">{score.red}</p></div></div><p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">O que aconteceu?</p><div className="mb-5 grid grid-cols-4 gap-2">{eventTypes.map(({ type, icon: Icon }) => <button key={type} onClick={() => setEventType(type)} className={`flex flex-col items-center gap-2 rounded-xl border p-2.5 text-[10px] font-extrabold transition ${eventType === type ? "border-[#1769ff] bg-[#eaf0ff] text-[#1769ff]" : "border-[#e3e9f1] text-[#8190a5] hover:border-[#b9c9e0]"}`}><Icon className="h-5 w-5" />{type}</button>)}</div><label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Jogador envolvido</label><select value={selectedPlayerId} onChange={(event) => setSelectedPlayerId(Number(event.target.value))} className="mb-4 h-11 w-full rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-bold text-[#273b5d] outline-none focus:border-[#1769ff]">{players.map((player) => <option key={player.id} value={player.id}>{player.nickname} · {player.position}</option>)}</select><Button onClick={onAdd} className="h-11 w-full rounded-xl bg-[#1769ff] text-xs font-extrabold hover:bg-[#0753d7]"><Plus className="mr-2 h-4 w-4" />Registrar {eventType.toLowerCase()}</Button><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => { onResetScore(); toast.success("Placar zerado."); }} className="h-9 rounded-lg border border-[#dce4f0] bg-white text-[10px] font-extrabold text-[#d65c45]">Zerar placar</button><button onClick={() => { onResetEvents(); toast.success("Eventos e estatísticas da partida zerados."); }} className="h-9 rounded-lg border border-[#dce4f0] bg-white text-[10px] font-extrabold text-[#1769ff]">Redefinir eventos</button></div><div className="mt-6 border-t border-[#edf1f6] pt-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-extrabold text-[#071a38]">Eventos registrados</p><span className="text-[10px] font-bold text-[#8a98aa]">{events.length} hoje</span></div><div className="max-h-32 space-y-1 overflow-y-auto">{events.slice(0, 5).map((event) => <div key={event.id} className="flex items-center gap-2 text-[11px]"><span className="w-10 font-bold text-[#a0adbc]">{event.time}</span><span className="font-extrabold text-[#273b5d]">{event.type}</span><span className="truncate text-[#8190a5]">{event.detail}</span></div>)}</div></div></Modal>;
}


function NotificationModal({ notifications, onClose }: { notifications: AppNotification[]; onClose: () => void }) {
  return <Modal title="Avisos da pelada" subtitle="Atualizações enviadas pela Diretoria" onClose={onClose}>{notifications.length === 0 ? <div className="rounded-2xl bg-[#f6f8fc] p-5 text-center"><Bell className="mx-auto h-8 w-8 text-[#9aa7b8]" /><p className="mt-3 text-sm font-extrabold text-[#273b5d]">Tudo tranquilo por aqui.</p><p className="mt-1 text-xs text-[#8190a5]">Novos avisos e alterações aparecerão neste espaço.</p></div> : <div className="space-y-3">{notifications.map((item) => <div key={item.id} className="rounded-2xl border border-[#dce4f0] bg-[#f7f9fc] p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-extrabold text-[#071a38]">{item.title}</p><span className="whitespace-nowrap text-[10px] font-bold text-[#8a98aa]">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</span></div><p className="mt-2 text-xs leading-relaxed text-[#63728b]">{item.message}</p></div>)}</div>}</Modal>;
}

function AdminSettings({ players, setPlayers, leagueSettings, setLeagueSettings, notifications, setNotifications, activeLeagueSlug, setActiveLeagueSlug, onBack, onResetStats, profileName, profileRole }: { players: Player[]; setPlayers: React.Dispatch<React.SetStateAction<Player[]>>; leagueSettings: LeagueSettings; setLeagueSettings: React.Dispatch<React.SetStateAction<LeagueSettings>>; notifications: AppNotification[]; setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>; activeLeagueSlug: string; setActiveLeagueSlug: (slug: string) => void; onBack: () => void; onResetStats: () => void; profileName: string; profileRole: string }) {
  const [tab, setTab] = useState<"members" | "invites" | "match" | "notices">("members");
  const [draftSettings, setDraftSettings] = useState<LeagueSettings>(leagueSettings);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState<"user" | "admin" | "referee">("user");
  const [memberType, setMemberType] = useState<"monthly" | "guest">("monthly");
  const [position, setPosition] = useState<Player["position"]>("MEI");
  const [inviteCode, setInviteCode] = useState("FMR-2025");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const inviteLink = `${window.location.origin}/?invite=${encodeURIComponent(inviteCode)}&league=FMR`;
  const adminCount = players.filter((player) => player.isAdmin).length;
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editDraft, setEditDraft] = useState<Player | null>(null);

  const captureVenueLocation = () => {
    if (!navigator.geolocation) { toast.error("Este navegador não oferece geolocalização."); return; }
    navigator.geolocation.getCurrentPosition((position) => {
      setDraftSettings((current) => ({ ...current, venueLatitude: Number(position.coords.latitude.toFixed(6)), venueLongitude: Number(position.coords.longitude.toFixed(6)) }));
      toast.success("Local da pelada marcado.", { description: "O check-in poderá ser feito dentro do raio configurado." });
    }, () => toast.error("Não foi possível obter sua localização. Ative o GPS e tente novamente."), { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  };

  const startEdit = (player: Player) => {
    setEditingPlayer(player);
    setEditDraft({ ...player });
  };

  const saveEdit = () => {
    if (!editDraft) return;
    setPlayers((current) => current.map((player) => player.id === editDraft.id ? editDraft : player));
    setEditingPlayer(null);
    setEditDraft(null);
    toast.success("Usuário atualizado.", { description: `${editDraft.nickname} teve o perfil salvo pela Diretoria.` });
  };

  const deleteMember = (player: Player) => {
    const confirmed = window.confirm(`Excluir o cadastro de ${player.nickname}? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;
    setPlayers((current) => current.filter((item) => item.id !== player.id));
    if (editingPlayer?.id === player.id) {
      setEditingPlayer(null);
      setEditDraft(null);
    }
    toast.success("Cadastro excluído.", { description: `${player.nickname} foi removido da liga.` });
  };

  const createMember = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !nickname.trim()) {
      toast.error("Preencha nome completo e apelido.");
      return;
    }
    const newPlayer: Player = {
      id: Date.now(),
      name: name.trim(),
      nickname: nickname.trim(),
      position,
      monthly: memberType === "monthly",
      presence: 0,
      goals: 0,
      assists: 0,
      wins: 0,
      losses: 0,
      cards: 0,
      rating: 6.5,
      checkedIn: false,
      color: role === "admin" ? "#d9a52a" : "#5f82ba",
      isAdmin: role === "admin",
      isReferee: role === "referee",
      presenceConfirmed: false,
    };
    setPlayers((current) => [newPlayer, ...current]);
    setName("");
    setNickname("");
    toast.success(`${role === "admin" ? "Administrador" : role === "referee" ? "Mesário" : "Jogador"} cadastrado.`, { description: `${newPlayer.nickname} já aparece na lista da liga.` });
  };

  const copyInvite = async () => {
    await navigator.clipboard?.writeText(inviteLink);
    toast.success("Link de convite copiado.", { description: "Agora é só colar no grupo do WhatsApp." });
  };

  const shareWhatsApp = () => {
    const message = `⚽ Convite para a liga Fut - Amigos do Forte Marechal Rondon\n\nAcesse o link para entrar no grupo, informar seus dados e participar das peladas:\n${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><button onClick={onBack} className="mb-3 flex items-center gap-1 text-xs font-extrabold text-[#1769ff]"><ArrowRight className="h-3.5 w-3.5 rotate-180" /> Voltar ao resumo</button><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1769ff]">Área protegida · Diretoria</p><h2 className="font-display text-4xl font-extrabold tracking-tight text-[#071a38]">Configurações</h2><p className="mt-2 text-sm text-[#718198]">Gerencie acessos, perfis e o convite de entrada da liga.</p></div><Badge className="w-fit bg-[#fff7dd] text-[#9f7111] hover:bg-[#fff7dd]"><Shield className="mr-1.5 h-3.5 w-3.5" /> Somente administradores</Badge></div>
      <div className="flex gap-1 rounded-xl bg-[#edf2fa] p-1"><button onClick={() => setTab("members")} className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-extrabold ${tab === "members" ? "bg-white text-[#1769ff] shadow-sm" : "text-[#8190a5]"}`}><Users className="mr-2 inline h-4 w-4" />Usuários e admins</button><button onClick={() => setTab("match")} className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-extrabold ${tab === "match" ? "bg-white text-[#1769ff] shadow-sm" : "text-[#8190a5]"}`}><CalendarClock className="mr-2 inline h-4 w-4" />Agenda e jogo</button><button onClick={() => setTab("invites")} className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-extrabold ${tab === "invites" ? "bg-white text-[#1769ff] shadow-sm" : "text-[#8190a5]"}`}><Bell className="mr-2 inline h-4 w-4" />Convite WhatsApp</button></div><button onClick={() => setTab("notices")} className={`mt-2 w-full rounded-lg px-3 py-2.5 text-xs font-extrabold ${tab === "notices" ? "bg-[#eaf0ff] text-[#1769ff]" : "bg-[#edf2fa] text-[#8190a5]"}`}><Bell className="mr-2 inline h-4 w-4" />Avisos e atualizações</button>
      {tab === "members" && <><form onSubmit={createMember} className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm"><div className="mb-5"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Cadastro manual</p><h3 className="mt-1 font-display text-2xl font-extrabold text-[#071a38]">Adicionar à liga</h3></div><div className="grid gap-3 sm:grid-cols-2"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" className="h-11 rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /><input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="Apelido" className="h-11 rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /><select value={role} onChange={(event) => setRole(event.target.value as "user" | "admin" | "referee")} className="h-11 rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1769ff]"><option value="user">Usuário comum</option><option value="admin">Administrador · Diretoria</option><option value="referee">Mesário</option></select><select value={memberType} onChange={(event) => setMemberType(event.target.value as "monthly" | "guest")} className="h-11 rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1769ff]"><option value="monthly">Mensalista</option><option value="guest">Convidado / Diarista</option></select><select value={position} onChange={(event) => setPosition(event.target.value as Player["position"])} className="h-11 rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1769ff]"><option value="GOL">Goleiro</option><option value="DEF">Defensor</option><option value="MEI">Meia</option><option value="ATA">Atacante</option></select><input placeholder="Telefone (opcional)" className="h-11 rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /></div><Button type="submit" className="mt-4 h-11 w-full rounded-xl bg-[#1769ff] text-xs font-extrabold hover:bg-[#0753d7]"><Plus className="mr-2 h-4 w-4" />Cadastrar usuário</Button></form><div className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Membros ativos</p><h3 className="mt-1 font-display text-2xl font-extrabold text-[#071a38]">{players.length} jogadores</h3></div><span className="rounded-full bg-[#eaf8f1] px-2.5 py-1 text-[10px] font-extrabold text-[#21855a]">{adminCount} admin</span></div><div className="space-y-2">{players.slice(0, 6).map((player) => <div key={player.id} className="flex items-center gap-2.5 rounded-xl bg-[#f7f9fc] p-2.5"><PlayerAvatar player={player} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-[#273b5d]">{player.nickname}</p><p className="text-[10px] font-semibold text-[#8a98aa]">{player.position} · {player.monthly ? "Mensalista" : "Diarista"}</p></div>{player.isAdmin && <Badge className="bg-[#fff7dd] text-[#9f7111] hover:bg-[#fff7dd]">Diretoria</Badge>}<button onClick={() => startEdit(player)} title="Editar usuário" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#1769ff] shadow-sm hover:bg-[#eaf0ff]"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => deleteMember(player)} title="Excluir cadastro" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#e5484d] shadow-sm hover:bg-[#fff0f0]"><Trash2 className="h-3.5 w-3.5" /></button><select value={player.availability ?? "available"} onChange={(event) => setPlayers((current) => current.map((item) => item.id === player.id ? { ...item, availability: event.target.value as Player["availability"] } : item))} className="h-8 rounded-lg border border-[#dce4f0] bg-white px-2 text-[10px] font-bold text-[#63728b] outline-none"><option value="available">Disponível</option><option value="indisponível">Indisponível</option><option value="DM">DM</option></select>{(player.availability === "indisponível" || player.availability === "DM") && <CircleX className="h-4 w-4 shrink-0 text-[#e5484d]" />}</div>)}</div></div></>}
      {tab === "match" && <div className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Configuração da pelada</p><h3 className="mt-1 font-display text-2xl font-extrabold text-[#071a38]">Agenda e temporada</h3><p className="mt-2 text-sm leading-relaxed text-[#718198]">Edite o próximo jogo e defina a duração que o cronômetro do mesário usará.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Temporada<input value={draftSettings.season} onChange={(event) => setDraftSettings((current) => ({ ...current, season: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-extrabold outline-none focus:border-[#1769ff]" placeholder="2026" /></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Data do próximo jogo<input type="date" value={draftSettings.matchDate} onChange={(event) => setDraftSettings((current) => ({ ...current, matchDate: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Horário<input type="time" value={draftSettings.matchTime} onChange={(event) => setDraftSettings((current) => ({ ...current, matchTime: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Local<input value={draftSettings.venue} onChange={(event) => setDraftSettings((current) => ({ ...current, venue: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /></label></div><div className="mt-5 rounded-2xl border border-[#dce4f0] bg-[#f7f9fc] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-[#071a38]">Localização para check-in</p><p className="mt-1 text-[10px] leading-relaxed text-[#718198]">Opcional. Marque a quadra com seu GPS para impedir check-ins fora do local.</p></div><MapPin className="h-5 w-5 shrink-0 text-[#1769ff]" /></div><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]"><div className="rounded-xl border border-[#dce4f0] bg-white px-3 py-2 text-[10px] font-semibold text-[#63728b]">{typeof draftSettings.venueLatitude === "number" && typeof draftSettings.venueLongitude === "number" ? `Local marcado: ${draftSettings.venueLatitude}, ${draftSettings.venueLongitude}` : "Nenhum local marcado"}</div><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Raio (m)<input type="number" min="30" max="1000" value={draftSettings.venueRadiusMeters ?? 150} onChange={(event) => setDraftSettings((current) => ({ ...current, venueRadiusMeters: Math.max(30, Number(event.target.value) || 150) }))} className="mt-1 h-9 w-full rounded-lg border border-[#dce4f0] px-2 text-xs font-semibold" /></label></div><div className="mt-3 flex gap-2"><Button onClick={captureVenueLocation} type="button" variant="outline" className="h-9 rounded-lg border-[#b9c9e0] bg-white text-[10px] font-extrabold text-[#1769ff]"><MapPin className="mr-1.5 h-3.5 w-3.5" />Marcar minha localização</Button>{typeof draftSettings.venueLatitude === "number" && <Button onClick={() => setDraftSettings((current) => ({ ...current, venueLatitude: undefined, venueLongitude: undefined }))} type="button" variant="outline" className="h-9 rounded-lg border-[#f1b8ae] bg-white text-[10px] font-extrabold text-[#d65c45]">Remover GPS</Button>}</div></div><p className="mt-5 text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Tempo da partida</p><div className="mt-2 grid grid-cols-2 gap-2">{([8, 10] as const).map((minutes) => <button key={minutes} onClick={() => setDraftSettings((current) => ({ ...current, durationMinutes: minutes }))} className={`rounded-xl border p-3 text-left ${draftSettings.durationMinutes === minutes ? "border-[#1769ff] bg-[#eaf0ff]" : "border-[#dce4f0] bg-white"}`}><p className="font-display text-2xl font-extrabold text-[#071a38]">{minutes} min</p><p className="text-[10px] font-semibold text-[#8190a5]">Cronômetro padrão</p></button>)}</div><div className="mt-5 rounded-2xl border border-[#ffd9d1] bg-[#fff7f4] p-4"><p className="text-xs font-extrabold text-[#a84739]">Zona administrativa</p><p className="mt-1 text-[10px] font-semibold text-[#9a6a63]">Redefine gols, assistências, vitórias, derrotas, cartões e presença da temporada.</p><Button onClick={() => { if (window.confirm("Redefinir todas as estatísticas da liga?")) onResetStats(); }} variant="outline" className="mt-3 h-9 rounded-lg border-[#f1b8ae] bg-white text-[10px] font-extrabold text-[#d65c45]">Redefinir estatísticas</Button></div><Button onClick={() => { setLeagueSettings(draftSettings); toast.success("Agenda e duração atualizadas."); }} className="mt-5 h-11 w-full rounded-xl bg-[#1769ff] text-xs font-extrabold hover:bg-[#0753d7]"><Check className="mr-2 h-4 w-4" />Salvar agenda</Button></div>}
      {tab === "notices" && <div className="space-y-5"><div className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Comunicação da liga</p><h3 className="mt-1 font-display text-2xl font-extrabold text-[#071a38]">Enviar aviso para a galera</h3><input value={noticeTitle} onChange={(event) => setNoticeTitle(event.target.value)} placeholder="Título do aviso" className="mt-5 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /><textarea value={noticeMessage} onChange={(event) => setNoticeMessage(event.target.value)} placeholder="Escreva a atualização, mudança de horário ou recado da Diretoria" className="mt-3 min-h-28 w-full rounded-xl border border-[#dce4f0] p-3 text-sm font-semibold" /><Button onClick={() => { if (!noticeTitle.trim() || !noticeMessage.trim()) { toast.error("Preencha título e mensagem."); return; } setNotifications((current) => [{ id: Date.now(), title: noticeTitle.trim(), message: noticeMessage.trim(), createdAt: Date.now(), author: profileName }, ...current]); setNoticeTitle(""); setNoticeMessage(""); toast.success("Aviso enviado para os usuários da pelada."); }} className="mt-3 h-11 w-full rounded-xl bg-[#1769ff] text-xs font-extrabold"><Bell className="mr-2 h-4 w-4" />Publicar aviso</Button></div><div className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm"><p className="text-xs font-extrabold text-[#071a38]">Avisos publicados</p><div className="mt-3 space-y-2">{notifications.slice(0, 5).map((item) => <div key={item.id} className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-xs font-extrabold text-[#273b5d]">{item.title}</p><p className="mt-1 text-[10px] text-[#8190a5]">{item.message}</p></div>)}</div></div></div>}
      {tab === "match" && <div className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Identidade da pelada</p><h3 className="mt-1 font-display text-2xl font-extrabold text-[#071a38]">Nome, logo e acesso</h3><p className="mt-2 text-sm leading-relaxed text-[#718198]">Defina como a pelada será exibida e compartilhe o identificador para acesso direto.</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Nome da pelada<input value={draftSettings.leagueName} onChange={(event) => setDraftSettings((current) => ({ ...current, leagueName: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Identificador de acesso<input value={draftSettings.leagueSlug} onChange={(event) => setDraftSettings((current) => ({ ...current, leagueSlug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold" /></label></div><div className="mt-3 flex items-center gap-3"><BrandLogo src={draftSettings.logoUrl} name={draftSettings.leagueName} size="sm" /><label className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Logo ou foto<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setDraftSettings((current) => ({ ...current, logoUrl: String(reader.result) })); reader.readAsDataURL(file); }} className="mt-2 block w-full text-xs font-semibold text-[#63728b]" /></label></div><div className="mt-4 rounded-xl bg-[#eaf0ff] p-3 text-xs font-semibold text-[#425675]">Acesso direto: <strong>?pelada={draftSettings.leagueSlug || "sua-pelada"}</strong></div><Button onClick={() => { const slug = draftSettings.leagueSlug || "pelada"; setLeagueSettings(draftSettings); setActiveLeagueSlug(slug); window.history.replaceState({}, "", `?pelada=${encodeURIComponent(slug)}`); setNotifications((current) => [{ id: Date.now(), title: "Identidade da pelada atualizada", message: `${draftSettings.leagueName} agora está usando o novo nome ou logo.`, createdAt: Date.now(), author: profileName }, ...current]); toast.success("Identidade da pelada atualizada."); }} className="mt-4 h-11 w-full rounded-xl bg-[#1769ff] text-xs font-extrabold"><Check className="mr-2 h-4 w-4" />Salvar identidade</Button><div className="mt-5 border-t border-[#edf1f6] pt-5"><p className="text-xs font-extrabold text-[#071a38]">Criar outro perfil de pelada</p><p className="mt-1 text-[10px] text-[#8190a5]">Cria uma nova identidade de acesso para outra demanda.</p><Button onClick={() => { const slug = `pelada-${Date.now().toString().slice(-5)}`; const next = { ...defaultLeagueSettings, leagueName: "Nova pelada", leagueSlug: slug, logoUrl: LOGO }; setDraftSettings(next); setLeagueSettings(next); setActiveLeagueSlug(slug); window.history.replaceState({}, "", `?pelada=${slug}`); toast.success("Novo perfil criado."); }} variant="outline" className="mt-3 h-10 rounded-xl border-[#dce4f0] bg-white text-xs font-extrabold text-[#1769ff]">+ Criar novo perfil</Button></div></div>}
      {tab === "invites" && <div className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Entrada por convite</p><h3 className="mt-1 font-display text-2xl font-extrabold text-[#071a38]">Chame a galera</h3><p className="mt-2 text-sm leading-relaxed text-[#718198]">Quem estiver no grupo do WhatsApp abre o link, informa seus dados e entra na lista da liga sem precisar de senha.</p><label className="mt-5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Código da liga</label><input value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-extrabold tracking-widest outline-none focus:border-[#1769ff]" /><div className="mt-4 rounded-xl bg-[#f6f8fc] p-3"><p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Link gerado</p><p className="break-all text-xs font-semibold leading-relaxed text-[#425675]">{inviteLink}</p></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><Button onClick={copyInvite} variant="outline" className="h-11 rounded-xl border-[#dce4f0] bg-white text-xs font-extrabold"><ClipboardList className="mr-2 h-4 w-4 text-[#1769ff]" />Copiar link</Button><Button onClick={shareWhatsApp} className="h-11 rounded-xl bg-[#218b5e] text-xs font-extrabold hover:bg-[#167148]"><Bell className="mr-2 h-4 w-4" />Abrir WhatsApp</Button></div><p className="mt-4 text-center text-[10px] font-semibold leading-relaxed text-[#8a98aa]">O botão abre o WhatsApp com a mensagem pronta para você escolher o grupo e enviar.</p></div>}
    </div>
    <aside className="space-y-5"><div className="rounded-[24px] bg-[#071a38] p-5 text-white shadow-xl shadow-[#071a38]/15"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#91a6c8]">Segurança da liga</p><p className="mt-1 font-display text-2xl font-extrabold">Acesso controlado</p></div><Shield className="h-8 w-8 text-[#f1b83d]" /></div><p className="mt-4 text-xs leading-relaxed text-[#bac7da]">Apenas a Diretoria pode criar administradores, editar perfis e gerar convites de entrada.</p><div className="mt-5 border-t border-white/10 pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#91a6c8]">Código vigente</p><p className="mt-1 font-display text-2xl font-extrabold tracking-widest text-[#f1b83d]">{inviteCode}</p></div></div><div className="rounded-[24px] border border-[#dce4f0] bg-white p-5 shadow-sm"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Configuração atual</p><div className="mt-4 space-y-3"><SettingsRow icon={Clock3} label="Próximo jogo" value={`${formatLongDate(leagueSettings.matchDate)} · ${leagueSettings.matchTime}`} /><SettingsRow icon={MapPin} label="Local" value={leagueSettings.venue} /><SettingsRow icon={Timer} label="Duração" value={`${leagueSettings.durationMinutes} minutos`} /><SettingsRow icon={CircleUserRound} label="Seu perfil" value={profileName} badge={profileRole} /></div></div></aside>{editingPlayer && editDraft && <Modal title="Editar usuário" subtitle="Ação exclusiva da Diretoria" onClose={() => { setEditingPlayer(null); setEditDraft(null); }}><div className="mb-4 rounded-xl bg-[#eaf0ff] p-3"><p className="text-xs font-extrabold text-[#17366c]">Atualize os dados de {editingPlayer.nickname}.</p><p className="mt-1 text-[10px] font-semibold text-[#617aa6]">As alterações ficam disponíveis imediatamente no sorteio, fila e ranking.</p></div><div className="grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Nome completo<input value={editDraft.name} onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Apelido<input value={editDraft.nickname} onChange={(event) => setEditDraft({ ...editDraft, nickname: event.target.value })} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Perfil<select value={editDraft.isAdmin ? "admin" : editDraft.isReferee ? "referee" : "user"} onChange={(event) => setEditDraft({ ...editDraft, isAdmin: event.target.value === "admin", isReferee: event.target.value === "referee" })} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1769ff]"><option value="user">Usuário comum</option><option value="admin">Administrador · Diretoria</option><option value="referee">Mesário</option></select></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Tipo<select value={editDraft.monthly ? "monthly" : "guest"} onChange={(event) => setEditDraft({ ...editDraft, monthly: event.target.value === "monthly" })} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1769ff]"><option value="monthly">Mensalista</option><option value="guest">Convidado / Diarista</option></select></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Posição<select value={editDraft.position} onChange={(event) => setEditDraft({ ...editDraft, position: event.target.value as Player["position"] })} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1769ff]"><option value="GOL">Goleiro</option><option value="DEF">Defensor</option><option value="MEI">Meia</option><option value="ATA">Atacante</option></select></label><label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8a98aa]">Disponibilidade<select value={editDraft.availability ?? "available"} onChange={(event) => setEditDraft({ ...editDraft, availability: event.target.value as Player["availability"] })} className="mt-2 h-11 w-full rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1769ff]"><option value="available">Disponível</option><option value="indisponível">Indisponível</option><option value="DM">DM</option></select></label></div><div className="mt-5 flex gap-2"><Button onClick={() => { setEditingPlayer(null); setEditDraft(null); }} variant="outline" className="h-11 flex-1 rounded-xl border-[#dce4f0] bg-white text-xs font-extrabold">Cancelar</Button><Button onClick={saveEdit} className="h-11 flex-1 rounded-xl bg-[#1769ff] text-xs font-extrabold hover:bg-[#0753d7]"><Check className="mr-2 h-4 w-4" />Salvar alterações</Button></div></Modal>}
  </div>;
}

function InviteRegistrationModal({ onClose, onCreate }: { onClose: () => void; onCreate: (player: Player) => void }) {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState<Player["position"]>("MEI");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !nickname.trim() || !phone.trim()) { toast.error("Informe nome, apelido e telefone."); return; }
    onCreate({ id: Date.now(), name: name.trim(), nickname: nickname.trim(), position, monthly: false, presence: 0, goals: 0, assists: 0, wins: 0, losses: 0, cards: 0, rating: 6.5, checkedIn: false, color: "#5f82ba" });
  };
  return <Modal title="Você foi convidado" subtitle="Fut · Amigos do FMR" onClose={onClose}><div className="mb-5 rounded-2xl bg-[#eaf0ff] p-4"><p className="text-sm font-extrabold text-[#17366c]">Entre para a liga e participe das próximas peladas.</p><p className="mt-1 text-xs leading-relaxed text-[#617aa6]">Seu cadastro será enviado para a Diretoria aprovar e incluir na lista de presença.</p></div><form onSubmit={submit} className="space-y-3"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo" className="h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /><input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="Como quer ser chamado?" className="h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="WhatsApp / telefone" className="h-11 w-full rounded-xl border border-[#dce4f0] px-3 text-sm font-semibold outline-none focus:border-[#1769ff]" /><select value={position} onChange={(event) => setPosition(event.target.value as Player["position"])} className="h-11 w-full rounded-xl border border-[#dce4f0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#1769ff]"><option value="GOL">Goleiro</option><option value="DEF">Defensor</option><option value="MEI">Meia</option><option value="ATA">Atacante</option></select><Button type="submit" className="h-11 w-full rounded-xl bg-[#1769ff] text-xs font-extrabold hover:bg-[#0753d7]"><Check className="mr-2 h-4 w-4" />Enviar meu cadastro</Button></form></Modal>;
}

function SettingsRow({ icon: Icon, label, value, badge }: { icon: LucideIcon; label: string; value: string; badge?: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-[#f7f9fc] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1769ff] shadow-sm"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-[#8a98aa]">{label}</p><p className="text-sm font-extrabold text-[#273b5d]">{value}</p></div>{badge && <Badge className="bg-[#eaf0ff] text-[#1769ff] hover:bg-[#eaf0ff]">{badge}</Badge>}</div>;
}
