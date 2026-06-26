import { CivicReport, LeaderboardUser, RewardItem, PresetSample, BlacklistedAuthority } from "../types";

export const INITIAL_REPORTS: CivicReport[] = [
  {
    id: "rep-101",
    title: "Deep Asphalt Pothole on Market St",
    category: "Roads & Potholes",
    description: "Large 4-inch deep crater in the right transit lane causing vehicle wheel damage and severe hazard for cyclists.",
    severity: 8,
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    lat: 37.7751,
    lng: -122.4195,
    locationName: "Market St & 8th Ave Corridor",
    concernedAuthority: "Department of Transportation & Roadway Maintenance",
    authorityEmail: "roads.dispatch@citygov.org",
    draftMessage: "Dear Municipal Roads Division,\n\nWe urgently report a severe asphalt pothole defect located at Market St & 8th Ave (Lat: 37.7751, Lng: -122.4195). The defect poses immediate safety hazards to public transit and cyclists. Severity rating: 8/10. Please dispatch emergency road patching crews.\n\nSincerely,\nCivicPulse Automated Citizen Network",
    status: "Solution Developing",
    trackingNumber: "CIVIC-2026-88219",
    upvotes: 42,
    reporterName: "Sarah Jenkins",
    reporterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-06-25T14:20:00Z",
    estimatedDaysToFix: 3,
    duplicateReportsCount: 4,
    isEscalated: true,
    daysElapsedWithoutAction: 2,
    authorityProgressNotes: "Survey crew assigned; asphalt mix scheduled for delivery tomorrow morning."
  },
  {
    id: "rep-102",
    title: "Clogged Storm Drain Overflow",
    category: "Drainage & Flooding",
    description: "Storm drainage grate is completely blocked by accumulated organic debris and plastic waste, causing stagnant water pooling across pedestrian crossing.",
    severity: 7,
    imageUrl: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=800&q=80",
    lat: 37.7782,
    lng: -122.4141,
    locationName: "Mission St & 5th Ave",
    concernedAuthority: "Municipal Water & Sanitation Bureau",
    authorityEmail: "drainage@citygov.org",
    draftMessage: "Dear Water & Sanitation Bureau,\n\nNotice is hereby served regarding a blocked storm drainage inlet at Mission St & 5th Ave. Standing water creates slipping hazards and mosquito breeding grounds. Request prompt hydro-jetting and clearing.\n\nCivicPulse Automated Citizen Network",
    status: "Crew In Progress",
    trackingNumber: "CIVIC-2026-74102",
    upvotes: 29,
    reporterName: "David Chen",
    reporterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-06-20T09:15:00Z",
    estimatedDaysToFix: 2,
    duplicateReportsCount: 1,
    daysElapsedWithoutAction: 1,
    authorityProgressNotes: "Hydro-cleaning crew actively clearing debris from main junction."
  },
  {
    id: "rep-103",
    title: "Flickering Streetlight Fixture",
    category: "Streetlights & Power",
    description: "Overhead LED street luminaire is continuously strobing off and on, leaving the sidewalk dark at night and creating pedestrian security concerns.",
    severity: 6,
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    lat: 37.7715,
    lng: -122.4239,
    locationName: "Valencia St & 16th Ave",
    concernedAuthority: "City Power & Lighting Commission",
    authorityEmail: "lighting@citygov.org",
    draftMessage: "Dear Lighting Commission,\n\nPlease inspect luminaire pole #402 at Valencia St & 16th Ave due to intermittent ballast/LED failure. Dark zones impact neighborhood walkability and nighttime safety.\n\nCivicPulse Automated Citizen Network",
    status: "No Action Taken",
    upvotes: 18,
    reporterName: "Elena Rostova",
    reporterAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-06-18T21:40:00Z",
    estimatedDaysToFix: 5,
    duplicateReportsCount: 2,
    daysElapsedWithoutAction: 8,
    slaWarned: true
  },
  {
    id: "rep-105",
    title: "Collapsed Sidewalk & Exposed Rebar",
    category: "Public Hazard",
    description: "Severe sidewalk collapse exposing rusted metal reinforcing bars. Multiple pedestrians tripped over the past two weeks.",
    severity: 9,
    imageUrl: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=800&q=80",
    lat: 37.7801,
    lng: -122.4112,
    locationName: "Howard St & 6th Ave",
    concernedAuthority: "Bureau of Street Infrastructure & Repairs",
    authorityEmail: "sidewalks.ignore@citygov.org",
    draftMessage: "URGENT SAFETY HAZARD NOTICE: Collapsed concrete sidewalk at Howard St & 6th Ave.",
    status: "No Action Taken",
    trackingNumber: "CIVIC-2026-10924",
    upvotes: 64,
    reporterName: "Marcus Vance",
    reporterAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-06-14T10:00:00Z",
    estimatedDaysToFix: 7,
    duplicateReportsCount: 5,
    isEscalated: true,
    daysElapsedWithoutAction: 12,
    slaWarned: true,
    authorityBlacklisted: true
  },
  {
    id: "rep-104",
    title: "Overflowing Public Refuse Container",
    category: "Sanitation & Trash",
    description: "Municipal trash receptacle is filled beyond capacity with scattered windblown packaging littering the adjacent bus stop seating area.",
    severity: 5,
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    lat: 37.7821,
    lng: -122.4089,
    locationName: "Union Square North Transit Hub",
    concernedAuthority: "Bureau of Solid Waste Management",
    authorityEmail: "sanitation@citygov.org",
    draftMessage: "Dear Solid Waste Bureau,\n\nPublic container at Union Square North requires emergency dispatch collection and scheduled route frequency adjustment due to excessive overflow.\n\nCivicPulse Automated Citizen Network",
    status: "Resolved",
    trackingNumber: "CIVIC-2026-61900",
    upvotes: 35,
    reporterName: "Marcus Vance",
    reporterAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    createdAt: "2026-06-23T11:10:00Z",
    estimatedDaysToFix: 1,
    duplicateReportsCount: 3,
    daysElapsedWithoutAction: 0,
    authorityProgressNotes: "Extra refuse bin installed and daily collection route added."
  }
];

