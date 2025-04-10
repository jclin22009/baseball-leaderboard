"use client";

import React, { useEffect, useState } from "react";
import { DataTable, loadPredictionsData, schema } from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

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
      <Card>
        <CardHeader>
          <CardTitle>Baseball Predictions Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading predictions...</p>
          ) : (
            <DataTable data={data} />
          )}
        </CardContent>
      </Card>
    </main>
  );
} 