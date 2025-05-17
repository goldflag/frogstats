import { eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { sites } from "../../db/postgres/schema.js";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";
import { siteConfig } from "../../lib/siteConfig.js";

interface ChangeSiteBlockBotsRequest {
  Body: {
    siteId: number;
    blockBots: boolean;
  };
}

export async function changeSiteBlockBots(
  request: FastifyRequest<ChangeSiteBlockBotsRequest>,
  reply: FastifyReply
) {
  const { siteId, blockBots } = request.body;

  const userHasAdminAccessToSite = await getUserHasAdminAccessToSite(
    request,
    String(siteId)
  );
  if (!userHasAdminAccessToSite) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    // Fetch site to check it exists
    const site = await db.query.sites.findFirst({
      where: eq(sites.siteId, siteId),
    });

    if (!site) {
      return reply.status(404).send({ error: "Site not found" });
    }

    // Update site blockBots setting
    await db
      .update(sites)
      .set({
        blockBots: blockBots,
        updatedAt: new Date(),
      })
      .where(eq(sites.siteId, siteId));

    // Update the site config cache
    siteConfig.updateSiteBlockBotsSetting(siteId, blockBots);

    return reply.status(200).send({ success: true });
  } catch (error) {
    console.error("Error changing site bot blocking setting:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
