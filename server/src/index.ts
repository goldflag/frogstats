import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { toNodeHandler } from "better-auth/node";
import Fastify from "fastify";
import cron from "node-cron";
import { dirname, join } from "path";
import { Headers, HeadersInit } from "undici";
import { fileURLToPath } from "url";
import { addSite } from "./actions/sites/addSite.js";
import { deleteSite } from "./actions/sites/deleteSite.js";
import { getSites } from "./actions/sites/getSites.js";
import { trackPageView } from "./actions/trackPageView.js";
import { getBrowsers } from "./api/getBrowsers.js";
import { getCountries } from "./api/getCountries.js";
import { getDevices } from "./api/getDevices.js";
import { getLiveUsercount } from "./api/getLiveUsercount.js";
import { getOperatingSystems } from "./api/getOperatingSystems.js";
import { getOverview } from "./api/getOverview.js";
import { getPages } from "./api/getPages.js";
import { getPageViews } from "./api/getPageViews.js";
import { getReferrers } from "./api/getReferrers.js";
import { initializeClickhouse } from "./db/clickhouse/clickhouse.js";
import { initializePostgres, sql } from "./db/postgres/postgres.js";
import { cleanupOldSessions } from "./db/postgres/session-cleanup.js";
import { auth, initAuth } from "./lib/auth.js";
import { mapHeaders } from "./lib/betterAuth.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
  maxParamLength: 1500,
  trustProxy: true,
});

const domains = await sql`SELECT domain FROM sites`;
const allowList = [
  "http://localhost:3002",
  String(process.env.BASE_URL),
  ...domains.map(({ domain }) => `https://${domain}`),
];
initAuth(allowList);

server.register(cors, {
  origin: allowList,
  credentials: true,
});

// Serve static files
server.register(fastifyStatic, {
  root: join(__dirname, "../public"),
  prefix: "/", // or whatever prefix you need
});

server.register(
  async (fastify, options) => {
    await fastify.register((fastify) => {
      const authHandler = toNodeHandler(options.auth);

      fastify.addContentTypeParser(
        "application/json",
        /* c8 ignore next 3 */
        (_request, _payload, done) => {
          done(null, null);
        }
      );

      fastify.all("/api/auth/*", async (request, reply: any) => {
        reply.raw.setHeaders(mapHeaders(reply.getHeaders()));
        await authHandler(request.raw, reply.raw);
      });
      fastify.all("/auth/*", async (request, reply: any) => {
        reply.raw.setHeaders(mapHeaders(reply.getHeaders()));
        await authHandler(request.raw, reply.raw);
      });
    });
  },
  { auth: auth! }
);

server.addHook("onRequest", async (request, reply) => {
  const { url } = request.raw;

  // Bypass auth for health check and tracking
  if (
    url?.startsWith("/health") ||
    url?.startsWith("/track/pageview") ||
    url?.startsWith("/analytics") ||
    url?.startsWith("/auth") ||
    url?.startsWith("/api/auth")
  ) {
    return;
  }

  try {
    // Convert Fastify headers object into Fetch-compatible Headers
    const headers = new Headers(request.headers as HeadersInit);

    // Get session from BetterAuth
    const session = await auth!.api.getSession({ headers });

    if (!session) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    // Attach session user info to request
    request.user = session.user;
  } catch (err) {
    console.error("Auth Error:", err);
    return reply.status(500).send({ error: "Auth check failed" });
  }
});

server.get("/live-user-count/:site", getLiveUsercount);
server.get("/overview", getOverview);
server.get("/countries", getCountries);
server.get("/browsers", getBrowsers);
server.get("/operating-systems", getOperatingSystems);
server.get("/devices", getDevices);
server.get("/pages", getPages);
server.get("/referrers", getReferrers);
server.get("/pageviews", getPageViews);

server.post("/add-site", addSite);
server.post("/delete-site/:id", deleteSite);
server.get("/get-sites", getSites);

// Track pageview endpoint
server.post("/track/pageview", trackPageView);

const start = async () => {
  try {
    console.info("Starting server...");
    // Initialize the database
    await Promise.allSettled([initializeClickhouse(), initializePostgres()]);
    // Start the server
    await server.listen({ port: 3001, host: "0.0.0.0" });
    cron.schedule("*/60 * * * * *", () => {
      console.log("Cleaning up old sessions");
      cleanupOldSessions();
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

declare module "fastify" {
  interface FastifyRequest {
    user?: any; // Or define a more specific user type
  }
}
