"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconCopy, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { loadPredictionsData } from "@/components/data-table";

export function CopyTopGuessesButton() {
  const [isLoading, setIsLoading] = useState(false);

  // Function to copy top 5 guesses to clipboard
  const copyTopGuesses = async () => {
    setIsLoading(true);
    try {
      // Fetch the data
      const data = await loadPredictionsData();
      
      // Sort by percentageOff (ascending)
      const sortedData = [...data].sort((a, b) => {
        // Handle infinite cases (actual hits = 0)
        if (a.actualHits === 0 && (a.predictedHitsSoFar ?? 0) > 0) {
          return 1; // a is "worst"
        }
        if (b.actualHits === 0 && (b.predictedHitsSoFar ?? 0) > 0) {
          return -1; // b is "worst"
        }
        // Normal comparison
        return (a.percentageOff ?? Infinity) - (b.percentageOff ?? Infinity);
      });
      
      // Take the top 5 rows
      const top5Rows = sortedData.slice(0, 5);
      
      // Create HTML table for rich formatting
      let htmlTable = `
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
          <thead style="background-color: #f3f4f6;">
            <tr>
              <th align="center">Rank</th>
              <th align="left">Student</th>
              <th align="left">Player</th>
              <th align="center">Predicted Hits</th>
              <th align="center">Predicted (To Date)</th>
              <th align="center">Actual Hits</th>
              <th align="center">Delta</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      // Add each row to HTML table
      top5Rows.forEach((item, index) => {
        const delta = item.actualHits === 0 && (item.predictedHitsSoFar ?? 0) > 0 
          ? "∞" 
          : `${item.percentageOff?.toFixed(2)}%`;
        
        htmlTable += `
          <tr>
            <td align="center">${index + 1}</td>
            <td align="left">${item.student}</td>
            <td align="left">${item.player}</td>
            <td align="center">${item.predictedHits}</td>
            <td align="center">${item.predictedHitsSoFar?.toFixed(1) || "0.0"}</td>
            <td align="center">${item.actualHits || 0}</td>
            <td align="center">${delta}</td>
          </tr>
        `;
      });
      
      // Close the HTML table and add explanation
      htmlTable += `
          </tbody>
        </table>
        <p style="font-style: italic; font-size: 0.9em; margin-top: 10px;">
          Predicted hits (to date) are calculated based on the proportion of MLB games completed so far in the season (until our end date May 31). 
        </p>
      `;
      
      // Also create a plain text version as fallback
      let plainText = "Rank\tStudent\tPlayer\tPredicted Hits\tPredicted (To Date)\tActual Hits\tDelta\n";
      plainText += "----\t-------\t------\t--------------\t------------------\t-----------\t-----\n";
      
      top5Rows.forEach((item, index) => {
        const delta = item.actualHits === 0 && (item.predictedHitsSoFar ?? 0) > 0 
          ? "∞" 
          : `${item.percentageOff?.toFixed(2)}%`;
        
        plainText += `${index + 1}\t${item.student}\t${item.player}\t${item.predictedHits}\t${item.predictedHitsSoFar?.toFixed(1) || "0.0"}\t${item.actualHits || 0}\t${delta}\n`;
      });
      
      plainText += "\nPredicted hits (to date) are calculated based on the proportion of MLB games completed so far in the season (until our end date May 31).";
      
      // Copy to clipboard as both HTML and plain text
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlTable], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' })
        })
      ]);
      
      // Show success toast notification
      toast.success("Formatted guesses table copied to clipboard", {
        action: {
          label: "Dismiss",
          onClick: () => {}
        },
        icon: <IconCheck className="h-4 w-4" />,
        duration: 3000
      });
      
    } catch (error) {
      console.error("Failed to copy: ", error);
      // Fallback to basic plain text clipboard API if the newer API fails
      try {
        // Fetch the data again if needed
        const data = await loadPredictionsData();
        
        // Sort by percentageOff (ascending)
        const sortedData = [...data].sort((a, b) => {
          // Handle infinite cases (actual hits = 0)
          if (a.actualHits === 0 && (a.predictedHitsSoFar ?? 0) > 0) {
            return 1; // a is "worst"
          }
          if (b.actualHits === 0 && (b.predictedHitsSoFar ?? 0) > 0) {
            return -1; // b is "worst"
          }
          // Normal comparison
          return (a.percentageOff ?? Infinity) - (b.percentageOff ?? Infinity);
        });
        
        // Take the top 5 rows
        const top5Rows = sortedData.slice(0, 5);
        
        // Format data as a table with headers (plain text fallback)
        let tableText = "Rank\tStudent\tPlayer\tPredicted Hits\tPredicted (To Date)\tActual Hits\tDelta\n";
        tableText += "----\t-------\t------\t--------------\t------------------\t-----------\t-----\n";
        
        top5Rows.forEach((item, index) => {
          const delta = item.actualHits === 0 && (item.predictedHitsSoFar ?? 0) > 0 
            ? "∞" 
            : `${item.percentageOff?.toFixed(2)}%`;
          
          tableText += `${index + 1}\t${item.student}\t${item.player}\t${item.predictedHits}\t${item.predictedHitsSoFar?.toFixed(1) || "0.0"}\t${item.actualHits || 0}\t${delta}\n`;
        });
        
        tableText += "\nPredicted hits (to date) are calculated based on the proportion of MLB games completed so far in the season (until our end date May 31).";
        
        // Use the basic clipboard API
        await navigator.clipboard.writeText(tableText);
        
        // Show success toast notification (fallback method)
        toast.success("Top guesses copied to clipboard", {
          description: "Using fallback method - formatting may be limited",
          duration: 3000
        });
        
      } catch (fallbackError) {
        console.error("Clipboard fallback also failed:", fallbackError);
        
        // Show error toast notification
        toast.error("Failed to copy to clipboard", {
          description: "Please try again or copy manually",
          duration: 5000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={copyTopGuesses}
      disabled={isLoading}
    >
      {isLoading ? (
        <IconLoader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <IconCopy className="mr-1 h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {isLoading ? "Calculating..." : "Copy top guesses"}
      </span>
      <span className="sm:hidden">
        {isLoading ? "..." : "Copy"}
      </span>
    </Button>
  );
} 