import { AlertTriangle, ArrowRight, PackageOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";
import { DEFAULT_EVENT_LIMIT } from "../utils/constants";
import { useStripeSubscription } from "../utils/useStripeSubscription";

export function FreePlan() {
  const { data: subscription } = useStripeSubscription();
  const router = useRouter();

  if (!subscription) return null;

  const currentUsage = subscription?.monthlyEventCount || 0;
  const limit = subscription?.eventLimit || DEFAULT_EVENT_LIMIT;

  // Calculate percentage of limit used
  const percentageUsed = Math.min((currentUsage / limit) * 100, 100);
  const isNearLimit = percentageUsed > 80;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Free Plan <PackageOpen className="ml-2 h-5 w-5 text-gray-500" />
          </CardTitle>
          <CardDescription>
            You are on the Free plan with up to 10,000 events per month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 p-2">
            {isNearLimit && (
              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <AlertTitle>Approaching Limit</AlertTitle>
                <AlertDescription>
                  You are approaching your monthly event limit. Consider
                  upgrading to a paid plan for higher limits.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h3 className="font-medium mb-2">Usage</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Events</span>
                    <span className="text-sm">
                      {currentUsage.toLocaleString()} / {limit.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={percentageUsed}
                    className={
                      isNearLimit ? "bg-amber-100 dark:bg-amber-900" : ""
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/subscribe")} variant={"success"}>
            Upgrade To Pro <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
