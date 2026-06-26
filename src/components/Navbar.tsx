import React from "react";
import { Camera, MapPin, Trophy, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";

interface NavbarProps {
  activeTab: "map" | "camera" | "leaderboard" | "feed";
  onTabChange: (tab: "map" | "camera" | "leaderboard" | "feed") => void;
  userPoints: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, userPoints }) => {
  // Determine user rank tier based on points
  const getRankInfo = (pts: number) => {
    if (pts >= 1200) return { title: "Grand Guardian", level: 3, badge: "👑", color: "text-[#A8DADC] bg-[#2A9D8F]/15 border-[#2A9D8F]/40" };
    if (pts >= 800) return { title: "Senior Guardian", level: 2, badge: "⭐", color: "text-[#A8DADC] bg-[#264653] border-[#2A9D8F]/30" };
    return { title: "Civic Scout", level: 1, badge: "🌱", color: "text-[#A8DADC] bg-[#1C1F22] border-[#2C2F33]" };
  };

  const rank = getRankInfo(userPoints);

  return (
    <header className="sticky top-0 z-50 bg-[#16181C] border-b border-[#2C2F33] transition-all shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange("map")}>
            <div className="w-10 h-10 bg-[#2A9D8F] rounded-xl flex items-center justify-center shadow-lg shadow-[#2A9D8F]/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F1FAEE] flex items-center gap-2">
                CivicSense
                <span className="text-[#2A9D8F] text-sm font-normal uppercase tracking-wider bg-[#2A9D8F]/10 px-2 py-0.5 rounded-md border border-[#2A9D8F]/30">AI</span>
              </h1>
              <p className="text-[11px] text-[#8E9299] font-medium tracking-wide hidden sm:block">Automated Municipal Relief Network</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-2 p-1.5 bg-[#0F1113] rounded-2xl border border-[#2C2F33]">
            <button
              onClick={() => onTabChange("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "map"
                  ? "bg-[#1C1F22] text-[#F1FAEE] border border-[#2C2F33] shadow-md"
                  : "text-[#8E9299] hover:text-[#E0E0E0] hover:bg-[#16181C]"
              }`}
            >
              <MapPin className={`w-4 h-4 ${activeTab === "map" ? "text-[#2A9D8F]" : ""}`} />
              Explore Map
            </button>

            <button
              onClick={() => onTabChange("camera")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all relative ${
                activeTab === "camera"
                  ? "bg-[#2A9D8F] text-white shadow-lg shadow-[#2A9D8F]/30 font-semibold"
                  : "text-[#8E9299] hover:text-[#E0E0E0] hover:bg-[#16181C]"
              }`}
            >
              <Camera className="w-4 h-4 animate-pulse" />
              Camera Report
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8DADC] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2A9D8F]"></span>
              </span>
            </button>

            <button
              onClick={() => onTabChange("feed")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "feed"
                  ? "bg-[#1C1F22] text-[#F1FAEE] border border-[#2C2F33] shadow-md"
                  : "text-[#8E9299] hover:text-[#E0E0E0] hover:bg-[#16181C]"
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${activeTab === "feed" ? "text-[#2A9D8F]" : ""}`} />
              Relief Dispatch
            </button>

            <button
              onClick={() => onTabChange("leaderboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === "leaderboard"
                  ? "bg-[#1C1F22] text-[#F1FAEE] border border-[#2C2F33] shadow-md"
                  : "text-[#8E9299] hover:text-[#E0E0E0] hover:bg-[#16181C]"
              }`}
            >
              <Trophy className={`w-4 h-4 ${activeTab === "leaderboard" ? "text-[#F4A261]" : ""}`} />
              Rank & Rewards
            </button>
          </nav>

          {/* Right Side: Points & User Badge */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#8E9299] font-medium">Rank: {rank.title}</span>
              <div className="flex items-center gap-2.5">
                <span className="text-base sm:text-lg font-bold text-[#A8DADC]">{userPoints.toLocaleString()} pts</span>
                <div className="w-16 sm:w-24 h-1.5 bg-[#2C2F33] rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className="h-full bg-[#2A9D8F] transition-all duration-500" 
                    style={{ width: `${Math.min(100, (userPoints / 1500) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#2A9D8F] p-0.5 cursor-pointer" onClick={() => onTabChange("leaderboard")}>
              <div className="w-full h-full bg-[#343A40] rounded-full flex items-center justify-center font-bold text-sm sm:text-base text-[#A8DADC]">
                BG
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-[#16181C] border-t border-[#2C2F33] px-2 py-2.5 fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
        <button
          onClick={() => onTabChange("map")}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            activeTab === "map" ? "text-[#2A9D8F] font-bold" : "text-[#8E9299]"
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Map</span>
        </button>

        <button
          onClick={() => onTabChange("camera")}
          className={`flex flex-col items-center py-1.5 px-4 rounded-xl transition-all ${
            activeTab === "camera"
              ? "bg-[#2A9D8F] text-white shadow-md shadow-[#2A9D8F]/40"
              : "text-[#8E9299]"
          }`}
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Report</span>
        </button>

        <button
          onClick={() => onTabChange("feed")}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            activeTab === "feed" ? "text-[#2A9D8F] font-bold" : "text-[#8E9299]"
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Relief</span>
        </button>

        <button
          onClick={() => onTabChange("leaderboard")}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            activeTab === "leaderboard" ? "text-[#2A9D8F] font-bold" : "text-[#8E9299]"
          }`}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Rewards</span>
        </button>
      </div>
    </header>
  );
};
