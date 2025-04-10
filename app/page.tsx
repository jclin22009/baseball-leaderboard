import { Topbar } from "@/components/topbar";
export default function Home() {
  return (
    <div className="p-4">
      <Topbar />
      <div className="mt-8">
        <h1 className="text-2xl font-bold mb-4">MLB Hits Predictions Leaderboard</h1>
        table will go here
      </div>
     
      <div className="mt-8 border-t pt-8">
        chart will go here
      </div>
    </div>
  );
}
