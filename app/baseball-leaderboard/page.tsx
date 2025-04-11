"use client";

import React, { useEffect, useState } from "react";
import { DataTable, loadPredictionsData, schema } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton"

export default function BaseballLeaderboardPage() {
  const [data, setData] = useState<z.infer<typeof schema>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const predictions = await loadPredictionsData();
        setData(predictions);
      } catch (error) {
        console.error("Failed to load predictions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <main className="container mx-auto py-10">
      <Card className="mx-4 lg:mx-6">
        <CardHeader>
          <CardTitle>Baseball Predictions Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <DataTable data={data} />
          )}
        </CardContent>
      </Card>
    </main>
  );
} 