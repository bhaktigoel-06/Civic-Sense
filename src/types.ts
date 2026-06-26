export type IssueCategory = 
  | "Roads & Potholes"
  | "Drainage & Flooding"
  | "Sanitation & Trash"
  | "Streetlights & Power"
  | "Parks & Trees"
  | "Public Hazard";

export type ReportStatus = 
  | "No Action Taken"
  | "AI Verified"
  | "Dispatched to Authority"
  | "Investigating Issue"
  | "Solution Developing"
  | "Crew In Progress"
  | "Resolved";

export interface CivicReport {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  severity: number; // 1 - 10
  imageUrl: string;
  lat: number;
  lng: number;
  locationName: string;
  concernedAuthority: string;
  authorityEmail: string;
  draftMessage: string;
  status: ReportStatus;
  trackingNumber?: string;
  upvotes: number;
  hasUserUpvoted?: boolean;
  reporterName: string;
  reporterAvatar: string;
  createdAt: string;
  estimatedDaysToFix: number;
  
  // New features for Roadmap & SLA Blacklist
  duplicateReportsCount: number; // Triggers escalation when > 2
  isEscalated?: boolean;
  daysElapsedWithoutAction: number; // Triggers warning at >= 7, blacklist at >= 10
  slaWarned?: boolean;
  authorityBlacklisted?: boolean;
  authorityProgressNotes?: string;
}

export interface BlacklistedAuthority {
  id: string;
  departmentName: string;
  email: string;
  reason: string;
  blacklistedAt: string;
  unresolvedReports: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  points: number;
  reportsSubmitted: number;
  issuesVerified: number;
  rankTitle: string;
  rankLevel: number;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  reportsCount: number;
  verifiedCount: number;
  badge: string;
  isCurrentUser?: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  sponsor: string;
  requiredPoints: number;
  requiredRankLevel: number;
  description: string;
  icon: string;
  claimed: boolean;
  voucherCode?: string;
}

export interface PresetSample {
  id: string;
  title: string;
  category: IssueCategory;
  imageUrl: string;
  locationName: string;
  lat: number;
  lng: number;
}
