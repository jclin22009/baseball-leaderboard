"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function About() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Card className="mx-4 lg:mx-6">
                <CardHeader>
                  <CardTitle>About This Application</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    This Baseball Predictions Leaderboard application was built using:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Next.js</strong> - React framework for server-side rendering and static site generation</li>
                    <li><strong>Shadcn UI</strong> - A collection of reusable UI components built with Radix UI and Tailwind CSS</li>
                    <li><strong>Recharts</strong> - A composable charting library built on React components</li>
                  </ul>
                  <p className="mt-4">
                    The application pulls data from the MLB Giants API to provide up-to-date baseball statistics and predictions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 