"use client";

import Link from "next/link";
import { useGetSites } from "../hooks/api";
import { AddSite } from "./components/AddSite";
import { SiteSettings } from "../components/SiteSettings/SiteSettings";

export default function Home() {
  const { data: sites } = useGetSites();

  return (
    <div className="flex min-h-screen flex-col pt-1">
      <div className="flex justify-between">
        <div className="text-2xl font-bold">Websites</div>
        <AddSite />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {sites?.data?.map((site) => (
          <div
            className="flex justify-between gap-2 p-4 rounded-lg bg-neutral-900 text-lg font-semibold"
            key={site.siteId}
          >
            <Link href={`/${site.siteId}`}>
              <div className="flex gap-2">
                <img
                  className="w-6 mr-1"
                  src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=48`}
                />
                {site.domain}
              </div>
            </Link>
            <SiteSettings siteId={site.siteId} />
          </div>
        ))}
      </div>
    </div>
  );
}
