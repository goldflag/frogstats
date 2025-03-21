import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/const";
import { useStore } from "../../lib/store";
import { APIResponse } from "../types";
import { getStartAndEndDate, authedFetch } from "../utils";

export type UserSessionsResponse = {
  session_id: string;
  browser: string;
  operating_system: string;
  device_type: string;
  country: string;
  firstTimestamp: string;
  lastTimestamp: string;
  duration: number; // Duration in seconds
  pageviews: {
    pathname: string;
    querystring: string;
    title: string;
    timestamp: string;
    referrer: string;
  }[];
}[];

export function useGetUserSessions(userId: string) {
  const { time, site, filters } = useStore();
  const { startDate, endDate } = getStartAndEndDate(time);

  return useQuery({
    queryKey: ["user-sessions", userId, time, site, filters],
    queryFn: () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return authedFetch(
        `${BACKEND_URL}/user/${userId}/sessions?${
          startDate ? `startDate=${startDate}&` : ""
        }${
          endDate ? `endDate=${endDate}&` : ""
        }timezone=${timezone}&site=${site}&filters=${JSON.stringify(filters)}`
      ).then((res) => res.json());
    },
    staleTime: Infinity,
  });
}

type GetSessionsResponse = {
  session_id: string;
  user_id: string;
  country: string;
  iso_3166_2: string;
  language: string;
  device_type: string;
  browser: string;
  operating_system: string;
  referrer: string;
  last_pageview_timestamp: string;
  pageviews: number;
}[];

export function useGetSessionsInfinite() {
  const { time, site, filters } = useStore();
  const { startDate, endDate } = getStartAndEndDate(time);

  return useInfiniteQuery<APIResponse<GetSessionsResponse>>({
    queryKey: ["sessions-infinite", time, site, filters],
    queryFn: ({ pageParam = 1 }) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      let url = `${BACKEND_URL}/sessions?${
        startDate ? `startDate=${startDate}&` : ""
      }${
        endDate ? `endDate=${endDate}&` : ""
      }timezone=${timezone}&site=${site}&filters=${JSON.stringify(
        filters
      )}&page=${pageParam}`;

      return authedFetch(url).then((res) => res.json());
    },
    initialPageParam: 1,
    getNextPageParam: (
      lastPage: APIResponse<GetSessionsResponse>,
      allPages
    ) => {
      // If we have data and it's a full page (100 items), there might be more
      if (lastPage?.data && lastPage.data.length === 100) {
        return allPages.length + 1;
      }
      return undefined;
    },
    staleTime: Infinity,
  });
}
