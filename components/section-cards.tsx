import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { loadPredictionsData } from "@/components/data-table";

interface Prediction {
  id: number;
  student: string;
  player: string;
  predictedHits: number;
  predictedHitsSoFar: number | null;
  actualHits: number | null;
  percentageOff: number | null;
}

export function SectionCards() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadPredictionsData();
        setPredictions(data);
      } catch (error) {
        console.error("Failed to load predictions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Get top predictions based on different metrics
  const getBestPredictions = () => {
    if (predictions.length === 0) return [];

    // Sort a copy of the predictions array to avoid mutating the original
    const sortedByAccuracy = [...predictions]
      .filter(p => p.percentageOff !== null)
      .sort((a, b) => (a.percentageOff ?? Infinity) - (b.percentageOff ?? Infinity));
    
    // Get worst prediction (highest percentage off)
    const worstPrediction = [...predictions]
      .filter(p => p.percentageOff !== null)
      .sort((a, b) => (b.percentageOff ?? 0) - (a.percentageOff ?? 0))[0];
    
    // Return exactly 4 predictions
    return [
      // Most accurate prediction (lowest percentage off)
      sortedByAccuracy[0] || predictions[0],
      // Second most accurate 
      sortedByAccuracy[1] || predictions[1],
      // Third most accurate
      sortedByAccuracy[2] || predictions[2],
      // Least accurate prediction (highest percentage off)
      worstPrediction || predictions[3]
    ];
  };

  const topPredictions = getBestPredictions();
  
  if (loading || topPredictions.length === 0) {
    return <div>Loading predictions...</div>;
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {topPredictions.map((prediction, index) => {
        const rankLabels = ["1st Place", "2nd Place", "3rd Place", "Furthest Prediction"];
        
        // Extract first name
        const firstName = prediction.student.split(' ')[0];
        
        return (
          <Card key={prediction.id} className="@container/card">
            <CardHeader>
              <CardDescription>{rankLabels[index]}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {firstName}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  {prediction.percentageOff !== null && (
                    <>
                      ±{prediction.percentageOff}%
                    </>
                  )}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Guessed {prediction.predictedHits} hits → {prediction.predictedHitsSoFar ?? 0} to date
              </div>
              <div className="text-muted-foreground">
                For player {prediction.player}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
