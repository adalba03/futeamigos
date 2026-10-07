import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const leagueMembers = mysqlTable("league_members", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  nickname: varchar("nickname", { length: 80 }),
  phone: varchar("phone", { length: 32 }),
  memberType: mysqlEnum("memberType", ["monthly", "guest"]).default("monthly").notNull(),
  position: mysqlEnum("position", ["GOL", "DEF", "MEI", "ATA"]).default("MEI").notNull(),
  dominantFoot: mysqlEnum("dominantFoot", ["right", "left", "both"]).default("right").notNull(),
  shirtNumber: int("shirtNumber"),
  age: int("age"),
  favoriteTeam: varchar("favoriteTeam", { length: 80 }),
  isAdmin: int("isAdmin").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  venue: varchar("venue", { length: 160 }).default("Arena Marrechal").notNull(),
  status: mysqlEnum("status", ["scheduled", "live", "finished"]).default("scheduled").notNull(),
  blueScore: int("blueScore").default(0).notNull(),
  redScore: int("redScore").default(0).notNull(),
  bluePlayers: text("bluePlayers"),
  redPlayers: text("redPlayers"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
});

export const checkIns = mysqlTable("check_ins", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  memberId: int("memberId").notNull(),
  checkedInAt: timestamp("checkedInAt").defaultNow().notNull(),
  queueOrder: int("queueOrder").notNull(),
  status: mysqlEnum("status", ["confirmed", "waiting", "playing", "finished"]).default("confirmed").notNull(),
});

export const matchEvents = mysqlTable("match_events", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull(),
  memberId: int("memberId").notNull(),
  type: mysqlEnum("type", ["goal", "assist", "yellow_card", "red_card", "substitution"]).notNull(),
  note: varchar("note", { length: 240 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LeagueMember = typeof leagueMembers.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type MatchEvent = typeof matchEvents.$inferSelect;
