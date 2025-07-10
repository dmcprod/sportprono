import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Trophy, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Link } from "wouter";
import type { Prediction } from "@shared/schema";

interface PredictionsTableProps {
  showPremium?: boolean;
}

export default function PredictionsTable({ showPremium = false }: PredictionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChampionship, setSelectedChampionship] = useState("all");
  const [selectedDate, setSelectedDate] = useState("today");

  const { data: predictions, isLoading, error } = useQuery({
    queryKey: ["/api/predictions", { premium: showPremium }],
    queryFn: async () => {
      const response = await fetch(`/api/predictions?premium=${showPremium}`);
      if (!response.ok) throw new Error("Failed to fetch predictions");
      return response.json() as Promise<Prediction[]>;
    },
  });

  const filteredPredictions = predictions?.filter((prediction) => {
    const matchesSearch = 
      prediction.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prediction.team2.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prediction.championship.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesChampionship = selectedChampionship === "all" || prediction.championship === selectedChampionship;
    
    // For date filtering, we'd need to implement proper date logic
    const matchesDate = selectedDate === "today" || true; // Simplified for now
    
    return matchesSearch && matchesChampionship && matchesDate;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "won":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "lost":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "ongoing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
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

  const getChampionshipColor = (championship: string) => {
    const colors: Record<string, string> = {
      "Ligue 1": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Premier League": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "La Liga": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Bundesliga": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Serie A": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[championship] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-foreground">Chargement des pronostics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <span className="text-foreground">Erreur lors du chargement des pronostics</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un match ou une équipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedChampionship} onValueChange={setSelectedChampionship}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Championnat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les championnats</SelectItem>
            <SelectItem value="Ligue 1">Ligue 1</SelectItem>
            <SelectItem value="Premier League">Premier League</SelectItem>
            <SelectItem value="La Liga">La Liga</SelectItem>
            <SelectItem value="Bundesliga">Bundesliga</SelectItem>
            <SelectItem value="Serie A">Serie A</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="tomorrow">Demain</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Predictions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Championnat</TableHead>
                  <TableHead>Pronostic</TableHead>
                  <TableHead>Cote</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Analyse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPredictions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun pronostic trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPredictions?.map((prediction) => (
                    <TableRow key={prediction.id} className="hover:bg-accent">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {new Date(prediction.matchDate).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(prediction.matchDate).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {prediction.team1} vs {prediction.team2}
                          </div>
                          {prediction.venue && (
                            <div className="text-sm text-muted-foreground">{prediction.venue}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getChampionshipColor(prediction.championship)}>
                          <Trophy className="h-3 w-3 mr-1" />
                          {prediction.championship}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {prediction.prediction}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {prediction.odds}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(prediction.status)}
                          <span className="text-sm text-foreground">{getStatusLabel(prediction.status)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/prediction/${prediction.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Voir l'analyse
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredPredictions && filteredPredictions.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline">
            Charger plus de pronostics
          </Button>
        </div>
      )}
    </div>
  );
}
