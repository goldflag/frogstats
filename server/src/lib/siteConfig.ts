import { db } from "../db/postgres/postgres.js";
import { sites } from "../db/postgres/schema.js";

// Site configuration interface
interface SiteConfigData {
  public: boolean;
  saltUserIds: boolean;
  domain: string;
  blockBots: boolean;
}

class SiteConfig {
  private siteConfigMap: Map<number, SiteConfigData> = new Map();
  private initialized: boolean = false;

  async loadSiteConfigs() {
    try {
      const allSites = await db
        .select({
          siteId: sites.siteId,
          public: sites.public,
          saltUserIds: sites.saltUserIds,
          domain: sites.domain,
          blockBots: sites.blockBots,
        })
        .from(sites);

      // Reset the map
      this.siteConfigMap.clear();

      // Populate the map with site IDs and their configuration
      for (const site of allSites) {
        this.siteConfigMap.set(site.siteId, {
          public: site.public || false,
          saltUserIds: site.saltUserIds || false,
          domain: site.domain || "",
          blockBots: site.blockBots === undefined ? true : site.blockBots,
        });
      }

      this.initialized = true;
    } catch (error) {
      console.error("Error loading site configurations:", error);
      this.initialized = false;
    }
  }

  /**
   * Check if a site is public without hitting the database
   */
  isSitePublic(siteId: string | number): boolean {
    const numericSiteId = Number(siteId);
    const config = this.siteConfigMap.get(numericSiteId);
    return config?.public || false;
  }

  /**
   * Check if a site has user ID salting enabled
   */
  shouldSaltUserIds(siteId: string | number): boolean {
    const numericSiteId = Number(siteId);
    const config = this.siteConfigMap.get(numericSiteId);
    return config?.saltUserIds || false;
  }

  /**
   * Check if a site has bot blocking enabled
   */
  shouldBlockBots(siteId: string | number): boolean {
    const numericSiteId = Number(siteId);
    const config = this.siteConfigMap.get(numericSiteId);
    // Default to true if configuration is not found (safeguard)
    return config?.blockBots !== false;
  }

  /**
   * Get the domain of a site
   */
  getSiteDomain(siteId: string | number): string {
    const numericSiteId = Number(siteId);
    const config = this.siteConfigMap.get(numericSiteId);
    return config?.domain || "";
  }

  /**
   * Update the public status of a site in the cache
   */
  updateSitePublicStatus(siteId: number, isPublic: boolean): void {
    const config = this.siteConfigMap.get(siteId) || {
      public: false,
      saltUserIds: false,
      domain: "",
      blockBots: true,
    };
    config.public = isPublic;
    this.siteConfigMap.set(siteId, config);
  }

  /**
   * Update the salt user IDs setting of a site in the cache
   */
  updateSiteSaltSetting(siteId: number, saltUserIds: boolean): void {
    const config = this.siteConfigMap.get(siteId) || {
      public: false,
      saltUserIds: false,
      domain: "",
      blockBots: true,
    };
    config.saltUserIds = saltUserIds;
    this.siteConfigMap.set(siteId, config);
  }

  /**
   * Update the bot blocking setting of a site in the cache
   */
  updateSiteBlockBotsSetting(siteId: number, blockBots: boolean): void {
    const config = this.siteConfigMap.get(siteId) || {
      public: false,
      saltUserIds: false,
      domain: "",
      blockBots: true,
    };
    config.blockBots = blockBots;
    this.siteConfigMap.set(siteId, config);
  }

  /**
   * Update the domain of a site in the cache
   */
  updateSiteDomain(siteId: number, domain: string): void {
    const config = this.siteConfigMap.get(siteId) || {
      public: false,
      saltUserIds: false,
      domain: "",
      blockBots: true,
    };
    config.domain = domain;
    this.siteConfigMap.set(siteId, config);
  }

  /**
   * Add a new site to the cache
   */
  addSite(siteId: number, config: SiteConfigData): void {
    this.siteConfigMap.set(siteId, config);
  }

  /**
   * Remove a site from the cache
   */
  removeSite(siteId: number): void {
    this.siteConfigMap.delete(siteId);
  }

  /**
   * Ensure the cache is initialized
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.loadSiteConfigs();
    }
  }
}

// Singleton instance
export const siteConfig = new SiteConfig();
