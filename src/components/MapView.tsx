import React, { useState } from "react";
import { CivicReport, IssueCategory } from "../types";
import { MapPin, Filter, ThumbsUp, Send, CheckCircle2, AlertTriangle, Clock, ShieldAlert, Sparkles, Navigation, Share2, ExternalLink, Users, AlertCircle } from "lucide-react";

interface MapViewProps {
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
  onUpvote: (reportId: string) => void;
  onOpenReportModal: () => void;
  onReportDuplicate: (reportId: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  reports,
  onSelectReport,
  onUpvote,
  onOpenReportModal,
  onReportDuplicate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeMarker, setActiveMarker] = useState<CivicReport | null>(reports[0] || null);

  const categories: { label: string; val: string; icon: string }[] = [
    { label: "All Hazards", val: "ALL", icon: "🌐" },
    { label: "Roads & Potholes", val: "Roads & Potholes", icon: "🕳️" },
    { label: "Drainage & Flooding", val: "Drainage & Flooding", icon: "🌊" },
    { label: "Streetlights & Power", val: "Streetlights & Power", icon: "💡" },
    { label: "Sanitation & Trash", val: "Sanitation & Trash", icon: "🗑️" }
  ];

  const filteredReports = reports.filter(r => 
    selectedCategory === "ALL" ? true : r.category === selectedCategory
  );

  // Status badge styling helper
  const getStatusColor = (status: CivicReport["status"]) => {
    switch (status) {
      case "Resolved": return { bg: "bg-[#2A9D8F]/20 text-[#2A9D8F] border-[#2A9D8F]/40", dot: "bg-[#2A9D8F]" };
      case "Crew In Progress": return { bg: "bg-[#F4A261]/20 text-[#F4A261] border-[#F4A261]/40", dot: "bg-[#F4A261]" };
      case "Dispatched to Authority": return { bg: "bg-[#A8DADC]/20 text-[#A8DADC] border-[#A8DADC]/40", dot: "bg-[#A8DADC]" };
      default: return { bg: "bg-[#E63946]/20 text-[#E63946] border-[#E63946]/40", dot: "bg-[#E63946]" };
    }
  };

  const getMarkerGlow = (category: IssueCategory, status: CivicReport["status"]) => {
    if (status === "Resolved") return "bg-[#2A9D8F] shadow-[0_0_18px_rgba(42,157,143,0.8)]";
    if (category === "Roads & Potholes") return "bg-[#E63946] shadow-[0_0_18px_rgba(230,57,70,0.8)]";
    if (category === "Drainage & Flooding") return "bg-[#F4A261] shadow-[0_0_18px_rgba(244,162,97,0.8)]";
    return "bg-[#A8DADC] shadow-[0_0_18px_rgba(168,218,220,0.8)]";
  };

