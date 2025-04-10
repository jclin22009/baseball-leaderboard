import { Topbar } from "@/components/topbar";
import { PredictionsTable } from "@/components/predictions-table";
import PlayerPerformanceChart from "@/components/PlayerPerformanceChart";

export default function Home() {
  return (
    <div className="p-4">
      <Topbar />
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-4">MLB Hits Predictions Leaderboard</h1>
        <PredictionsTable />
      </div>
     
      <div className="mt-8 border-t pt-8">
        <PlayerPerformanceChart />
      </div>
    </div>
  );
}
