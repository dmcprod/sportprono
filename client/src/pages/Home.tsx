import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import PredictionsTable from "@/components/PredictionsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp, Users, Trophy } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-light dark:bg-neutral-dark">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const isPremium = user?.subscriptionTier !== "free";

  return (
    <div className="min-h-screen bg-neutral-light dark:bg-neutral-dark">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">
                Bienvenue, {user?.firstName || user?.email}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Accédez à tous vos pronostics et analyses
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isPremium ? "default" : "secondary"}>
                {isPremium ? (
                  <>
                    <Crown className="h-4 w-4 mr-1" />
                    {user?.subscriptionTier?.charAt(0).toUpperCase() + user?.subscriptionTier?.slice(1)}
                  </>
                ) : (
                  "Gratuit"
                )}
              </Badge>
              {!isPremium && (
                <Button size="sm" onClick={() => window.location.href = "/premium"}>
                  Passer Premium
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pronostics consultés</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">ce mois-ci</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">moyenne personnelle</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abonnement</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isPremium ? "Premium" : "Gratuit"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isPremium && user?.subscriptionExpiry
                  ? `Expire le ${new Date(user.subscriptionExpiry).toLocaleDateString('fr-FR')}`
                  : "Accès limité"
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Predictions Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-dark dark:text-white">
              {isPremium ? "Vos Pronostics Premium" : "Pronostics Gratuits"}
            </h2>
            {!isPremium && (
              <Button onClick={() => window.location.href = "/premium"}>
                <Crown className="h-4 w-4 mr-2" />
                Découvrir Premium
              </Button>
            )}
          </div>
          
          <PredictionsTable showPremium={isPremium} />
        </div>

        {/* Upgrade Banner for Free Users */}
        {!isPremium && (
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-neutral-dark dark:text-white mb-2">
                    Débloquez tout le potentiel de SportsPro
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Accédez à tous nos pronostics, analyses détaillées et support prioritaire
                  </p>
                </div>
                <Button onClick={() => window.location.href = "/premium"}>
                  <Crown className="h-4 w-4 mr-2" />
                  Passer Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
