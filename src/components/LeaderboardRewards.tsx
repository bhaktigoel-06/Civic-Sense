import React, { useState } from "react";
import { LeaderboardUser, RewardItem } from "../types";
import { Trophy, Award, Sparkles, Gift, CheckCircle2, Lock, ArrowUpRight, ShieldCheck, Star } from "lucide-react";

interface LeaderboardRewardsProps {
  leaderboard: LeaderboardUser[];
  rewards: RewardItem[];
  userPoints: number;
  onClaimReward: (rewardId: string) => void;
}

export const LeaderboardRewards: React.FC<LeaderboardRewardsProps> = ({
  leaderboard,
  rewards,
  userPoints,
  onClaimReward
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"leaderboard" | "rewards">("rewards");
  const [claimedModal, setClaimedModal] = useState<RewardItem | null>(null);

  // Determine current tier level
  const getUserRankLevel = (pts: number) => {
    if (pts >= 1200) return { name: "Grand Guardian", level: 3, nextTarget: 2000 };
    if (pts >= 800) return { name: "Senior Guardian", level: 2, nextTarget: 1200 };
    return { name: "Civic Scout", level: 1, nextTarget: 800 };
  };

  const rank = getUserRankLevel(userPoints);
  const ptsToNext = Math.max(0, rank.nextTarget - userPoints);
  const progressPct = Math.min(100, (userPoints / rank.nextTarget) * 100);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0F1113] text-[#E0E0E0] p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-5xl space-y-8 text-left">
        
        {/* Banner: Rank Overview Card (Inspired by Theme Header & Footer) */}
        <div className="bg-gradient-to-r from-[#16181C] via-[#1C1F22] to-[#16181C] p-6 sm:p-8 rounded-3xl border border-[#2A9D8F]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#2A9D8F]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#2A9D8F] to-[#264653] flex items-center justify-center text-white shadow-xl shadow-[#2A9D8F]/30 text-3xl shrink-0">
                🏆
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-[#2A9D8F] font-bold">Citizen Standing</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1FAEE] tracking-tight flex items-center gap-2">
                  {rank.name}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#264653] text-[#A8DADC] border border-[#2A9D8F]/30 font-semibold">
                    Level {rank.level}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#8E9299] mt-1">
                  Report potholes and hazards to earn municipal credits and public recognition.
                </p>
              </div>
            </div>

            {/* Points & Progress Box */}
            <div className="bg-[#0F1113]/80 p-5 rounded-2xl border border-[#2C2F33] w-full md:w-80 shrink-0 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#8E9299]">Current Balance:</span>
                <span className="text-base font-bold text-[#A8DADC] font-mono">{userPoints.toLocaleString()} pts</span>
              </div>

              <div className="w-full h-2 bg-[#2C2F33] rounded-full overflow-hidden">
                <div className="h-full bg-[#2A9D8F] transition-all duration-700" style={{ width: `${progressPct}%` }}></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8E9299]">
                <span>Next Tier Target</span>
                <span className="text-[#2A9D8F] font-medium">{ptsToNext > 0 ? `${ptsToNext} more pts needed` : "Max Rank Achieved"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex justify-between items-center border-b border-[#2C2F33] pb-4">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveSubTab("rewards")}
              className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeSubTab === "rewards"
                  ? "bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-lg shadow-[#2A9D8F]/25"
                  : "bg-[#16181C] text-[#8E9299] border-[#2C2F33] hover:text-[#E0E0E0]"
              }`}
            >
              <Gift className="w-4 h-4" /> Worthy Rewards Catalog
            </button>

            <button
              onClick={() => setActiveSubTab("leaderboard")}
              className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeSubTab === "leaderboard"
                  ? "bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-lg shadow-[#2A9D8F]/25"
                  : "bg-[#16181C] text-[#8E9299] border-[#2C2F33] hover:text-[#E0E0E0]"
              }`}
            >
              <Trophy className="w-4 h-4" /> Citizen Leaderboard
            </button>
          </div>

          <span className="text-xs font-mono text-[#8E9299] hidden sm:inline-block">Metropolitan District #4</span>
        </div>

        {/* SUB TAB 1: WORTHY REWARDS */}
        {activeSubTab === "rewards" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rewards.map(reward => {
                const canUnlock = userPoints >= reward.requiredPoints;

                return (
                  <div
                    key={reward.id}
                    className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all relative overflow-hidden shadow-xl ${
                      reward.claimed
                        ? "bg-[#16181C]/80 border-[#2A9D8F]/50 ring-1 ring-[#2A9D8F]/30"
                        : canUnlock
                        ? "bg-[#16181C] border-[#2C2F33] hover:border-[#2A9D8F]"
                        : "bg-[#121418] border-[#1F2124] opacity-75"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#1C1F22] border border-[#2C2F33] flex items-center justify-center text-3xl shadow-md">
                          {reward.icon}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-xs font-mono px-3 py-1 rounded-full border font-bold ${
                            canUnlock ? "bg-[#2A9D8F]/20 text-[#A8DADC] border-[#2A9D8F]/40" : "bg-[#1C1F22] text-[#8E9299] border-[#2C2F33]"
                          }`}>
                            {reward.requiredPoints} pts
                          </span>
                          <span className="text-[10px] text-[#8E9299] mt-1">{reward.sponsor}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-[#F1FAEE] tracking-tight">{reward.title}</h3>
                        <p className="text-xs text-[#8E9299] mt-2 leading-relaxed">{reward.description}</p>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#2C2F33] flex items-center justify-between">
                      {reward.claimed ? (
                        <div className="w-full bg-[#2A9D8F]/15 border border-[#2A9D8F]/30 rounded-2xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#2A9D8F] text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Claimed Voucher Code:
                          </div>
                          <span className="font-mono font-bold text-[#F1FAEE] text-xs tracking-wider bg-black/40 px-2.5 py-1 rounded-lg border border-[#2A9D8F]/40">
                            {reward.voucherCode || "TRANSIT-100X"}
                          </span>
                        </div>
                      ) : (
                        <button
                          disabled={!canUnlock}
                          onClick={() => {
                            onClaimReward(reward.id);
                            setClaimedModal(reward);
                          }}
                          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            canUnlock
                              ? "bg-[#2A9D8F] hover:bg-[#264653] text-white shadow-lg shadow-[#2A9D8F]/25"
                              : "bg-[#1C1F22] text-[#8E9299] cursor-not-allowed border border-[#2C2F33]"
                          }`}
                        >
                          {canUnlock ? (
                            <>
                              <Sparkles className="w-4 h-4 text-[#A8DADC]" /> Redeem Worthy Reward
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" /> Need {reward.requiredPoints - userPoints} more pts
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Theme footer block reminder */}
            <div className="bg-[#2A9D8F]/10 border border-[#2A9D8F]/30 p-5 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🌱</span>
                <div>
                  <h4 className="text-sm font-bold text-[#F1FAEE]">Want more municipal vouchers?</h4>
                  <p className="text-xs text-[#A8DADC]">Verify 5 pending community reports on the map to earn bonus +150 points.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB TAB 2: CITIZEN LEADERBOARD */}
        {activeSubTab === "leaderboard" && (
          <div className="bg-[#16181C] rounded-3xl border border-[#2C2F33] p-6 sm:p-8 space-y-4 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between mb-2 pb-3 border-b border-[#2C2F33]">
              <span className="text-xs uppercase tracking-widest text-[#8E9299] font-bold">Citizen Rank</span>
              <span className="text-xs uppercase tracking-widest text-[#8E9299] font-bold">Contributions & Score</span>
            </div>

            <div className="space-y-3">
              {leaderboard.map(user => {
                const isTop3 = user.rank <= 3;
                
                return (
                  <div
                    key={user.name}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      user.isCurrentUser
                        ? "bg-[#264653]/60 border-[#2A9D8F] shadow-lg ring-1 ring-[#2A9D8F]/40 scale-101"
                        : "bg-[#1C1F22] border-[#2C2F33] hover:border-[#8E9299]/40"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm shrink-0 ${
                      user.rank === 1 ? "bg-amber-500 text-black shadow-md shadow-amber-500/30" :
                      user.rank === 2 ? "bg-slate-300 text-black" :
                      user.rank === 3 ? "bg-amber-700 text-white" :
                      "bg-[#0F1113] text-[#8E9299] border border-[#2C2F33]"
                    }`}>
                      #{user.rank < 10 ? `0${user.rank}` : user.rank}
                    </div>

                    <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full object-cover border border-[#2C2F33] shrink-0" referrerPolicy="no-referrer" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-[#F1FAEE] truncate">{user.name}</span>
                        {user.isCurrentUser && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A9D8F] text-white font-semibold">YOU</span>
                        )}
                      </div>
                      <p className="text-xs text-[#A8DADC] truncate">{user.badge}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base sm:text-lg font-bold text-[#A8DADC] font-mono">{user.points.toLocaleString()} pts</div>
                      <div className="text-[11px] text-[#8E9299]">{user.reportsCount} reports verified</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Claim Success Popup Voucher Modal */}
        {claimedModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#16181C] border border-[#2A9D8F] rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative">
              <div className="w-16 h-16 rounded-2xl bg-[#2A9D8F] text-white flex items-center justify-center mx-auto text-3xl shadow-xl shadow-[#2A9D8F]/40 animate-bounce">
                🎉
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#F1FAEE]">Worthy Reward Claimed!</h3>
                <p className="text-xs text-[#A8DADC] mt-1">{claimedModal.title}</p>
              </div>

              <div className="bg-[#0F1113] p-4 rounded-2xl border border-[#2C2F33]">
                <span className="text-[10px] uppercase text-[#8E9299] font-bold block mb-1">Official Municipal Redemption Voucher</span>
                <span className="font-mono font-bold text-lg text-[#F4A261] tracking-widest select-all">
                  {claimedModal.voucherCode || "CIVIC-PASS-2026-X"}
                </span>
              </div>

              <p className="text-xs text-[#8E9299]">Present this digital voucher at official city transit offices or participating green merchants.</p>

              <button
                onClick={() => setClaimedModal(null)}
                className="w-full py-3.5 rounded-2xl bg-[#2A9D8F] hover:bg-[#264653] text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
