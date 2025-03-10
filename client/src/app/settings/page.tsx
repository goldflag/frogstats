"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "../../lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  GearSix,
  User,
  Users as Users_,
  CreditCard,
} from "@phosphor-icons/react";

import { Input } from "../../components/ui/input";
import { Account } from "./account/Account";
import { Organizations } from "./organizations/Organizations";
import { Settings } from "./settings/settings";
import SubscriptionPage from "./subscription/page";

export default function SettingsPage() {
  const session = authClient.useSession();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<
    "account" | "settings" | "organizations" | "subscription"
  >("account");

  return (
    <div className="max-w-6xl">
      <div className="grid grid-cols-[200px_1fr] gap-6">
        <div className="flex flex-col gap-2">
          <Button
            variant={selectedTab === "account" ? "default" : "ghost"}
            onClick={() => setSelectedTab("account")}
            className="justify-start"
          >
            <User size={16} weight="bold" />
            Account
          </Button>
          <Button
            variant={selectedTab === "settings" ? "default" : "ghost"}
            onClick={() => setSelectedTab("settings")}
            className="justify-start"
          >
            <GearSix size={16} weight="bold" />
            Settings
          </Button>
          <Button
            variant={selectedTab === "organizations" ? "default" : "ghost"}
            onClick={() => setSelectedTab("organizations")}
            className="justify-start"
          >
            <Users_ size={16} weight="bold" />
            Organizations
          </Button>
          <Button
            variant={selectedTab === "subscription" ? "default" : "ghost"}
            onClick={() => setSelectedTab("subscription")}
            className="justify-start"
          >
            <CreditCard size={16} weight="bold" />
            Subscription
          </Button>
        </div>
        {selectedTab === "account" && session.data?.user && (
          <Account session={session} />
        )}
        {selectedTab === "organizations" && <Organizations />}
        {selectedTab === "settings" && <Settings />}
        {selectedTab === "subscription" && <SubscriptionPage />}
      </div>
    </div>
  );
}
