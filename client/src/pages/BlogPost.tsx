import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function BlogPost() {
  const { slug } = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["/api/blog", slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Article not found");
        }
        throw new Error("Failed to fetch blog post");
      }
      return response.json();
    },
    enabled: !!slug && isAuthenticated,
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Analyse": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Stratégie": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Actualité": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "Guide": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Conseil": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (authLoading) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-accent rounded mb-4"></div>
            <div className="h-64 bg-accent rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-accent rounded w-3/4"></div>
              <div className="h-4 bg-accent rounded w-1/2"></div>
              <div className="h-4 bg-accent rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au blog
            </Button>
          </Link>
          
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">Article non trouvé</h2>
              <p className="text-muted-foreground mb-4">
                L'article que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Link href="/blog">
                <Button>Retour au blog</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au blog
          </Button>
        </Link>

        {/* Article Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {/* Featured Image Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-8 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {post.category === "Analyse" && "📊"}
                  {post.category === "Stratégie" && "🎯"}
                  {post.category === "Actualité" && "📰"}
                  {post.category === "Guide" && "📚"}
                  {post.category === "Conseil" && "💡"}
                </div>
                <p className="text-lg text-muted-foreground">{post.category}</p>
              </div>
            </div>

            {/* Article Metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className={getCategoryColor(post.category)}>
                {post.category}
              </Badge>
              
              {post.readingTime && (
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{post.readingTime} min de lecture</span>
                </div>
              )}
              
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-1" />
                <span className="text-sm">{post.author}</span>
              </div>
            </div>

            {/* Article Title */}
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {post.title}
            </h1>

            {/* Article Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Share Button */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
              
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <span className="text-sm text-muted-foreground">
                  Mis à jour le {new Date(post.updatedAt).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {post.content ? (
                <div 
                  className="text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Le contenu de cet article sera bientôt disponible.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Related Articles or Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Vous avez aimé cet article ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Découvrez nos pronostics experts et maximisez vos gains
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/predictions">
                <Button size="lg">
                  Voir les pronostics
                </Button>
              </Link>
              <Link href="/premium">
                <Button variant="outline" size="lg">
                  Devenir premium
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}