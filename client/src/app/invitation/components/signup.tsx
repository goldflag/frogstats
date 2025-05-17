"use client";

import { GithubLogo, GoogleLogo } from "@phosphor-icons/react/dist/ssr";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { authClient } from "../../../lib/auth";
import { IS_CLOUD } from "../../../lib/const";
import { userStore } from "../../../lib/userStore";

interface SignupProps {
  inviterEmail?: string | null;
  organization?: string | null;
}

export function Signup({ inviterEmail, organization }: SignupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        name,
        password,
      });

      if (data?.user) {
        userStore.setState({
          user: data.user,
        });
        // Force reload to show the AcceptInvitationInner component
        window.location.reload();
      }

      if (error) {
        setError(error.message || "An error occurred during signup");
      }
    } catch (error) {
      setError(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (
    provider: "google" | "github" | "twitter"
  ) => {
    try {
      await authClient.signIn.social({
        provider,
      });
    } catch (error) {
      setError(String(error));
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          variant="success"
        >
          {isLoading ? "Creating account..." : "Sign Up to Accept Invitation"}
        </Button>

        {IS_CLOUD && (
          <>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn("google")}
              >
                <GoogleLogo weight="bold" className="mr-2" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialSignIn("github")}
              >
                <GithubLogo weight="bold" className="mr-2" />
                GitHub
              </Button>
            </div>
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </form>
  );
}