  // Convert lat/lng to approximate percentage coordinates for our interactive canvas
  const getPosition = (lat: number, lng: number, index: number) => {
    // Deterministic spread based on index to ensure markers are well spaced on canvas
    const top = 20 + ((index * 23 + 12) % 65);
    const left = 15 + ((index * 37 + 8) % 70);
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] bg-[#0F1113] text-[#E0E0E0] overflow-hidden">
      
      {/* Left / Main: Interactive Dark Map Stage */}
      <section className="flex-1 relative bg-[#121418] border-r border-[#2C2F33] overflow-hidden flex flex-col justify-between">
        
        {/* Background Map Grid & Roads Pattern */}
        <div className="absolute inset-0 opacity-35 pointer-events-none select-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mapGrid" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#2C2F33" strokeWidth="1.5" />
                <circle cx="120" cy="120" r="2" fill="#2C2F33" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />
            {/* Expressive Road Curves */}
            <path d="M -50 200 Q 300 150 500 450 T 1100 380" fill="none" stroke="#1F2124" strokeWidth="48" strokeLinecap="round" />
            <path d="M 200 -50 Q 250 400 650 500 T 700 1000" fill="none" stroke="#1F2124" strokeWidth="36" strokeLinecap="round" />
            <path d="M 800 0 Q 600 300 400 800" fill="none" stroke="#1F2124" strokeWidth="28" strokeLinecap="round" />
          </svg>
        </div>

        {/* Top Overlay Bar: Filter Pills */}
        <div className="relative z-20 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-[#121418]/90 to-transparent">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none max-w-full">
            <span className="text-xs uppercase tracking-widest text-[#8E9299] font-bold mr-1 flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#2A9D8F]" />
              Filter Route:
            </span>
            {categories.map(cat => (
              <button
                key={cat.val}
                onClick={() => setSelectedCategory(cat.val)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedCategory === cat.val
                    ? "bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-md shadow-[#2A9D8F]/30"
                    : "bg-[#1C1F22]/90 text-[#8E9299] border-[#2C2F33] hover:text-[#E0E0E0] hover:border-[#8E9299]"
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C1F22] border border-[#2C2F33] text-xs text-[#A8DADC]">
            <Navigation className="w-3.5 h-3.5 animate-pulse text-[#2A9D8F]" />
            <span>Live Traveler Updates Enabled</span>
          </div>
        </div>

        {/* Map Interactive Pins */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {filteredReports.map((report, idx) => {
            const pos = getPosition(report.lat, report.lng, idx);
            const isSelected = activeMarker?.id === report.id;

            return (
              <div
                key={report.id}
                style={{ top: pos.top, left: pos.left }}
                onClick={() => {
                  setActiveMarker(report);
                  onSelectReport(report);
                }}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Ping animation for active hazards */}
                {report.status !== "Resolved" && (
                  <span className="absolute -inset-1.5 rounded-full animate-ping opacity-40 bg-[#E63946]"></span>
                )}

                {/* Marker Center Dot */}
                <div className={`w-5 h-5 rounded-full border-2 border-[#0F1113] transition-transform duration-200 ${
                  getMarkerGlow(report.category, report.status)
                } ${isSelected ? "scale-135 ring-4 ring-white/30" : "group-hover:scale-125"}`}></div>

                {/* Tooltip Popup */}
                <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#1C1F22] border border-[#2C2F33] px-3 py-2 rounded-xl text-xs shadow-2xl transition-all pointer-events-none ${
                  isSelected ? "opacity-100 translate-y-0 z-30" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                }`}>
                  <div className="font-semibold text-[#F1FAEE] whitespace-nowrap">{report.title}</div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8E9299] mt-0.5">
                    <span className="text-[#A8DADC]">{report.locationName}</span>
                    <span>•</span>
                    <span className="text-[#F4A261]">Sev {report.severity}/10</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Floating Stats & Quick Action */}
        <div className="relative z-20 p-6 flex items-end justify-between bg-gradient-to-t from-[#121418]/95 via-[#121418]/50 to-transparent">
          <div className="flex items-center gap-4">
            <div className="bg-[#1C1F22]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#2C2F33] shadow-lg flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2A9D8F] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2A9D8F]"></span>
              </span>
              <div>
                <span className="text-xs font-bold text-[#F1FAEE] block leading-tight">{reports.length} Active Civic Defects</span>
                <span className="text-[11px] text-[#8E9299]">Traveler Alerts Synchronized</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2A9D8F] to-[#264653] text-white font-semibold text-sm shadow-xl shadow-[#2A9D8F]/25 hover:brightness-110 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-[#A8DADC]" />
            Report Issue Here
          </button>
        </div>

      </section>

      {/* Right Sidebar: Selected Hazard Details Card */}
      <aside className="w-full lg:w-96 sm:w-110 bg-[#16181C] border-l border-[#2C2F33] p-6 flex flex-col overflow-y-auto shrink-0 z-30">
        <div className="flex items-center justify-between pb-4 border-b border-[#2C2F33]">
          <span className="text-xs uppercase tracking-widest text-[#8E9299] font-bold">Commuter Relief Notice</span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#1C1F22] border border-[#2C2F33] text-[#A8DADC]">
            {activeMarker?.trackingNumber || "LIVE-INSPECT"}
          </span>
        </div>

        {activeMarker ? (
          <div className="py-5 space-y-6 flex-1 flex flex-col">
            
            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden aspect-video border border-[#2C2F33] shadow-md group">
              <img
                src={activeMarker.imageUrl}
                alt={activeMarker.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#0F1113]/80 backdrop-blur-md text-xs font-bold text-[#F4A261] border border-[#F4A261]/30">
                Severity {activeMarker.severity}/10
              </div>
            </div>

            {/* Title & Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#264653] text-[#A8DADC] font-medium border border-[#2A9D8F]/30">
                  {activeMarker.category}
                </span>
                {activeMarker.status && (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1.5 ${getStatusColor(activeMarker.status).bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(activeMarker.status).dot}`}></span>
                    {activeMarker.status}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#F1FAEE] tracking-tight">{activeMarker.title}</h2>
              <p className="text-xs text-[#A8DADC] mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2A9D8F]" />
                {activeMarker.locationName}
              </p>
            </div>

            {/* Description */}
            <div className="bg-[#1C1F22] p-4 rounded-xl border border-[#2C2F33]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E9299] mb-1.5">Impact Description</h4>
              <p className="text-sm text-[#E0E0E0] leading-relaxed">{activeMarker.description}</p>
            </div>

            {/* Authority & Action */}
            <div className="space-y-3 pt-2 border-t border-[#2C2F33]/60">
              <div className="flex items-start justify-between text-xs">
                <span className="text-[#8E9299]">Dispatched Authority:</span>
                <span className="font-semibold text-[#F1FAEE] text-right max-w-50">{activeMarker.concernedAuthority}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8E9299]">Authority Contact:</span>
                <span className="font-mono text-[#2A9D8F]">{activeMarker.authorityEmail}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8E9299]">Est. City Fix Timeline:</span>
                <span className="font-semibold text-[#F4A261]">{activeMarker.estimatedDaysToFix} Days</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2C2F33]/40">
                <span className="text-[#8E9299] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#A8DADC]" /> Citizen Reports Count:
                </span>
                <span className="font-bold font-mono text-[#F1FAEE] bg-[#1C1F22] px-2 py-0.5 rounded border border-[#2C2F33]">
                  {activeMarker.duplicateReportsCount || 1} {((activeMarker.duplicateReportsCount || 1) > 1) ? "Citizens" : "Citizen"}
                </span>
              </div>
              {((activeMarker.duplicateReportsCount || 1) > 2 || activeMarker.isEscalated) && (
                <div className="bg-[#E63946]/15 border border-[#E63946] p-2.5 rounded-xl flex items-center gap-2 text-[#E63946] text-xs font-bold animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>🚨 Escalated to Authorities (&gt;2 Citizen Reports!)</span>
                </div>
              )}
            </div>

            {/* Traveler Roadmap Integration & Social Links */}
            <div className="bg-[#121418] p-4 rounded-2xl border border-[#2A9D8F]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F] flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5" /> Traveler Roadmap Link
                </span>
                <span className="text-[10px] text-[#A8DADC] font-mono">LIVE GPS</span>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeMarker.lat},${activeMarker.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-[#2A9D8F] hover:bg-[#264653] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md block text-center"
              >
                <span>🗺️ Open Google Maps Roadmap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div>
                <span className="text-[10px] text-[#8E9299] uppercase font-bold block mb-1.5 flex items-center gap-1">
                  <Share2 className="w-3 h-3" /> Share Roadmap Alert to Social Media:
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {[
                    { name: "WhatsApp", color: "bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-black", url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`🚨 TRAVELER ROADMAP ALERT: Hazard reported at ${activeMarker.locationName} (${activeMarker.title}). Avoid route or view on Google Maps: https://www.google.com/maps/dir/?api=1&destination=${activeMarker.lat},${activeMarker.lng}`)}` },
                    { name: "X / Twitter", color: "bg-white/10 text-white hover:bg-white hover:text-black", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚨 Traveler Roadmap Alert at ${activeMarker.locationName}: ${activeMarker.title}. Detour route on Google Maps:`)}&url=${encodeURIComponent(`https://www.google.com/maps/dir/?api=1&destination=${activeMarker.lat},${activeMarker.lng}`)}` },
                    { name: "Telegram", color: "bg-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc] hover:text-white", url: `https://t.me/share/url?url=${encodeURIComponent(`https://www.google.com/maps/dir/?api=1&destination=${activeMarker.lat},${activeMarker.lng}`)}&text=${encodeURIComponent(`🚨 Traveler Roadmap Detour Alert: ${activeMarker.title} at ${activeMarker.locationName}`)}` },
                    { name: "Facebook", color: "bg-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2] hover:text-white", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.google.com/maps/dir/?api=1&destination=${activeMarker.lat},${activeMarker.lng}`)}` }
                  ].map(soc => (
                    <a
                      key={soc.name}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all border border-white/5 block truncate ${soc.color}`}
                    >
                      {soc.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Upvote & Endorse Action Button */}
            <div className="mt-auto pt-4 space-y-2.5">
              <button
                onClick={() => {
                  onReportDuplicate(activeMarker.id);
                  // Also update local preview marker state
                  setActiveMarker({
                    ...activeMarker,
                    duplicateReportsCount: (activeMarker.duplicateReportsCount || 1) + 1,
                    isEscalated: ((activeMarker.duplicateReportsCount || 1) + 1) > 2
                  });
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F4A261] to-[#E76F51] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#F4A261]/20 cursor-pointer"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Report Same Issue Here (+1 Duplicate)</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => onUpvote(activeMarker.id)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                    activeMarker.hasUserUpvoted
                      ? "bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-lg shadow-[#2A9D8F]/25"
                      : "bg-[#1C1F22] text-[#E0E0E0] border-[#2C2F33] hover:border-[#2A9D8F]"
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${activeMarker.hasUserUpvoted ? "fill-current" : ""}`} />
                  <span>{activeMarker.hasUserUpvoted ? "Endorsed" : "Endorse Hazard"} ({activeMarker.upvotes})</span>
                </button>

                <button
                  onClick={() => alert(`Official Dispatch Tracking #${activeMarker.trackingNumber || "LOG-889"}\n\nNotice delivered to ${activeMarker.authorityEmail}`)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#264653] hover:bg-[#2A9D8F] text-white text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                  title="View Municipal Dispatch Receipt"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#A8DADC]" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#8E9299]">
            <Navigation className="w-10 h-10 mb-3 opacity-30 animate-bounce" />
            <p className="text-sm">Select any pin on the map to inspect location updates and municipal relief progress.</p>
          </div>
        )}
      </aside>

    </div>
  );
};
