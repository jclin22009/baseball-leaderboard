"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { useTeamHitters } from "@/hooks/useTeamHitters" 
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

// Generates colors for each player
const generatePlayerColors = (playerIndex: number) => {
  const colors = [
    { primary: "var(--color-orange)", fill: "url(#fillOrange)" },
    { primary: "var(--color-blue)", fill: "url(#fillBlue)" },
    { primary: "var(--color-green)", fill: "url(#fillGreen)" },
    { primary: "var(--color-purple)", fill: "url(#fillPurple)" },
    { primary: "var(--color-red)", fill: "url(#fillRed)" },
  ]
  
  return colors[playerIndex % colors.length]
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const { data: hittersData, isLoading, error } = useTeamHitters()

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Format data for the chart
  const formatChartData = () => {
    if (!hittersData?.topHitters || hittersData.topHitters.length === 0) {
      return []
    }

    // Get all unique dates from all players
    const allDates = new Set<string>()
    hittersData.topHitters.forEach(hitter => {
      hitter.hitsByDate.forEach(game => {
        allDates.add(game.date)
      })
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort()

    // Filter dates based on selected timeRange
    const filteredDates = sortedDates.filter(dateStr => {
      const date = new Date(dateStr)
      const today = new Date()
      let daysToSubtract = 90
      
      if (timeRange === "30d") {
        daysToSubtract = 30
      } else if (timeRange === "7d") {
        daysToSubtract = 7
      }
      
      const startDate = new Date(today)
      startDate.setDate(startDate.getDate() - daysToSubtract)
      return date >= startDate
    })

    // Initialize running totals for each player
    const playerTotals: Record<string, number> = {}
    hittersData.topHitters.forEach(hitter => {
      const playerKey = hitter.name.split(' ').pop() || hitter.name
      playerTotals[playerKey] = 0
    })

    // Create chart data with cumulative hits for each player
    return filteredDates.map(date => {
      const dataPoint: Record<string, string | number> = { date }
      
      hittersData.topHitters.forEach(hitter => {
        const gameForDate = hitter.hitsByDate.find(game => game.date === date)
        const playerKey = hitter.name.split(' ').pop() || hitter.name
        
        // Add current day's hits to running total
        if (gameForDate) {
          playerTotals[playerKey] += gameForDate.hits
        }
        
        // Store cumulative total
        dataPoint[playerKey] = playerTotals[playerKey]
      })
      
      return dataPoint
    })
  }

  // Create chart config from players
  const createChartConfig = () => {
    if (!hittersData?.topHitters) return {}
    
    const config: ChartConfig = {}
    
    hittersData.topHitters.forEach((hitter, index) => {
      const playerName = hitter.name.split(' ').pop() || hitter.name // Use last name if possible
      config[playerName] = {
        label: hitter.name,
        color: generatePlayerColors(index).primary,
      }
    })
    
    return config
  }

  const chartData = formatChartData()
  const chartConfig = createChartConfig()

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>SF Giants: Top 5 Hitters</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Cumulative hits since the start of the 2025 season
          </span>
          <span className="@[540px]/card:hidden">2025 Season Cumulative Hits</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center">Loading data...</div>
        ) : error ? (
          <div className="flex h-[250px] items-center justify-center">Error loading data</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-orange)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-orange)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-blue)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-blue)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-green)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-green)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-purple)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-purple)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-red)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-red)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis 
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 'dataMax + 1']}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Legend />
              {hittersData?.topHitters.map((hitter, index) => {
                const playerName = hitter.name.split(' ').pop() || hitter.name
                const color = generatePlayerColors(index)
                return (
                  <Area
                    key={hitter.id}
                    dataKey={playerName}
                    type="monotone"
                    fill={color.fill}
                    stroke={color.primary}
                    strokeWidth={2}
                  />
                )
              })}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
