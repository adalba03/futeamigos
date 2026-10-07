import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { addMatchEvent, createMatch, getLeagueSnapshot } from "./db";

const eventType = z.enum(["goal", "assist", "yellow_card", "red_card", "substitution"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  league: router({
    snapshot: publicProcedure.query(() => getLeagueSnapshot()),
    createMatch: publicProcedure.input(z.object({
      scheduledAt: z.coerce.date(),
      venue: z.string().max(160).optional(),
      bluePlayers: z.array(z.number().int()).optional(),
      redPlayers: z.array(z.number().int()).optional(),
    })).mutation(({ input }) => createMatch(input)),
    addEvent: publicProcedure.input(z.object({
      matchId: z.number().int(),
      memberId: z.number().int(),
      type: eventType,
      note: z.string().max(240).optional(),
    })).mutation(({ input }) => addMatchEvent(input)),
  }),
});

export type AppRouter = typeof appRouter;
