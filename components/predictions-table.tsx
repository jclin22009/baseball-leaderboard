"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMLBStats } from "@/hooks/useMLBStats"
import { MLB_CONSTANTS } from "@/utils/mlb-constants"

interface Prediction {
  student: string
  baseballPlayer: string
  predictedHits: number
  actualHits?: number
  expectedHits?: number
}

export function PredictionsTable() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true)
  const [predictionError, setPredictionError] = useState<string | null>(null)
  
  // Use our custom hook for MLB stats
  const { playerStats, daysElapsed, isLoading: isLoadingStats, error: statsError } = useMLBStats()
  
  // Combined loading state
  const isLoading = isLoadingPredictions || isLoadingStats
  
  // Combined error state
  const error = predictionError || statsError

  // Debug logging
  useEffect(() => {
    console.log("MLB Stats Loading:", isLoadingStats);
    console.log("MLB Stats Error:", statsError);
    console.log("Days Elapsed:", daysElapsed);
    console.log("Player Stats:", playerStats);
  }, [isLoadingStats, statsError, daysElapsed, playerStats]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setIsLoadingPredictions(true)
        
        // Fetch predictions
        const response = await fetch('/predictions.csv')
        if (!response.ok) {
          throw new Error(`Failed to fetch predictions: ${response.status}`);
        }
        
        const csvData = await response.text()
        console.log("CSV Data:", csvData); // Debug log the CSV data
        
        // Parse CSV data
        const rows = csvData.split('\n')
        console.log("CSV Rows:", rows); // Debug log the CSV rows
        
        const parsedData: Prediction[] = rows.slice(1).map(row => {
          if (!row.trim()) return null
          const columns = row.split(',')
          console.log("Columns:", columns); // Debug log each row's columns
          return {
            student: columns[0],
            baseballPlayer: columns[1],
            predictedHits: parseInt(columns[2]),
          }
        }).filter(Boolean) as Prediction[]
        
        console.log("Parsed Predictions:", parsedData); // Debug log parsed data
        
        setPredictions(parsedData)
        setIsLoadingPredictions(false)
      } catch (error) {
        console.error('Error fetching predictions:', error)
        setPredictionError('Failed to load predictions data')
        setIsLoadingPredictions(false)
      }
    }

    fetchPredictions()
  }, [])

  // Process predictions with MLB stats once both are loaded
  const processedPredictions = !isLoading && !error ? predictions.map(prediction => {
    const seasonProgressRatio = daysElapsed / MLB_CONSTANTS.SEASON_LENGTH_DAYS
    console.log(`Processing ${prediction.baseballPlayer}, Looking for in:`, Object.keys(playerStats)); // Debug log
    
    // Get actual hits from MLB API data
    const actualHits = playerStats[prediction.baseballPlayer]?.hits || 0
    console.log(`${prediction.baseballPlayer} actual hits:`, actualHits); // Debug log
    
    // Calculate expected hits based on season progress
    const expectedHits = Math.round(prediction.predictedHits * seasonProgressRatio)
    
    return {
      ...prediction,
      actualHits,
      expectedHits
    }
  }) : predictions
  
  console.log("Final processed predictions:", processedPredictions); // Debug log

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Baseball Player</TableHead>
            <TableHead className="text-right">Predicted Hits</TableHead>
            <TableHead className="text-right">Expected Hits</TableHead>
            <TableHead className="text-right">Actual Hits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedPredictions.map((prediction, index) => (
            <TableRow key={index}>
              <TableCell>{prediction.student}</TableCell>
              <TableCell>{prediction.baseballPlayer}</TableCell>
              <TableCell className="text-right">{prediction.predictedHits}</TableCell>
              <TableCell className="text-right">{prediction.expectedHits}</TableCell>
              <TableCell className="text-right">{prediction.actualHits}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
