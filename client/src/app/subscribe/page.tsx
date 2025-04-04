"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Check, Users } from "lucide-react";
import { authClient } from "@/lib/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STRIPE_PRICES } from "@/lib/stripe";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Available event tiers for the slider
const EVENT_TIERS = [20_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000];

// Define types for plans
interface PlanTemplate {
  id: "free" | "basic" | "pro" | "enterprise";
  name: string;
  price?: string;
  interval?: string;
  description: string;
  baseFeatures: string[];
  color: string;
}

interface Plan extends PlanTemplate {
  price: string;
  interval: string;
  features: string[];
  monthlyPrice?: number;
  annualPrice?: number;
  savings?: string;
}

interface StripePrice {
  priceId: string;
  price: number;
  name: string;
  interval: string;
  limits: {
    events: number;
  };
}

// Plan templates
const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    interval: "month",
    description: "Get started with basic analytics",
    baseFeatures: [
      "Basic analytics",
      "7-day data retention",
      "Community support",
    ],
    color:
      "bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900",
  },
  {
    id: "basic",
    name: "Basic",
    description: "Essential analytics for small projects",
    baseFeatures: [
      "Core analytics features",
      "14-day data retention",
      "Basic support",
    ],
    color:
      "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-800 dark:to-emerald-800",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced analytics for growing businesses",
    baseFeatures: [
      "Advanced dashboard features",
      "30-day data retention",
      "Priority support",
      "Custom event definitions",
      "Team collaboration",
    ],
    color:
      "bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-800 dark:to-teal-800",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    baseFeatures: [
      "Unlimited events",
      "90-day data retention",
      "Dedicated support",
      "Custom integrations",
      "Advanced security features",
      "SLA guarantees",
    ],
    color:
      "bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900",
  },
];

// Format price with dollar sign
function getFormattedPrice(price: number): string {
  return `$${price}`;
}

// Find the appropriate price for a tier at current event limit
function findPriceForTier(
  tier: "basic" | "pro" | "enterprise",
  eventLimit: number,
  interval: "month" | "year"
): StripePrice | null {
  console.log(
    `Finding price for tier: ${tier}, event limit: ${eventLimit}, interval: ${interval}`
  );

  // Determine if we need to look for annual plans
  const isAnnual = interval === "year";
  const namePattern = isAnnual ? `${tier}-annual` : tier;

  // Filter plans by name pattern (with or without -annual suffix) and interval
  const plans = STRIPE_PRICES.filter(
    (plan) =>
      (isAnnual
        ? plan.name.startsWith(tier) && plan.name.includes("-annual")
        : plan.name.startsWith(tier) && !plan.name.includes("-annual")) &&
      plan.interval === interval
  );

  console.log(
    `Filtered plans for ${namePattern} with interval ${interval}:`,
    plans.map((p) => ({
      name: p.name,
      interval: p.interval,
      events: p.limits.events,
      price: p.price,
    }))
  );

  if (plans.length === 0) {
    console.warn(`No plans found for ${namePattern} with interval ${interval}`);
    return null;
  }

  // Find a plan that matches or exceeds the event limit
  const matchingPlan = plans.find((plan) => plan.limits.events >= eventLimit);
  const selectedPlan = matchingPlan || plans[plans.length - 1] || null;

  if (selectedPlan) {
    console.log(
      `Selected plan: ${selectedPlan.name} (${selectedPlan.interval}) - $${selectedPlan.price} - ${selectedPlan.limits.events} events`
    );
  } else {
    console.log(
      `No plan selected for ${namePattern} with interval ${interval}`
    );
  }

  // Return the matching plan or the highest tier available
  return selectedPlan;
}

// Calculate savings percentage between monthly and annual plans
function calculateSavings(monthlyPrice: number, annualPrice: number): string {
  const monthlyCost = monthlyPrice * 12;
  const savings = monthlyCost - annualPrice;
  const savingsPercent = Math.round((savings / monthlyCost) * 100);
  return `Save ${savingsPercent}%`;
}

// Function to get the direct plan ID based on criteria
function getDirectPlanID(
  tier: "basic" | "pro",
  eventLimit: number,
  isAnnual: boolean
): string {
  // Base pattern for plan names is like "basic100k" or "pro250k"
  let planPrefix = tier;
  let eventSuffix = "";

  // Determine event tier suffix
  if (eventLimit <= 100_000) {
    eventSuffix = "100k";
  } else if (eventLimit <= 250_000) {
    eventSuffix = "250k";
  } else if (eventLimit <= 500_000) {
    eventSuffix = "500k";
  } else if (eventLimit <= 1_000_000) {
    eventSuffix = "1m";
  } else {
    eventSuffix = "2m";
  }

  // Construct the plan name with annual suffix if needed
  const planName = `${planPrefix}${eventSuffix}${isAnnual ? "-annual" : ""}`;
  console.log(`Constructed plan name: ${planName} for isAnnual=${isAnnual}`);

  return planName;
}

