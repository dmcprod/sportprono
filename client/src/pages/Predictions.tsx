import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import PredictionsTable from "@/components/PredictionsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Users, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Predictions() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
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

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <Trophy className="inline mr-3 text-yellow-500" />
            Nos Pronostics
          </h1>
          <p className="text-xl text-muted-foreground">
            Découvrez nos analyses d'experts et pronostics sportifs
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Précision</h3>
              <p className="text-2xl font-bold text-green-500">
                {stats?.accuracy ? `${stats.accuracy}%` : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Pronostics</h3>
              <p className="text-2xl font-bold text-primary">
                {stats?.totalPredictions || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Utilisateurs</h3>
              <p className="text-2xl font-bold text-secondary">
                {stats?.activeUsers || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Ligues</h3>
              <p className="text-2xl font-bold text-orange-500">
                {stats?.leagues || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Free Predictions Section */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">
                <Trophy className="inline mr-2" />
                Pronostics Gratuits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PredictionsTable showPremium={false} />
            </CardContent>
          </Card>
        </div>

        {/* Premium Predictions Section - Only for subscribed users */}
        {user?.subscriptionTier && user.subscriptionTier !== "free" && (
          <div className="mb-12">
            <Card className="border-yellow-400">
              <CardHeader className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10">
                <CardTitle className="text-foreground">
                  <Trophy className="inline mr-2 text-yellow-500" />
                  Pronostics Premium
                  <span className="ml-2 text-xs bg-yellow-400 text-black px-2 py-1 rounded-full">
                    {user.subscriptionTier.toUpperCase()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PredictionsTable showPremium={true} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}