import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import PredictionsTable from "@/components/PredictionsTable";
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  Target,
  Crown,
  Gift,
  Newspaper,
  ChevronRight 
} from "lucide-react";

export default function Landing() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: blogPosts } = useQuery({
    queryKey: ["/api/blog"],
    queryFn: async () => {
      const response = await fetch("/api/blog?limit=3");
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-neutral-light dark:bg-neutral-dark">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/20">
          <img 
            src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
            alt="Stadium background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Pronostics Sportifs <span className="text-yellow-400">Professionnels</span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Analysez, prédisez et gagnez avec nos experts sportifs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-secondary hover:bg-green-600 text-white">
                <TrendingUp className="mr-2 h-5 w-5" />
                Voir les Pronostics Gratuits
              </Button>
              <Button size="lg" variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <Crown className="mr-2 h-5 w-5" />
                Accès Premium
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-neutral-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">
                {stats?.accuracy || 0}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">Précision des pronostics</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats?.totalPredictions || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Pronostics analysés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {stats?.activeUsers || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Utilisateurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">
                {stats?.leagues || 0}+
              </div>
              <div className="text-gray-600 dark:text-gray-400">Championnats couverts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Predictions Section */}
      <section id="predictions" className="py-16 bg-neutral-light dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-neutral-dark dark:text-white mb-4">
              <Gift className="inline mr-3 text-secondary" />
              Pronostics Gratuits
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Découvrez nos analyses gratuites des matchs du jour
            </p>
          </div>

          <PredictionsTable showPremium={false} />
        </div>
      </section>

      {/* Premium Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-neutral-dark dark:text-white mb-4">
              <Crown className="inline mr-3 text-yellow-500" />
              Accès Premium
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Débloquez tout le potentiel de nos analyses professionnelles
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card>
              <CardContent className="p-6 text-center">
                <h4 className="text-xl font-bold mb-2">Gratuit</h4>
                <div className="text-3xl font-bold mb-4">
                  0€<span className="text-sm text-gray-500">/mois</span>
                </div>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <Target className="h-4 w-4 text-secondary mr-2" />
                    3 pronostics gratuits par jour
                  </li>
                  <li className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-secondary mr-2" />
                    Statistiques de base
                  </li>
                  <li className="flex items-center">
                    <Newspaper className="h-4 w-4 text-secondary mr-2" />
                    Accès au blog
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Plan Actuel
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-yellow-400 relative transform scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-400 text-black">Populaire</Badge>
              </div>
              <CardContent className="p-6 text-center">
                <h4 className="text-xl font-bold mb-2">Pro</h4>
                <div className="text-3xl font-bold mb-4">
                  19€<span className="text-sm text-gray-500">/mois</span>
                </div>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <Target className="h-4 w-4 text-secondary mr-2" />
                    Pronostics illimités
                  </li>
                  <li className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-secondary mr-2" />
                    Analyses détaillées
                  </li>
                  <li className="flex items-center">
                    <Users className="h-4 w-4 text-secondary mr-2" />
                    Support prioritaire
                  </li>
                </ul>
                <Button 
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Passer au Pro
                </Button>
              </CardContent>
            </Card>

            {/* Expert Plan */}
            <Card>
              <CardContent className="p-6 text-center">
                <h4 className="text-xl font-bold mb-2">Expert</h4>
                <div className="text-3xl font-bold mb-4">
                  49€<span className="text-sm text-gray-500">/mois</span>
                </div>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <Crown className="h-4 w-4 text-secondary mr-2" />
                    Tout du plan Pro
                  </li>
                  <li className="flex items-center">
                    <Users className="h-4 w-4 text-secondary mr-2" />
                    Consultation personnalisée
                  </li>
                  <li className="flex items-center">
                    <Trophy className="h-4 w-4 text-secondary mr-2" />
                    Garantie remboursement
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Devenir Expert
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-white dark:bg-neutral-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-neutral-dark dark:text-white mb-4">
              <Newspaper className="inline mr-3 text-primary" />
              Blog & Actualités
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Suivez nos analyses et conseils d'experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts?.map((post: any) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-sm text-gray-500">{post.readingTime} min de lecture</span>
                  </div>
                  <h4 className="text-xl font-bold mb-3">{post.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{post.author}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button>
              <ChevronRight className="mr-2 h-4 w-4" />
              Voir tous les articles
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">SportsPro</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Votre plateforme de référence pour les pronostics sportifs professionnels.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Pronostics</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Football</li>
                <li>Basketball</li>
                <li>Tennis</li>
                <li>Rugby</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Blog</li>
                <li>Guides</li>
                <li>Statistiques</li>
                <li>FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Contact</li>
                <li>Conditions</li>
                <li>Confidentialité</li>
                <li>Mentions légales</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SportsPro. Tous droits réservés. Jouez responsable.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