export default function Subscribe() {
  const [selectedTier, setSelectedTier] = useState<
    "free" | "basic" | "pro" | "enterprise"
  >("free");
  const [eventLimitIndex, setEventLimitIndex] = useState<number>(0); // Default to 20k (index 0)
  const [selectedPrice, setSelectedPrice] = useState<StripePrice | null>(null);
  const [isAnnual, setIsAnnual] = useState<boolean>(false);

  // Get the actual event limit value from the index
  const eventLimit = EVENT_TIERS[eventLimitIndex];

  // Check if free plan is available based on event limit
  const isFreeAvailable = eventLimit <= 20_000;

  // Group plans by type and interval
  const basicMonthlyPlans = STRIPE_PRICES.filter(
    (plan) => plan.name.startsWith("basic") && !plan.name.includes("-annual")
  );
  const basicAnnualPlans = STRIPE_PRICES.filter(
    (plan) => plan.name.includes("basic") && plan.name.includes("-annual")
  );
  const proMonthlyPlans = STRIPE_PRICES.filter(
    (plan) => plan.name.startsWith("pro") && !plan.name.includes("-annual")
  );
  const proAnnualPlans = STRIPE_PRICES.filter(
    (plan) => plan.name.includes("pro") && plan.name.includes("-annual")
  );

  // Update the selected price when tier or event limit changes
  useEffect(() => {
    if (selectedTier === "free" || selectedTier === "enterprise") {
      setSelectedPrice(null);
      return;
    }

    const interval = isAnnual ? "year" : "month";

    // Get the correct set of plans based on the tier and interval
    let filteredPlans;
    if (selectedTier === "basic") {
      filteredPlans = isAnnual ? basicAnnualPlans : basicMonthlyPlans;
    } else {
      filteredPlans = isAnnual ? proAnnualPlans : proMonthlyPlans;
    }

    const matchingPlan =
      filteredPlans.find((plan) => plan.limits.events >= eventLimit) ||
      filteredPlans[filteredPlans.length - 1];

    setSelectedPrice(matchingPlan);
  }, [selectedTier, eventLimit, isAnnual]);

  // Handle subscription
  function handleSubscribe(
    planId: "free" | "basic" | "pro" | "enterprise"
  ): void {
    setSelectedTier(planId);

    if (planId === "free" || planId === "enterprise") return;

    // Use the direct plan mapping approach with the new naming scheme
    const planName = getDirectPlanID(
      planId as "basic" | "pro",
      eventLimit,
      isAnnual
    );

    console.log(
      `Direct plan mapping selected: ${planName}, interval=${
        isAnnual ? "year" : "month"
      }`
    );

    // Find the specific plan object in STRIPE_PRICES
    const interval = isAnnual ? "year" : "month";

    // The filter should match the new naming convention for annual plans
    const matchingPlans = STRIPE_PRICES.filter((p) => {
      const nameMatches = p.name === planName;
      const intervalMatches = p.interval === interval;
      return nameMatches && intervalMatches;
    });

    console.log(
      `Found ${matchingPlans.length} matching plans for ${planName} (${interval})`
    );

    if (matchingPlans.length === 0) {
      console.error(
        `No matching plan found for name=${planName}, interval=${interval}`
      );
      return;
    }

    const selectedPlan = matchingPlans[0];
    console.log(`Selected plan: `, selectedPlan);

    // Log the selected plan to verify
    console.log(
      `Subscribing to ${selectedPlan.name} (${selectedPlan.interval}) - $${selectedPlan.price} - ${selectedPlan.limits.events} events`
    );

    authClient.subscription
      .upgrade({
        plan: selectedPlan.name,
        successUrl: globalThis.location.origin + "/auth/subscription/success",
        cancelUrl: globalThis.location.origin + "/subscribe",
      })
      .catch((error) => {
        console.error("Subscription error:", error);
      });
  }

  // Handle contact for enterprise
  function handleContactEnterprise(): void {
    globalThis.location.href = "/contact";
  }

  // Handle slider changes
  function handleSliderChange(value: number[]): void {
    setEventLimitIndex(value[0]);

    // If event limit is over 20k, ensure free plan is not selected
    if (EVENT_TIERS[value[0]] > 20_000 && selectedTier === "free") {
      setSelectedTier("basic");
    }
  }

  // Find the current prices for each tier based on the event limit
  const interval = isAnnual ? "year" : "month";
  const basicTierPrice = findPriceForTier("basic", eventLimit, interval);
  const proTierPrice = findPriceForTier("pro", eventLimit, interval);

  // Also get monthly prices for savings calculation
  const basicMonthly = findPriceForTier("basic", eventLimit, "month");
  const proMonthly = findPriceForTier("pro", eventLimit, "month");
  const basicAnnual = findPriceForTier("basic", eventLimit, "year");
  const proAnnual = findPriceForTier("pro", eventLimit, "year");

  // Generate plan objects with current state
  const plans: Plan[] = PLAN_TEMPLATES.map((template) => {
    const plan = { ...template } as Plan;

    if (plan.id === "basic") {
      const tierPrice = basicTierPrice;
      plan.price = tierPrice ? getFormattedPrice(tierPrice.price) : "$19+";
      plan.interval = isAnnual ? "year" : "month";

      if (basicMonthly && basicAnnual) {
        plan.monthlyPrice = basicMonthly.price;
        plan.annualPrice = basicAnnual.price;
        plan.savings = calculateSavings(basicMonthly.price, basicAnnual.price);
      }
    } else if (plan.id === "pro") {
      const tierPrice = proTierPrice;
      plan.price = tierPrice ? getFormattedPrice(tierPrice.price) : "$39+";
      plan.interval = isAnnual ? "year" : "month";

      if (proMonthly && proAnnual) {
        plan.monthlyPrice = proMonthly.price;
        plan.annualPrice = proAnnual.price;
        plan.savings = calculateSavings(proMonthly.price, proAnnual.price);
      }
    } else if (plan.id === "enterprise") {
      plan.price = "Custom";
      plan.interval = "";
    } else {
      plan.price = "$0";
      plan.interval = "month";
    }

    // Add event limit feature at the beginning
    const eventFeature =
      plan.id === "free"
        ? "20,000 events per month"
        : plan.id === "enterprise"
        ? "Unlimited events"
        : `${Math.max(eventLimit, 100_000).toLocaleString()} events per month`;

    plan.features = [eventFeature, ...plan.baseFeatures];

    return plan;
  });

  return (
    <div className="container mx-auto py-12">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4 ">
          Choose Your Analytics Plan
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
          Find the perfect plan to track your site's performance
        </p>

        {/* Billing toggle buttons */}
        <div className="flex justify-center mb-8 mt-10">
          <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-full inline-flex relative">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                !isAnnual
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
              )}
            >
              Monthly
            </button>
            <div className="relative">
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all",
                  isAnnual
                    ? "bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                )}
              >
                Annual
              </button>
              <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white border-0 pointer-events-none">
                2 months free
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12 max-w-3xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800">
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-4">
            How many events do you need?
          </h2>
          <div className="flex justify-between mb-4">
            <span className="text-neutral-600 dark:text-neutral-400">
              Events per month
            </span>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-400">
              {eventLimit.toLocaleString()}
            </span>
          </div>
        </div>

        <Slider
          defaultValue={[0]} // Default to index 0 (20k)
          max={EVENT_TIERS.length - 1}
          min={0}
          step={1}
          onValueChange={handleSliderChange}
          className="mb-6"
        />

        <div className="flex justify-between text-xs text-neutral-500">
          {EVENT_TIERS.map((tier, index) => (
            <span
              key={index}
              className={
                eventLimitIndex === index ? "font-bold text-emerald-400" : ""
              }
            >
              {tier.toLocaleString()}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-4 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.id} className="transition-all duration-300 h-full">
            <Card
              className={`flex flex-col h-full transition-transform duration-300 transform hover:scale-[1.01] hover:shadow-md cursor-pointer overflow-hidden ${
                plan.id === "free" && !isFreeAvailable
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <div className={`${plan.color} h-3 w-full`}></div>

              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="space-y-3">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.interval && (
                      <span className="ml-1 text-neutral-500">
                        /{plan.interval}
                      </span>
                    )}
                  </div>
                  {isAnnual &&
                    plan.id !== "free" &&
                    plan.id !== "enterprise" && (
                      <Badge className="bg-emerald-500 text-white border-0">
                        2 months free
                      </Badge>
                    )}
                  <p>{plan.description}</p>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 flex-grow">
                <div className="w-full h-px bg-neutral-200 dark:bg-neutral-800 mb-4"></div>
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={feature} className="flex items-start">
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          i === 0 ? "text-emerald-400" : "text-green-400"
                        } shrink-0`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {plan.id === "basic" || plan.id === "pro" ? (
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full ${
                      plan.id === "pro"
                        ? "bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500"
                        : ""
                    }`}
                    variant={plan.id === "pro" ? "default" : "outline"}
                  >
                    Subscribe to {plan.name}
                  </Button>
                ) : plan.id === "enterprise" ? (
                  <Button
                    onClick={handleContactEnterprise}
                    className="w-full bg-gradient-to-r from-slate-500 to-blue-400 hover:from-slate-600 hover:to-blue-500"
                  >
                    Contact Sales
                  </Button>
                ) : (
                  <Button
                    className="w-full border-neutral-300 text-gray-700 dark:border-neutral-700 dark:text-neutral-300"
                    variant="outline"
                    disabled={!isFreeAvailable}
                  >
                    {isFreeAvailable ? "Current Plan" : "Not Available"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center text-sm max-w-2xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-center mb-4">
          <Users className="h-5 w-5 text-emerald-400 mr-2" />
          <span className="font-medium">Important Information</span>
        </div>
        <p className="mb-3 text-neutral-600 dark:text-neutral-400">
          All paid plans include a 14-day free trial. No credit card required
          until your trial ends.
        </p>
        <p className="text-neutral-600 dark:text-neutral-400">
          Have questions about our plans?{" "}
          <a
            href="/contact"
            className="text-emerald-400 hover:underline font-medium"
          >
            Contact our sales team
          </a>
        </p>
      </div>
    </div>
  );
}
