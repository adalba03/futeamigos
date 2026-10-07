import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, checkIns, leagueMembers, matchEvents, matches, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getLeagueSnapshot() {
  const db = await getDb();
  if (!db) return { members: [], matches: [], events: [], checkIns: [] };
  const [members, recentMatches, events, recentCheckIns] = await Promise.all([
    db.select().from(leagueMembers),
    db.select().from(matches).orderBy(desc(matches.scheduledAt)).limit(20),
    db.select().from(matchEvents).orderBy(desc(matchEvents.createdAt)).limit(50),
    db.select().from(checkIns).orderBy(desc(checkIns.checkedInAt)).limit(100),
  ]);
  return { members, matches: recentMatches, events, checkIns: recentCheckIns };
}

export async function createMatch(input: { scheduledAt: Date; venue?: string; bluePlayers?: number[]; redPlayers?: number[] }) {
  const db = await getDb();
  if (!db) return { id: 0, ...input, status: "scheduled" as const };
  const result = await db.insert(matches).values({
    scheduledAt: input.scheduledAt,
    venue: input.venue ?? "Arena Marrechal",
    bluePlayers: JSON.stringify(input.bluePlayers ?? []),
    redPlayers: JSON.stringify(input.redPlayers ?? []),
  });
  return { id: Number(result[0].insertId), ...input, status: "scheduled" as const };
}

export async function addMatchEvent(input: { matchId: number; memberId: number; type: "goal" | "assist" | "yellow_card" | "red_card" | "substitution"; note?: string }) {
  const db = await getDb();
  if (!db) return { id: 0, ...input };
  const result = await db.insert(matchEvents).values(input);
  return { id: Number(result[0].insertId), ...input };
}
