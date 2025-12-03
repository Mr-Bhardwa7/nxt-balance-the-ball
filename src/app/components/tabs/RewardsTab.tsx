import { useState } from "react";
import { motion } from "framer-motion";

// Your rank color function
const getRankColors = (rank: number) => {
  switch (rank) {
    case 0:
      return {
        bg: "bg-gradient-to-r from-yellow-400 to-yellow-600",
        border: "border-yellow-400",
        text: "text-black",
        icon: "🥇",
      };
    case 1:
      return {
        bg: "bg-gradient-to-r from-gray-300 to-gray-500",
        border: "border-gray-400",
        text: "text-black",
        icon: "🥈",
      };
    case 2:
      return {
        bg: "bg-gradient-to-r from-amber-700 to-yellow-900",
        border: "border-amber-600",
        text: "text-white",
        icon: "🥉",
      };
    default:
      return {
        bg: "bg-gray-800",
        border: "border-gray-700",
        text: "text-white",
        icon: "🎯",
      };
  }
};

export default function RewardsTab() {
  const [selectedSession, setSelectedSession] = useState<"S1" | "S2">("S2");

  // Mock session data
  const sessionData: Record<string, { name: string; time: number }[]> = {
    S1: [
      { name: "Player 1", time: 120 },
      { name: "Player 2", time: 150 },
      { name: "Player 3", time: 180 },
    ],
    S2: [
      { name: "Player A", time: 110 },
      { name: "Player B", time: 160 },
      { name: "Player C", time: 200 },
    ],
  };

  const formatTime = (t: number) => `${Math.floor(t / 60)}m ${t % 60}s`;

  return (
    <motion.div
      key="rewards"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col gap-4 p-2 text-sm"
    >
      <h3 className="font-semibold text-lg mb-2">Sessions</h3>

      {/* Session Tabs */}
      <div className="flex gap-2">
        {(["S2", "S1"] as const).map((session) => (
          <button
            key={session}
            onClick={() => setSelectedSession(session)}
            className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-colors
              ${
                selectedSession === session
                  ? "bg-blue-600 border-blue-400 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              }`}
          >
            {session}
          </button>
        ))}
      </div>

      {/* Winner Cards */}
      <div className="mt-3 space-y-2">
        {sessionData[selectedSession].map((player, rank) => {
          const { bg, border, text, icon } = getRankColors(rank);
          return (
            <div
              key={rank}
              className={`flex justify-between items-center rounded-lg px-3 py-2 border ${bg} ${border} ${text}`}
            >
              {/* Left Side: Rank + Player */}
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <div>
                  <p className="font-semibold">{player.name}</p>
                  <p className="text-[11px] opacity-80">Rank #{rank + 1}</p>
                </div>
              </div>

              {/* Right Side: Time + Claim */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium">{formatTime(player.time)}</span>
                {rank === 0 ? (
                  <button
                    onClick={() => alert("Prize claimed!")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs px-2 py-1 rounded font-semibold text-white"
                  >
                    Claim
                  </button>
                ) : (
                  <span className="text-xs opacity-80">--</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
