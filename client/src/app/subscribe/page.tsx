"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
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

export default function Subscribe() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: "basic" | "pro") => {
    try {
      setIsLoading(plan);

      // Use the Better Auth client according to the provided sample code
      await authClient.subscription.upgrade({
        plan,
        successUrl: "/",
        cancelUrl: "/subscribe",
      });

      // The redirect will be handled by Stripe
    } catch (error) {
      console.error("Subscription error:", error);
      setIsLoading(null);
    }
  };

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "$20",
      interval: "month",
      description: "Essential analytics for small projects",
      features: [
        "100,000 events per month",
        "Core analytics features",
        "7-day data retention",
        "Basic support",
      ],
      highlighted: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$50",
      interval: "month",
      description: "Advanced analytics for growing businesses",
      features: [
        "1,000,000 events per month",
        "Advanced dashboard features",
        "30-day data retention",
        "Priority support",
        "Custom event definitions",
        "Team collaboration",
      ],
      highlighted: true,
    },
  ];

  return (
    <div className="container mx-auto py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
          Select the plan that best fits your analytics needs
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col ${
              plan.highlighted
                ? "border-fuchsia-500 dark:border-fuchsia-400 shadow-lg"
                : ""
            }`}
          >
            {plan.highlighted && (
              <div className="bg-fuchsia-500 text-white text-center py-1 text-sm font-medium">
                RECOMMENDED
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-neutral-500">
                    /{plan.interval}
                  </span>
                </div>
                <p className="mt-2">{plan.description}</p>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSubscribe(plan.id as "basic" | "pro")}
                disabled={isLoading !== null}
                className="w-full"
                variant={plan.highlighted ? "accent" : "default"}
              >
                {isLoading === plan.id
                  ? "Processing..."
                  : `Subscribe to ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center text-sm text-neutral-500">
        <p>
          All plans include a 14-day free trial. No credit card required until
          your trial ends.
        </p>
        <p className="mt-2">
          Have questions about our plans?{" "}
          <a href="/contact" className="text-fuchsia-500 hover:underline">
            Contact our sales team
          </a>
        </p>
      </div>
    </div>
  );
}
