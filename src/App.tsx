import React, { useState, useEffect } from "react";
import { CivicReport, LeaderboardUser, RewardItem, ReportStatus } from "./types";
import { getStoredReports, saveNewReport, upvoteReport, getUserPoints, addPoints, getLeaderboard, updateLeaderboardPoints, getStoredRewards, claimStoredReward, reportSameLocationIssue, updateAuthorityProgress, simulateDaysPassing } from "./utils/storage";
import { Navbar } from "./components/Navbar";
import { MapView } from "./components/MapView";
import { CameraReport } from "./components/CameraReport";
import { ReliefFeed } from "./components/ReliefFeed";
import { LeaderboardRewards } from "./components/LeaderboardRewards";
import { Sparkles, CheckCircle2, HeartHandshake } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"map" | "camera" | "leaderboard" | "feed">("map");
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [userPoints, setUserPoints] = useState<number>(980);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  
  // Toast celebration notification
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);

  useEffect(() => {
    setReports(getStoredReports());
    setUserPoints(getUserPoints());
    setLeaderboard(getLeaderboard());
    setRewards(getStoredRewards());
  }, []);

  const triggerToast = (title: string, desc: string) => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 5000);
  };

  // Handle new civic issue reported via camera
  const handleReportSubmitted = (newReport: CivicReport, earnedPoints: number) => {
    const updatedReports = saveNewReport(newReport);
    setReports(updatedReports);

    const newPts = addPoints(earnedPoints);
    setUserPoints(newPts);

    const updatedLb = updateLeaderboardPoints(newPts);
    setLeaderboard(updatedLb);

    setActiveTab("map");
    triggerToast(
      "🛡️ Civic Notice Dispatched!",
      `Added "${newReport.title}" to commuter map. +${earnedPoints} Rank Points rewarded!`
    );
  };

  // Handle citizen endorsement/upvoting
  const handleUpvote = (reportId: string) => {
    const updated = upvoteReport(reportId);
    setReports(updated);
    
    // Tiny incentive for community engagement (+5 pts)
    const newPts = addPoints(5);
    setUserPoints(newPts);
  };

  // Handle duplicate report at same location
  const handleReportDuplicate = (reportId: string) => {
    const { updated, escalated } = reportSameLocationIssue(reportId);
    setReports(updated);
    if (escalated) {
      triggerToast("🚨 Escalation Triggered!", "More than 2 citizens reported this location issue. Authorities notified with priority status.");
    } else {
      triggerToast("📍 Duplicate Recorded", "Your report confirms this hazard location.");
    }
  };

  // Handle authority marking progress
  const handleUpdateProgress = (reportId: string, status: ReportStatus, notes: string) => {
    const updated = updateAuthorityProgress(reportId, status, notes);
    setReports(updated);
    triggerToast("🛠️ Authority Progress Saved", `Status updated to "${status}". Inactive SLA timers reset.`);
  };

  // Handle simulating days passing
  const handleSimulateDays = (days: number) => {
    const { updatedReports, warnedCount, blacklistedCount } = simulateDaysPassing(days);
    setReports(updatedReports);
    triggerToast("⏩ Simulated +7 Days", `SLA Audit complete: ${warnedCount} authorities warned, ${blacklistedCount} blacklisted for non-concern.`);
  };

  // Handle worthy reward redemption
  const handleClaimReward = (rewardId: string) => {
    const updatedRwd = claimStoredReward(rewardId);
    setRewards(updatedRwd);
    triggerToast("🎁 Reward Unlocked", "Digital voucher generated and stored in your profile.");
  };

  return (
    <div className="min-h-screen bg-[#0F1113] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#2A9D8F] selection:text-white relative overflow-x-hidden">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userPoints={userPoints}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-[#1C1F22] border border-[#2A9D8F] text-[#F1FAEE] px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce max-w-sm">
          <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#2A9D8F]/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-sm text-[#F1FAEE] leading-snug">{toast.title}</h4>
            <p className="text-xs text-[#A8DADC] leading-normal">{toast.desc}</p>
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      <main className="flex-1 flex flex-col">
        {activeTab === "map" && (
          <MapView
            reports={reports}
            onSelectReport={() => {}}
            onUpvote={handleUpvote}
            onOpenReportModal={() => setActiveTab("camera")}
            onReportDuplicate={handleReportDuplicate}
          />
        )}

        {activeTab === "camera" && (
          <CameraReport
            onReportSubmitted={handleReportSubmitted}
            onCancel={() => setActiveTab("map")}
          />
        )}

        {activeTab === "feed" && (
          <ReliefFeed
            reports={reports}
            onUpvote={handleUpvote}
            onSelectReport={() => setActiveTab("map")}
            onUpdateProgress={handleUpdateProgress}
            onSimulateDays={handleSimulateDays}
          />
        )}

        {activeTab === "leaderboard" && (
          <LeaderboardRewards
            leaderboard={leaderboard}
            rewards={rewards}
            userPoints={userPoints}
            onClaimReward={handleClaimReward}
          />
        )}
      </main>

    </div>
  );
}
