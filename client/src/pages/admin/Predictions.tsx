import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertPredictionSchema } from "@shared/schema";
import { 
  Trophy, 
  Search, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Plus,
  Crown,
  Star
} from "lucide-react";
import { Link } from "wouter";

export default function AdminPredictions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertPredictionSchema),
    defaultValues: {
      team1: "",
      team2: "",
      venue: "",
      championship: "",
      predictionType: "1N2",
      prediction: "",
      odds: "",
      confidence: 3,
      analysis: "",
      status: "scheduled",
      isPremium: false,
      matchDate: "",
    },
  });

  const { data: predictions, isLoading, error } = useQuery({
    queryKey: ["/api/predictions", { all: true }],
    queryFn: async () => {
      const response = await fetch("/api/predictions");
      if (!response.ok) throw new Error("Failed to fetch predictions");
      return response.json();
    },
    enabled: user?.role === "admin",
  });

  const createPredictionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/predictions", {
        ...data,
        matchDate: new Date(data.matchDate).toISOString(),
        odds: parseFloat(data.odds),
        confidence: parseInt(data.confidence),
      });
    },
    onSuccess: () => {
      toast({
        title: "Pronostic créé",
        description: "Le pronostic a été créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions"] });
      setIsCreateDialogOpen(false);
      form.reset();
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
        description: "Impossible de créer le pronostic",
        variant: "destructive",
      });
    },
  });

  const deletePredictionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/predictions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Pronostic supprimé",
        description: "Le pronostic a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions"] });
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
        description: "Impossible de supprimer le pronostic",
        variant: "destructive",
      });
    },
  });

  const handleCreatePrediction = (data: any) => {
    createPredictionMutation.mutate(data);
  };

  const handleDeletePrediction = (predictionId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce pronostic ?")) {
      deletePredictionMutation.mutate(predictionId);
    }
  };

  const filteredPredictions = predictions?.filter((p: any) => {
    const matchesSearch = 
      p.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.team2.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.championship.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return "🟢";
      case "lost":
        return "🔴";
      case "ongoing":
        return "🟡";
      default:
        return "⚪";
    }
  };

  const renderConfidenceStars = (confidence: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < confidence ? "text-yellow-500 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2 text-foreground">Accès Refusé</h2>
              <p className="text-muted-foreground">
                Vous n'avez pas les permissions d'administrateur
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                <Trophy className="inline mr-3" />
                Gestion des Pronostics
              </h1>
              <p className="text-muted-foreground">
                Créez et gérez les pronostics sportifs
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Pronostic
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un match..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="scheduled">Programmé</SelectItem>
              <SelectItem value="ongoing">En cours</SelectItem>
              <SelectItem value="won">Gagné</SelectItem>
              <SelectItem value="lost">Perdu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Predictions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pronostics ({filteredPredictions?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Championnat</TableHead>
                    <TableHead>Pronostic</TableHead>
                    <TableHead>Cote</TableHead>
                    <TableHead>Confiance</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPredictions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        Aucun pronostic trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPredictions?.map((prediction: any) => (
                      <TableRow key={prediction.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {prediction.team1} vs {prediction.team2}
                            </p>
                            {prediction.venue && (
                              <p className="text-sm text-gray-500">{prediction.venue}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(prediction.matchDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{prediction.championship}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{prediction.prediction}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{prediction.odds}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {renderConfidenceStars(prediction.confidence || 0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {prediction.isPremium ? (
                            <Badge className="bg-yellow-500 text-black">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline">Gratuit</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <span>{getStatusIcon(prediction.status)}</span>
                            <span className="text-sm">{prediction.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePrediction(prediction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Prediction Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau pronostic</DialogTitle>
              <DialogDescription>
                Ajoutez un nouveau pronostic sportif
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreatePrediction)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="team1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Équipe 1</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: PSG" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="team2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Équipe 2</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Marseille" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="championship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Championnat</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Ligue 1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lieu (optionnel)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Parc des Princes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="matchDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date du match</FormLabel>
                      <FormControl>
                        <Input {...field} type="datetime-local" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="predictionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de pari</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1N2">1N2</SelectItem>
                            <SelectItem value="Over/Under">Over/Under</SelectItem>
                            <SelectItem value="Handicap">Handicap</SelectItem>
                            <SelectItem value="Both Teams To Score">BTTS</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prediction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pronostic</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: 1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="odds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cote</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="Ex: 2.50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confidence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confiance (1-5 étoiles)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 étoile</SelectItem>
                            <SelectItem value="2">2 étoiles</SelectItem>
                            <SelectItem value="3">3 étoiles</SelectItem>
                            <SelectItem value="4">4 étoiles</SelectItem>
                            <SelectItem value="5">5 étoiles</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="analysis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analyse</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Analyse détaillée du match..." rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPremium"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Pronostic Premium</FormLabel>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPredictionMutation.isPending}
                  >
                    {createPredictionMutation.isPending ? "Création..." : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}