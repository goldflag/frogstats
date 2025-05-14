import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../../../../lib/const";

interface SubscriptionData {
  id: string;
  planName: string;
  status: "expired" | "active" | "trialing" | "free";
  currentPeriodEnd: string;
  monthlyEventCount: number;
  eventLimit: number;
  interval: string;
  cancelAtPeriodEnd: boolean;
  isTrial?: boolean;
  trialDaysRemaining?: number;
  message?: string; // For expired trial message
}

export function useStripeSubscription() {
  const fetchSubscription = async () => {
    const response = await fetch(`${BACKEND_URL}/stripe/subscription`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
    }

    const data = await response.json();

    // If status is expired, the trial has ended and no subscription exists
    if (data.status === "expired") {
      return {
        status: "expired",
        message: data.message,
      };
    }

    return data;
  };

  const { data, isLoading, error, refetch } = useQuery<SubscriptionData>({
    queryKey: ["stripe-subscription"],
    queryFn: fetchSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  return { data, isLoading, error, refetch };
}
