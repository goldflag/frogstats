import { DateTime } from "luxon";
import clickhouse from "../db/clickhouse/clickhouse.js";
import { TrackingPayload } from "../types.js";
import { getDeviceType } from "../utils.js";

type TotalPayload = TrackingPayload & {
  userId: string;
  timestamp: string;
  sessionId: string;
  ua: UAParser.IResult;
  referrer: string;
  ipAddress: string;
};

class PageviewQueue {
  private queue: TotalPayload[] = [];
  private batchSize = 5000;
  private interval = 10000; // 10 seconds
  private processing = false;

  constructor() {
    // Start processing interval
    setInterval(() => this.processQueue(), this.interval);
  }

  async add(pageview: TotalPayload) {
    this.queue.push(pageview);
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    // Get batch of pageviews
    const batch = this.queue.splice(0, this.batchSize);
    const ips = [...new Set(batch.map((pv) => pv.ipAddress))];

    let geoData: any;

    try {
      // Get geo data for all IPs in batch
      const geoResponse = await fetch("https://tracking.tomato.gg/geoip/bulk", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          //   "Accept-Encoding": "gzip",
        },
        body: JSON.stringify({ ips }),
      });
      geoData = await geoResponse.json();
    } catch (error) {
      console.error("Error getting geo data:", error);
    }

    // Process each pageview with its geo data
    const processedPageviews = batch.map((pv) => {
      const countryCode = geoData?.[pv.ipAddress]?.data?.countryIso || "";
      const regionCode = geoData?.[pv.ipAddress]?.data?.subdivisions?.[0]?.isoCode || "";

      return {
        site_id: pv.site_id,
        timestamp: DateTime.fromISO(pv.timestamp).toFormat("yyyy-MM-dd HH:mm:ss"),
        session_id: pv.sessionId,
        user_id: pv.userId,
        hostname: pv.hostname || "",
        pathname: pv.pathname || "",
        querystring: pv.querystring || "",
        page_title: pv.page_title || "",
        referrer: pv.referrer || "",
        browser: pv.ua.browser.name || "",
        browser_version: pv.ua.browser.major || "",
        operating_system: pv.ua.os.name || "",
        operating_system_version: pv.ua.os.version || "",
        language: pv.language || "",
        screen_width: pv.screenWidth || 0,
        screen_height: pv.screenHeight || 0,
        device_type: getDeviceType(pv.screenWidth, pv.screenHeight, pv.ua),
        country: countryCode,
        iso_3166_2: countryCode && regionCode ? countryCode + "-" + regionCode : "",
      }
    });

    console.info("bulk insert: ", processedPageviews.length);
    // Bulk insert into database
    try {
      await clickhouse.insert({
        table: "pageviews",
        values: processedPageviews,
        format: "JSONEachRow",
      });
    } catch (error) {
      console.error("Error processing pageview queue:", error);
    } finally {
      this.processing = false;
    }
  }
}

// Create singleton instance
export const pageviewQueue = new PageviewQueue();
