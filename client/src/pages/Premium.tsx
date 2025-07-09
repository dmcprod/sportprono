import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { apiRequest } from "@/lib/queryClient";
import { 
  Crown, 
  Check, 
  X, 
  TrendingUp, 
  Users, 
  Shield, 
  Zap,
  Star,
  Trophy
} from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Premium() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const upgradeMutation = useMutation({
    mutationFn: async (tier: string) => {
      await apiRequest("POST", "/api/subscription/upgrade", { tier });
    },
    onSuccess: () => {
      toast({
        title: "Abonnement mis à jour",
        description: "Votre abonnement a été mis à jour avec succès!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
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
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour de votre abonnement.",
        variant: "destructive",
      });
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

  const currentTier = user?.subscriptionTier || "free";
  const isSubscriptionActive = user?.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();

  const plans = [
    {
      id: "free",
      name: "Gratuit",
      price: 0,
      description: "Parfait pour commencer",
      features: [
        "3 pronostics gratuits par jour",
        "Statistiques de base",
        "Accès au blog",
        "Support communautaire"
      ],
      limitations: [
        "Analyses détaillées",
        "Pronostics premium",
        "Support prioritaire",
        "Alertes en temps réel"
      ],
      popular: false,
      current: currentTier === "free"
    },
    {
      id: "pro",
      name: "Pro",
      price: 19,
      description: "Pour les parieurs sérieux",
      features: [
        "Pronostics illimités",
        "Analyses détaillées",
        "Statistiques avancées",
        "Alertes en temps réel",
        "Support prioritaire",
        "Historique complet"
      ],
      limitations: [
        "Consultation personnalisée",
        "Accès aux experts",
        "Rapport hebdomadaire"
      ],
      popular: true,
      current: currentTier === "pro"
    },
    {
      id: "expert",
      name: "Expert",
      price: 49,
      description: "L'expérience ultime",
      features: [
        "Tout du plan Pro",
        "Consultation personnalisée",
        "Accès direct aux experts",
        "Rapport hebdomadaire personnalisé",
        "Analyses exclusives",
        "Garantie remboursement",
        "Support 24/7"
      ],
      limitations: [],
      popular: false,
      current: currentTier === "expert"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <Crown className="inline mr-3 text-yellow-500" />
            Plans Premium
          </h1>
          <p className="text-xl text-muted-foreground">
            Choisissez le plan qui correspond à vos besoins
          </p>
          {isSubscriptionActive && (
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Check className="h-4 w-4 mr-1" />
                Abonnement actif jusqu'au {new Date(user.subscriptionExpiry!).toLocaleDateString('fr-FR')}
              </Badge>
            </div>
          )}
        </div>

        {/* Features Comparison */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
            Pourquoi passer Premium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-foreground">Analyses Avancées</h3>
                <p className="text-sm text-muted-foreground">
                  Accédez à des analyses poussées avec statistiques détaillées
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-foreground">Alertes en Temps Réel</h3>
                <p className="text-sm text-muted-foreground">
                  Recevez des notifications instantanées pour les meilleures opportunités
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-foreground">Support Prioritaire</h3>
                <p className="text-sm text-muted-foreground">
                  Bénéficiez d'un support client prioritaire et personnalisé
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold mb-2 text-foreground">Garantie Résultats</h3>
                <p className="text-sm text-muted-foreground">
                  Garantie de remboursement si vous n'êtes pas satisfait
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.popular ? 'border-2 border-yellow-400 transform scale-105' : ''
              } ${plan.current ? 'bg-primary/5' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-400 text-black">
                    <Star className="h-3 w-3 mr-1" />
                    Populaire
                  </Badge>
                </div>
              )}
              
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white">
                    <Check className="h-3 w-3 mr-1" />
                    Actuel
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold text-foreground">{plan.name}</CardTitle>
                <div className="text-3xl font-bold mb-2 text-foreground">
                  {plan.price}€
                  <span className="text-sm font-normal text-muted-foreground">/mois</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3 text-green-600">Inclus:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-foreground">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 text-gray-500">Non inclus:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-500">
                            <X className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {plan.current ? (
                    <Button disabled className="w-full">
                      Plan Actuel
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button variant="outline" disabled className="w-full">
                      Plan Gratuit
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                          : ''
                      }`}
                      onClick={() => upgradeMutation.mutate(plan.id)}
                      disabled={upgradeMutation.isPending}
                    >
                      {upgradeMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          {plan.id === "pro" && <Crown className="h-4 w-4 mr-2" />}
                          {plan.id === "expert" && <Trophy className="h-4 w-4 mr-2" />}
                          {currentTier === "free" ? "Commencer" : "Passer à ce plan"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Questions Fréquentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Puis-je annuler mon abonnement à tout moment?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Oui, vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès jusqu'à la fin de votre période de facturation.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Y a-t-il une garantie de remboursement?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Oui, le plan Expert inclut une garantie de remboursement de 30 jours si vous n'êtes pas satisfait.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Puis-je changer de plan?</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Oui, vous pouvez passer à un plan supérieur à tout moment. Le changement prend effet immédiatement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
