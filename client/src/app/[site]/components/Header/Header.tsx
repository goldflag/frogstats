"use client";
import { Circle } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { goBack, goForward, Time, useStore } from "@/lib/store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateSelector } from "./DateSelector";
import { DateTime } from "luxon";
import { authedFetch } from "@/hooks/utils";
import { useGetLiveUsercount, useGetSites } from "../../../../hooks/api";
import { usePathname } from "next/navigation";

const canGoForward = (time: Time) => {
  const currentDay = DateTime.now().startOf("day");
  if (time.mode === "day") {
    return !(DateTime.fromISO(time.day).startOf("day") >= currentDay);
  }

  if (time.mode === "range") {
    return !(DateTime.fromISO(time.endDate).startOf("day") >= currentDay);
  }

  if (time.mode === "week") {
    return !(DateTime.fromISO(time.week).startOf("week") >= currentDay);
  }

  if (time.mode === "month") {
    return !(DateTime.fromISO(time.month).startOf("month") >= currentDay);
  }

  if (time.mode === "year") {
    return !(DateTime.fromISO(time.year).startOf("year") >= currentDay);
  }

  return false;
};

export function Header() {
  const { data } = useGetLiveUsercount();
  const { time } = useStore();
  const { data: sites } = useGetSites();
  const pathname = usePathname();

  const site = sites?.data?.find(
    (site) => site.site_id === Number(pathname.slice(1))
  );

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex gap-3">
        <div className="flex items-center gap-2 text-xl font-bold">
          <img
            className="w-7 mr-1"
            src={`https://www.google.com/s2/favicons?domain=${site?.domain}&sz=64`}
          />
          <div>{site?.domain}</div>
        </div>
        <div className="flex items-center gap-1 text-base text-neutral-600 dark:text-neutral-400">
          <Circle size={12} weight="fill" color="hsl(var(--green-500))" />
          {data?.count} users online
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DateSelector />
        <div className="flex items-center">
          <Button variant="default" size="icon" onClick={goBack}>
            <ChevronLeft />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={goForward}
            disabled={!canGoForward(time)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
