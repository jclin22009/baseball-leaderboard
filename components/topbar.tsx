import { ModeToggle } from "@/components/darkmode-button";

export function Topbar() {
  return (
    <div className="flex justify-between items-center py-4">
      <div className="flex items-center gap-2 text-2xl">
        <span className="font-bold">CS47N</span>
        <span className="font-light">Baseball Prediction Challenge</span>
      </div>
      <ModeToggle />
    </div>
  );
} 