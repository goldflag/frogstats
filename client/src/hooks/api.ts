import {
  useQuery,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/const";
import { FilterParameter, useStore } from "../lib/store";
import { authedFetch, getStartAndEndDate } from "./utils";
import { authClient } from "@/lib/auth";

export type APIResponse<T> = {
  data: T;
  error?: string;
};

export function useGetLiveUsercount() {
  const { site } = useStore();
  return useQuery({
    queryKey: ["live-user-count", site],
    queryFn: () =>
      authedFetch(`${BACKEND_URL}/live-user-count/${site}`).then((res) =>
        res.json()
      ),
  });
}

type PeriodTime = "current" | "previous";

export type SingleColResponse = {
  value: string;
  count: number;
  percentage: number;
};

export function useSingleCol({
  parameter,
  limit = 10000,
  periodTime,
  useFilters = true,
}: {
  parameter: FilterParameter;
  limit?: number;
  periodTime?: PeriodTime;
  useFilters?: boolean;
}): UseQueryResult<APIResponse<SingleColResponse[]>> {
  const { time, previousTime, site, filters } = useStore();
  const timeToUse = periodTime === "previous" ? previousTime : time;
  const { startDate, endDate } = getStartAndEndDate(timeToUse);

  return useQuery({
    queryKey: [parameter, timeToUse, site, filters, limit],
    queryFn: () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return authedFetch(
        `${BACKEND_URL}/single-col?${
          startDate ? `startDate=${startDate}&` : ""
        }${
          endDate ? `endDate=${endDate}&` : ""
        }timezone=${timezone}&site=${site}&parameter=${parameter}${
          limit ? `&limit=${limit}` : ""
        }${useFilters ? `&filters=${JSON.stringify(filters)}` : ""}`
      ).then((res) => res.json());
    },
    staleTime: Infinity,
    placeholderData: (_, query: any) => {
      if (!query?.queryKey) return undefined;
      const prevQueryKey = query.queryKey as [string, string, string];
      const [, , prevSite] = prevQueryKey;

      if (prevSite === site) {
        return query.state.data;
      }
      return undefined;
    },
  });
}

export function useGenericQuery<T>(
  endpoint: string
): UseQueryResult<APIResponse<T>> {
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => {
      return authedFetch(`${BACKEND_URL}/${endpoint}`).then((res) =>
        res.json()
      );
    },
    staleTime: Infinity,
  });
}

export function useGenericSiteDataQuery<T>(
  endpoint: string,
  periodTime?: PeriodTime
): UseQueryResult<APIResponse<T>> {
  const { time, previousTime, site, filters } = useStore();
  const timeToUse = periodTime === "previous" ? previousTime : time;
  const { startDate, endDate } = getStartAndEndDate(timeToUse);

  return useQuery({
    queryKey: [endpoint, timeToUse, site, filters],
    queryFn: () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return authedFetch(
        `${BACKEND_URL}/${endpoint}?${
          startDate ? `startDate=${startDate}&` : ""
        }${
          endDate ? `endDate=${endDate}&` : ""
        }timezone=${timezone}&site=${site}&filters=${JSON.stringify(filters)}`
      ).then((res) => res.json());
    },
    staleTime: Infinity,
    placeholderData: (_, query: any) => {
      if (!query?.queryKey) return undefined;
      const prevQueryKey = query.queryKey as [string, string, string];
      const [, , prevSite] = prevQueryKey;

      if (prevSite === site) {
        return query.state.data;
      }
      return undefined;
    },
  });
}

export type GetOverviewBucketedResponse = {
  time: string;
  pageviews: number;
  sessions: number;
  pages_per_session: number;
  bounce_rate: number;
  session_duration: number;
  users: number;
}[];

export function useGetOverviewBucketed({
  periodTime,
  past24Hours,
  site,
}: {
  periodTime?: PeriodTime;
  past24Hours?: boolean;
  site?: number | string;
}): UseQueryResult<APIResponse<GetOverviewBucketedResponse>> {
  const { time, previousTime, bucket, filters } = useStore();

  const timeToUse = periodTime === "previous" ? previousTime : time;

  const { startDate, endDate } = getStartAndEndDate(timeToUse);

  return useQuery({
    queryKey: [
      "overview-bucketed",
      timeToUse,
      bucket,
      site,
      filters,
      past24Hours,
    ],
    queryFn: () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return authedFetch(
        `${BACKEND_URL}/overview-bucketed?${
          startDate ? `startDate=${startDate}&` : ""
        }${
          endDate ? `endDate=${endDate}&` : ""
        }timezone=${timezone}&bucket=${bucket}&site=${site}&filters=${JSON.stringify(
          filters
        )}${past24Hours ? `&past24Hours=${past24Hours}` : ""}`
      ).then((res) => res.json());
    },
    placeholderData: (_, query: any) => {
      if (!query?.queryKey) return undefined;
      const prevQueryKey = query.queryKey as [string, string, string];
      const [, , prevSite] = prevQueryKey;

      if (prevSite === site) {
        return query.state.data;
      }
      return undefined;
    },
    staleTime: Infinity,
  });
}

