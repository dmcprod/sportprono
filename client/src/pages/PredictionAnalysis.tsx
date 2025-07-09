import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  MapPin, 
  TrendingUp,
  Star,
  Crown,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function PredictionAnalysis() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: prediction, isLoading, error } = useQuery({
    queryKey: ["/api/predictions", id],
    queryFn: async () => {
      const response = await fetch(`/api/predictions/${id}`);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Premium subscription required");
        }
        throw new Error("Failed to fetch prediction");
      }
      return response.json();
    },
    retry: false,
  });

  const handleError = (error: Error) => {
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
    
    if (error.message === "Premium subscription required") {
      toast({
        title: "Accès Premium Requis",
        description: "Cette analyse est réservée aux abonnés Premium",
        variant: "destructive",
      });
    }
  };

  if (error) {
    handleError(error as Error);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "lost":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "ongoing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "won":
        return "Gagné";
      case "lost":
        return "Perdu";
      case "ongoing":
        return "En cours";
      default:
        return "Programmé";
    }
  };

  const renderConfidenceStars = (confidence: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < confidence ? "text-yellow-500 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-light dark:bg-neutral-dark">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <XCircle className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-bold mb-2">Accès Refusé</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error.message === "Premium subscription required" 
                  ? "Cette analyse est réservée aux abonnés Premium"
                  : "Impossible de charger cette analyse"
                }
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour à l'accueil
                  </Button>
                </Link>
                {error.message === "Premium subscription required" && (
                  <Link href="/premium">
                    <Button>
                      <Crown className="h-4 w-4 mr-2" />
                      Passer Premium
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="min-h-screen bg-neutral-light dark:bg-neutral-dark">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold mb-2">Pronostic non trouvé</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Le pronostic demandé n'existe pas ou n'est plus disponible.
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light dark:bg-neutral-dark">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux pronostics
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-dark dark:text-white">
                Analyse du Match
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Analyse détaillée et pronostic professionnel
              </p>
            </div>
            {prediction.isPremium && (
              <Badge className="bg-yellow-500 text-black">
                <Crown className="h-4 w-4 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>

        {/* Match Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {prediction.team1} vs {prediction.team2}
              </span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(prediction.status)}
                <span className="text-sm">{getStatusLabel(prediction.status)}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date & Heure</p>
                  <p className="font-medium">
                    {new Date(prediction.matchDate).toLocaleString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Championnat</p>
                  <p className="font-medium">{prediction.championship}</p>
                </div>
              </div>
              
              {prediction.venue && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Lieu</p>
                    <p className="font-medium">{prediction.venue}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Cote</p>
                  <p className="font-medium">{prediction.odds}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prediction Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Prediction */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Notre Pronostic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Type de pari</p>
                      <p className="font-medium">{prediction.predictionType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Prédiction</p>
                      <Badge variant="secondary" className="text-lg">
                        {prediction.prediction}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Niveau de confiance</p>
                      <div className="flex items-center space-x-1">
                        {renderConfidenceStars(prediction.confidence || 0)}
                        <span className="text-sm text-gray-500 ml-2">
                          {prediction.confidence}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {prediction.analysis && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-3">Analyse Détaillée</h4>
                        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                          {prediction.analysis.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-3">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Result */}
            {prediction.actualResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Résultat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {prediction.actualResult}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      {getStatusIcon(prediction.status)}
                      <span className="font-medium">{getStatusLabel(prediction.status)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upgrade Banner for Free Users */}
            {!prediction.isPremium && user?.subscriptionTier === "free" && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6 text-center">
                  <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Analyses Premium</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Accédez à des analyses encore plus poussées et détaillées
                  </p>
                  <Link href="/premium">
                    <Button className="w-full">
                      Découvrir Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Conseils</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>Misez toujours de manière responsable</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>Ne pariez que ce que vous pouvez vous permettre de perdre</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <p>Suivez nos analyses pour optimiser vos chances</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
