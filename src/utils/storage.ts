import { CivicReport, LeaderboardUser, RewardItem, BlacklistedAuthority, ReportStatus } from "../types";
import { INITIAL_REPORTS, INITIAL_LEADERBOARD, WORTHY_REWARDS, INITIAL_BLACKLIST } from "../data/mockData";

const STORAGE_KEYS = {
  REPORTS: "civic_pulse_reports_v1",
  USER_POINTS: "civic_pulse_points_v1",
  LEADERBOARD: "civic_pulse_leaderboard_v1",
  REWARDS: "civic_pulse_rewards_v1",
  BLACKLIST: "civic_pulse_blacklist_v1"
};

export function getStoredReports(): CivicReport[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Storage error:", e);
  }
  return INITIAL_REPORTS;
}

export function saveNewReport(report: CivicReport): CivicReport[] {
  const current = getStoredReports();
  const updated = [report, ...current];
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  } catch (e) {
    console.error("Storage error:", e);
  }
  return updated;
}

export function updateReportStatus(reportId: string, status: CivicReport["status"], trackingNumber?: string): CivicReport[] {
  const current = getStoredReports();
  const updated = current.map(r => {
    if (r.id === reportId) {
      return { 
        ...r, 
        status, 
        daysElapsedWithoutAction: 0, // Reset timer when status changes
        ...(trackingNumber ? { trackingNumber } : {}) 
      };
    }
    return r;
  });
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export function upvoteReport(reportId: string): CivicReport[] {
  const current = getStoredReports();
  const updated = current.map(r => {
    if (r.id === reportId) {
      const isUp = !r.hasUserUpvoted;
      return {
        ...r,
        hasUserUpvoted: isUp,
        upvotes: isUp ? r.upvotes + 1 : Math.max(0, r.upvotes - 1)
      };
    }
    return r;
  });
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export function getStoredBlacklist(): BlacklistedAuthority[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BLACKLIST);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return INITIAL_BLACKLIST;
}

export function addAuthorityToBlacklist(deptName: string, email: string, reason: string): BlacklistedAuthority[] {
  const current = getStoredBlacklist();
  if (current.some(b => b.email === email)) return current;

  const newEntry: BlacklistedAuthority = {
    id: `blk-${Date.now()}`,
    departmentName: deptName,
    email: email,
    reason: reason,
    blacklistedAt: new Date().toISOString(),
    unresolvedReports: 1
  };
  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

// User reports duplicate same location issue
export function reportSameLocationIssue(reportId: string): { updated: CivicReport[]; escalated: boolean } {
  const current = getStoredReports();
  let escalated = false;

  const updated = current.map(r => {
    if (r.id === reportId) {
      const newCount = (r.duplicateReportsCount || 1) + 1;
      // "more than 2 people report the same location issue" -> count > 2 (i.e. >= 3)
      const shouldEscalate = newCount > 2;
      if (shouldEscalate && !r.isEscalated) {
        escalated = true;
      }
      return {
        ...r,
        duplicateReportsCount: newCount,
        isEscalated: shouldEscalate ? true : r.isEscalated,
        status: shouldEscalate && (r.status === "No Action Taken" || r.status === "AI Verified") 
          ? "Dispatched to Authority" : r.status
      };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  } catch (e) {}

  return { updated, escalated };
}

// Authority marks progress in developing solution
export function updateAuthorityProgress(reportId: string, status: ReportStatus, notes: string): CivicReport[] {
  const current = getStoredReports();
  const updated = current.map(r => {
    if (r.id === reportId) {
      return {
        ...r,
        status,
        authorityProgressNotes: notes,
        daysElapsedWithoutAction: 0, // Action taken, reset SLA delay timer
        slaWarned: false
      };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  } catch (e) {}

  return updated;
}

// Simulate days passing & enforce 7-day warning + blacklist SLA
export function simulateDaysPassing(daysToAdd: number): { 
  updatedReports: CivicReport[]; 
  updatedBlacklist: BlacklistedAuthority[]; 
  warnedCount: number; 
  blacklistedCount: number; 
} {
  const reports = getStoredReports();
  let blacklist = getStoredBlacklist();
  let warnedCount = 0;
  let blacklistedCount = 0;

  const updatedReports = reports.map(r => {
    // If already resolved or crew in progress, don't penalize
    if (r.status === "Resolved" || r.status === "Crew In Progress" || r.status === "Solution Developing") {
      return r;
    }

    const newDays = (r.daysElapsedWithoutAction || 0) + daysToAdd;
    let isWarned = r.slaWarned || false;
    let isBlacklisted = r.authorityBlacklisted || false;

    // Check 1 week (7 days) rule
    if (newDays >= 7 && !isWarned) {
      isWarned = true;
      warnedCount++;
    }

    // Check post-warning non-concern (>= 10 days)
    if (newDays >= 10 && !isBlacklisted) {
      isBlacklisted = true;
      blacklistedCount++;
      
      // Add to blacklist
      if (!blacklist.some(b => b.email === r.authorityEmail)) {
        blacklist = [
          {
            id: `blk-${Date.now()}-${Math.random()}`,
            departmentName: r.concernedAuthority,
            email: r.authorityEmail,
            reason: `Ignored citizen hazard report "${r.title}" for ${newDays} days with zero action.`,
            blacklistedAt: new Date().toISOString(),
            unresolvedReports: (r.duplicateReportsCount || 1)
          },
          ...blacklist
        ];
      }
    }

    return {
      ...r,
      daysElapsedWithoutAction: newDays,
      slaWarned: isWarned,
      authorityBlacklisted: isBlacklisted
    };
  });

  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updatedReports));
    localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(blacklist));
  } catch (e) {}

  return { updatedReports, updatedBlacklist: blacklist, warnedCount, blacklistedCount };
}

export function getUserPoints(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_POINTS);
    if (stored) return parseInt(stored, 10);
  } catch (e) {}
  return 980;
}

export function addPoints(pts: number): number {
  const current = getUserPoints();
  const updated = current + pts;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_POINTS, updated.toString());
  } catch (e) {}
  return updated;
}

export function getStoredRewards(): RewardItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REWARDS);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return WORTHY_REWARDS;
}

export function claimStoredReward(rewardId: string): RewardItem[] {
  const current = getStoredRewards();
  const updated = current.map(r => {
    if (r.id === rewardId) {
      return { ...r, claimed: true, voucherCode: r.voucherCode || `CLAIMED-${Math.floor(1000 + Math.random() * 9000)}` };
    }
    return r;
  });
  try {
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export function getLeaderboard(): LeaderboardUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return INITIAL_LEADERBOARD;
}

export function updateLeaderboardPoints(currentUserPoints: number): LeaderboardUser[] {
  const lb = getLeaderboard();
  const updated = lb.map(u => {
    if (u.isCurrentUser) {
      return {
        ...u,
        points: currentUserPoints,
        reportsCount: u.reportsCount + 1
      };
    }
    return u;
  }).sort((a, b) => b.points - a.points).map((item, idx) => ({ ...item, rank: idx + 1 }));
  
  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}