export type GetOverviewResponse = {
  sessions: number;
  pageviews: number;
  users: number;
  pages_per_session: number;
  bounce_rate: number;
  session_duration: number;
};

export function useGetOverview({
  periodTime,
  past24Hours,
  site,
}: {
  periodTime?: PeriodTime;
  past24Hours?: boolean;
  site?: number | string;
}) {
  const { time, previousTime, filters } = useStore();
  const timeToUse = periodTime === "previous" ? previousTime : time;
  const { startDate, endDate } = getStartAndEndDate(timeToUse);

  return useQuery({
    queryKey: ["overview", timeToUse, site, filters, past24Hours],
    queryFn: () => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return authedFetch(
        `${BACKEND_URL}/overview?${startDate ? `startDate=${startDate}&` : ""}${
          endDate ? `endDate=${endDate}&` : ""
        }timezone=${timezone}&site=${site}&filters=${JSON.stringify(filters)}${
          past24Hours ? `&past24Hours=${past24Hours}` : ""
        }`
      ).then((res) => res.json());
    },
    staleTime: Infinity,
    placeholderData: (_, query: any) => {
      if (!query?.queryKey) return undefined;
      const prevQueryKey = query.queryKey as [string, string, string];
      const [, , prevSite] = prevQueryKey;

      if (prevSite === site) {
        return query.state.data;
      }
      return undefined;
    },
  });
}

export type GetSitesResponse = {
  siteId: number;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}[];

export function useGetSites() {
  return useGenericQuery<GetSitesResponse>("get-sites");
}

export function addSite(domain: string, name: string, organizationId: string) {
  return authedFetch(`${BACKEND_URL}/add-site`, {
    method: "POST",
    body: JSON.stringify({
      domain,
      name,
      organizationId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function deleteSite(siteId: number) {
  return authedFetch(`${BACKEND_URL}/delete-site/${siteId}`, {
    method: "POST",
  });
}

export function changeSiteDomain(siteId: number, newDomain: string) {
  return authedFetch(`${BACKEND_URL}/change-site-domain`, {
    method: "POST",
    body: JSON.stringify({
      siteId,
      newDomain,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function useSiteHasData(siteId: string) {
  return useGenericQuery<boolean>(`site-has-data/${siteId}`);
}

// Updated type for grouped sessions from the API
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

type GetOrganizationMembersResponse = {
  data: {
    id: string;
    role: string;
    userId: string;
    organizationId: string;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
};

export const useOrganizationMembers = (organizationId: string) => {
  return useQuery<GetOrganizationMembersResponse>({
    queryKey: ["organization-members", organizationId],
    queryFn: () =>
      authedFetch(
        `${BACKEND_URL}/list-organization-members/${organizationId}`
      ).then((res) => res.json()),
    staleTime: Infinity,
  });
};

// Subscription types
export type Subscription = {
  id: string;
  status: "active" | "trialing" | "canceled" | "incomplete" | "past_due";
  plan: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialStart?: Date;
  trialEnd: string | null | Date;
  createdAt?: Date;
  updatedAt?: Date;
  cancelAt: string | null;
  canceledAt?: Date | null;
  currentPeriodStart?: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  referenceId?: string;
  limits?: {
    events: number;
    [key: string]: any;
  };
  seats?: number;
  metadata?: Record<string, any>;
};

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      try {
        const { data, error } = await authClient.subscription.list();

        if (error) {
          throw new Error(error.message);
        }

        // Find the active subscription
        const activeSubscription =
          data?.find(
            (sub) => sub.status === "active" || sub.status === "trialing"
          ) || null;

        // Ensure the returned data has the correct shape for our frontend
        return activeSubscription as Subscription | null;
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
        throw error;
      }
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      returnUrl,
      referenceId,
    }: {
      returnUrl: string;
      referenceId?: string;
    }) => {
      const { error } = await authClient.subscription.cancel({
        returnUrl,
        // referenceId,
      });
      console.log(error);

      if (error) {
        throw new Error(error.message);
      }

      // This operation actually redirects to Stripe, not returning data
      return true;
    },
    onSuccess: () => {
      // No need to invalidate queries as we'll be redirected
    },
    onError: (error) => {
      console.error("Failed to cancel subscription:", error);
    },
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      plan,
      successUrl,
      cancelUrl,
      referenceId,
    }: {
      plan: string;
      successUrl: string;
      cancelUrl: string;
      referenceId?: string;
    }) => {
      await authClient.subscription.upgrade({
        plan,
        successUrl,
        cancelUrl,
        referenceId,
      });

      // This operation actually redirects to Stripe, not returning data
      return true;
    },
    onSuccess: () => {
      // No need to invalidate queries as we'll be redirected
    },
    onError: (error) => {
      console.error("Failed to upgrade subscription:", error);
    },
  });
}
