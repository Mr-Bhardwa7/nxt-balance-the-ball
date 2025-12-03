import { motion } from "framer-motion";
import {  useRef, useState } from "react";
import { HelpCircle, Target, RotateCcw, Trophy, User, Gift } from "lucide-react";
import UserProfileForm from "@/components/tabs/UserProfileForm";
import RewardsTab from "@/components/tabs/RewardsTab";
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

type Score = {
    name: string;
    mobile: string;
    time: number; // time in seconds
};

type ScoreboardProps = {
  scores: Score[];
  isOpen: boolean;
  onToggle: () => void;
  currentUser?: {
    mobile: string;
    name: string;
  }; // optional: current player name
};

type TabType = "leaderboard" | "instructions" | "userForm" | "rewards";

const formatTime = (time: number) => {
  const mins = Math.floor(time / 60);
  const secs = time % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

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
    case -1:
      return {
        bg: "bg-gradient-to-r from-green-400 to-green-600",
        border: "border-green-300",
        text: "text-white",
        icon: "👤",
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

const Scoreboard: React.FC<ScoreboardProps> = ({ scores, isOpen, onToggle, currentUser }) => {
  const listRef = useRef<HTMLUListElement>(null);
  const isProfileVerified = useSelector((state: RootState) => state.isVerified)
  const [activeTab, setActiveTab] = useState<TabType>(!isProfileVerified ? "userForm" : "leaderboard");

  const tabTitles: Record<typeof activeTab, React.ReactNode> = {
    leaderboard: (
      <div className="inline-flex items-center gap-2 pb-2 pt-2">
        🏆 Leaderboard
        <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-semibold rounded">
          S1
        </span>
      </div>
    ),
    instructions: (
      <div className="inline-flex items-center gap-2 pb-2 pt-2">
        📖 How To Play
      </div>
    ),
    userForm: (
      <div className="inline-flex items-center gap-2 pt-2">
        <User className="w-6 h-6 text-emerald-500" />
        Your Profile
      </div>
    ),
    rewards: (
      <div className="inline-flex items-center gap-2 pt-2">
        🎁 Rewards
      </div>
    ),
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 120 }}
      className="fixed top-0 right-0 h-full w-72 bg-gray-950/95 backdrop-blur-md shadow-2xl text-white z-50"
    >
      {/* Toggle Button - pinned top right */}
      <button
        onClick={onToggle}
        className={`absolute top-4 bg-gray-800 text-white px-3 py-2 rounded-l-lg shadow-lg hover:bg-gray-700 flex items-center gap-2
            ${isOpen ? "-left-9" : "-left-9 md:-left-32"}`}
      >
        {isOpen ? "⮞" : "⮜"}
        {!isOpen && (
          <span className="hidden md:inline text-sm font-semibold">
            Game Arena
          </span>
        )}
      </button>

      {/* Instructions Button when scoreboard is open */}
      {isOpen && (
        <>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className="absolute top-16 -left-9 cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-l-lg shadow-lg transition-colors"
            title="Leaderboard"
          >
            <Trophy className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab("userForm")}
            className="absolute top-26 -left-9 cursor-pointer bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-l-lg shadow-lg transition-colors"
            title="Profile"
          >
            <User className="w-4 h-4" />
          </button>
          {/* <button
            onClick={() => setActiveTab("rewards")}
            className="absolute top-36 -left-9 cursor-pointer bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-l-lg shadow-lg transition-colors"
            title="Rewards"
          >
            <Gift className="w-4 h-4" />
          </button> */}
          
          {/* top-46 */}
          <button
            onClick={() => setActiveTab("instructions")}
            className="absolute top-36 -left-9 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-l-lg shadow-lg transition-colors"
            title="Instructions"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </>
      )}

      <div className="p-4 pr-0 flex flex-col h-full">
        {/* Header with Tab Indicator */}
        <div className="mb-3">
          <h2 className="text-2xl font-extrabold text-center drop-shadow-lg">{tabTitles[activeTab]}</h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "leaderboard" && (
            /* Leaderboard Content */
            <ul ref={listRef} className="space-y-2 overflow-y-auto pr-2 h-full">
              {scores.length > 0 ? (
                scores
                  .sort((a, b) => a.time - b.time)
                  .map((score, index) => {
                    const isCurrent = currentUser?.mobile === score.mobile;
                    const { bg, border, text, icon } = isCurrent ? getRankColors(-1) : getRankColors(index);

                    return (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                            ${bg} ${text} border ${border} px-3 py-2 rounded-xl shadow-md flex justify-between items-center text-sm
                            ${isCurrent ? "sticky bottom-0 z-10" : ""}
                          `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{icon}</span>
                          <div>
                            <p className="font-semibold">{isCurrent ? currentUser.name : score.name}</p>
                            <p className="text-[10px] opacity-80">{isCurrent ? "login to see the rank" : `Rank #${index + 1}`}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-sm">
                          {formatTime(score.time)}
                        </span>
                      </motion.li>
                    );
                  })
              ) : (
                <li className="text-gray-400 text-center text-sm">No scores yet</li>
              )}
            </ul>
          )}

          {activeTab === "userForm" && <UserProfileForm />}
          {activeTab === "rewards" && <RewardsTab />}


          
          {activeTab === "instructions" && (
            /* Instructions Content */
            <div className="overflow-y-auto pr-2 h-full space-y-4 text-sm">
              {/* Objective */}
              <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-700">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-blue-300">Objective</h3>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Navigate the blue ball around the circular track to complete a full 360° rotation as quickly as possible!
                </p>
              </div>

              {/* Game Rules */}
              <div>
                <h3 className="font-bold text-white mb-3">Game Rules</h3>
                <div className="space-y-3">
                  <div className="bg-green-900/30 p-3 rounded-lg border border-green-700">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-300 text-xs mb-1">Start Position</h4>
                        <p className="text-xs text-gray-300">
                          Ball starts at the yellow line between the circles.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-300 text-xs mb-1">Movement</h4>
                        <p className="text-xs text-gray-300">
                          Drag the ball clockwise. Forward only, no backward movement.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-900/30 p-3 rounded-lg border border-red-700">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-300 text-xs mb-1">Avoid Walls</h4>
                        <p className="text-xs text-gray-300">
                          Don’t touch the inner or outer circles. The ball turns red on collision!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-700">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-300 text-xs mb-1">Win Condition</h4>
                        <p className="text-xs text-gray-300">
                          Complete a full 360° rotation. Faster = better score!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-bold text-yellow-300 text-sm">Controls</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold text-gray-300 text-xs">Desktop</h4>
                    <p className="text-xs text-gray-400">Click and drag with mouse</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-300 text-xs">Mobile</h4>
                    <p className="text-xs text-gray-400">Touch and drag with finger</p>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-600">
                <h3 className="font-bold text-white text-sm mb-2">Pro Tips 💡</h3>
                <ul className="space-y-1 text-xs text-gray-300">
                  <li className="flex items-start gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Stay in center of track for safety</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Steady pace reduces collision risk</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Practice improves muscle memory</span>
                  </li>
                </ul>
              </div>

              <div className="text-center pt-2 pb-4">
                <p className="text-xs text-gray-400">Good luck! 🎮</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Scoreboard;