export const INITIAL_BLACKLIST: BlacklistedAuthority[] = [
  {
    id: "blk-1",
    departmentName: "Bureau of Street Infrastructure & Repairs",
    email: "sidewalks.ignore@citygov.org",
    reason: "Failed to respond or mark progress on 12+ day escalated hazard (Collapsed Sidewalk on Howard St) after SLA 7-day warning.",
    blacklistedAt: "2026-06-24T18:30:00Z",
    unresolvedReports: 14
  },
  {
    id: "blk-2",
    departmentName: "District 2 Municipal Sewerage Inspectorate",
    email: "sewer.dist2@citygov.org",
    reason: "Ignored 4 consecutive automated relief notices and 14 days elapsed without field survey.",
    blacklistedAt: "2026-06-21T09:00:00Z",
    unresolvedReports: 8
  }
];

export const PRESET_TEST_SAMPLES: PresetSample[] = [
  {
    id: "pst-1",
    title: "Cracked Asphalt Road Pothole",
    category: "Roads & Potholes",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    locationName: "Pine St & Montgomery Ave",
    lat: 37.7912,
    lng: -122.4035
  },
  {
    id: "pst-2",
    title: "Clogged Drainage Grate Debris",
    category: "Drainage & Flooding",
    imageUrl: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=800&q=80",
    locationName: "Howard St & 3rd St",
    lat: 37.7854,
    lng: -122.3991
  },
  {
    id: "pst-3",
    title: "Overhead Streetlight Lamp Outage",
    category: "Streetlights & Power",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    locationName: "Geary Blvd & Laguna St",
    lat: 37.7858,
    lng: -122.4298
  },
  {
    id: "pst-4",
    title: "Litter & Overflowing Sidewalk Bin",
    category: "Sanitation & Trash",
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    locationName: "Embarcadero Plaza North",
    lat: 37.7955,
    lng: -122.3937
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  {
    rank: 1,
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    points: 1450,
    reportsCount: 24,
    verifiedCount: 89,
    badge: "👑 Grand Civic Champion"
  },
  {
    rank: 2,
    name: "David Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    points: 1210,
    reportsCount: 19,
    verifiedCount: 71,
    badge: "🛡️ Master City Protector"
  },
  {
    rank: 3,
    name: "Bhakti Goel (You)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    points: 980,
    reportsCount: 14,
    verifiedCount: 52,
    badge: "⭐ Senior Civic Guardian",
    isCurrentUser: true
  },
  {
    rank: 4,
    name: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    points: 840,
    reportsCount: 12,
    verifiedCount: 40,
    badge: "🌿 Community Catalyst"
  },
  {
    rank: 5,
    name: "Aisha Al-Mansoor",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    points: 720,
    reportsCount: 10,
    verifiedCount: 38,
    badge: "🔍 Active Scout"
  }
];

export const WORTHY_REWARDS: RewardItem[] = [
  {
    id: "rwd-1",
    title: "$100 Municipal Transit Pass Voucher",
    sponsor: "City Department of Transportation",
    requiredPoints: 900,
    requiredRankLevel: 3,
    description: "Redeemable for 1 month of unlimited municipal subway, bus, and light rail rides across the metropolitan district.",
    icon: "🚆",
    claimed: false,
    voucherCode: "TRANSIT-PULSE-100X"
  },
  {
    id: "rwd-2",
    title: "$50 Municipal Property Tax / Utility Credit",
    sponsor: "City Revenue & Treasury Office",
    requiredPoints: 800,
    requiredRankLevel: 3,
    description: "Direct credit applied against quarterly municipal water/waste utility bills or municipal property assessments.",
    icon: "🏛️",
    claimed: false,
    voucherCode: "TAXREBATE-50-CIVIC"
  },
  {
    id: "rwd-3",
    title: "Annual Botanical Gardens VIP Pass",
    sponsor: "Metropolitan Parks Foundation",
    requiredPoints: 500,
    requiredRankLevel: 2,
    description: "Free unlimited admission for 2 adults and 2 children to all city botanical gardens and conservatory greenhouses.",
    icon: "🌸",
    claimed: false
  },
  {
    id: "rwd-4",
    title: "$25 Eco-Café & Local Farmers Market Gift Card",
    sponsor: "Green City Merchants Guild",
    requiredPoints: 300,
    requiredRankLevel: 1,
    description: "Valid at 40+ participating sustainable organic coffee shops and weekend farmers market stalls.",
    icon: "☕",
    claimed: false
  }
];
