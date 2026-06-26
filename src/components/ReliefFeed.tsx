import React, { useState } from "react";
import { CivicReport, IssueCategory } from "../types";
import { ShieldCheck, ThumbsUp, Clock, MapPin, CheckCircle2, AlertTriangle, ExternalLink, Search, Filter, FastForward, AlertCircle, Ban, Wrench, X } from "lucide-react";

interface ReliefFeedProps {
  reports: CivicReport[];
  onUpvote: (reportId: string) => void;
  onSelectReport: (report: CivicReport) => void;
  onUpdateProgress: (reportId: string, status: any, notes: string) => void;
  onSimulateDays: (days: number) => void;
}

export const ReliefFeed: React.FC<ReliefFeedProps> = ({
  reports,
  onUpvote,
  onSelectReport,
  onUpdateProgress,
  onSimulateDays
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activePortalModal, setActivePortalModal] = useState<CivicReport | null>(null);
  const [portalStatus, setPortalStatus] = useState<CivicReport["status"]>("Solution Developing");
  const [portalNotes, setPortalNotes] = useState("");

  const filtered = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.concernedAuthority.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CivicReport["status"]) => {
    switch (status) {
      case "Resolved": return { bg: "bg-[#2A9D8F]/20 text-[#2A9D8F] border-[#2A9D8F]/40", icon: <CheckCircle2 className="w-3.5 h-3.5" /> };
      case "Crew In Progress": return { bg: "bg-[#F4A261]/20 text-[#F4A261] border-[#F4A261]/40", icon: <Clock className="w-3.5 h-3.5" /> };
      default: return { bg: "bg-[#A8DADC]/20 text-[#A8DADC] border-[#A8DADC]/40", icon: <ShieldCheck className="w-3.5 h-3.5" /> };
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0F1113] text-[#E0E0E0] p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Feed Header */}
        <div className="bg-[#16181C] p-6 sm:p-8 rounded-3xl border border-[#2C2F33] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-[#2A9D8F] text-xs uppercase tracking-widest font-bold mb-1">
              <ShieldCheck className="w-4 h-4" /> Official Relief Registry
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F1FAEE] tracking-tight">Community Relief Feed</h2>
            <p className="text-xs sm:text-sm text-[#8E9299] mt-1">Live tracking of municipal authority responses and citizen hazard reports</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
            <button
              onClick={() => onSimulateDays(7)}
              className="px-4 py-2.5 rounded-xl bg-[#F4A261]/20 hover:bg-[#F4A261]/30 text-[#F4A261] border border-[#F4A261]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
              title="Fast-forward 1 week to audit SLA warnings (7 days) and blacklist triggers (10 days)"
            >
              <FastForward className="w-4 h-4" />
              <span>Simulate +7 Days (SLA Check)</span>
            </button>

            <div className="relative min-w-56">
              <Search className="w-4 h-4 text-[#8E9299] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search streets or bureaus..."
                className="w-full bg-[#0F1113] border border-[#2C2F33] pl-10 pr-4 py-2.5 rounded-xl text-xs text-[#F1FAEE] focus:outline-none focus:border-[#2A9D8F]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#0F1113] border border-[#2C2F33] px-3.5 py-2.5 rounded-xl text-xs text-[#A8DADC] font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Dispatched to Authority">Dispatched Notices</option>
              <option value="Crew In Progress">Crew In Progress</option>
              <option value="Resolved">Resolved Issues</option>
            </select>
          </div>
        </div>

        {/* Report Cards List */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map(report => {
              const st = getStatusBadge(report.status);

              return (
                <div
                  key={report.id}
                  className="bg-[#16181C] rounded-3xl border border-[#2C2F33] hover:border-[#2A9D8F]/60 p-6 flex flex-col md:flex-row items-start gap-6 transition-all shadow-lg hover:shadow-2xl hover:shadow-[#2A9D8F]/10 group"
                >
                  {/* Photo Thumbnail */}
                  <div className="w-full md:w-48 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-[#0F1113] shrink-0 border border-[#2C2F33] relative cursor-pointer" onClick={() => onSelectReport(report)}>
                    <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-mono text-[#F4A261] border border-[#F4A261]/30">
                      Sev {report.severity}/10
                    </div>
                  </div>

                  {/* Body Context */}
                  <div className="flex-1 min-w-0 text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#264653] text-[#A8DADC]">
                          {report.category}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${st.bg}`}>
                          {st.icon}
                          {report.status}
                        </span>
                      </div>

                      <span className="text-xs font-mono text-[#8E9299]">
                        Tracking: {report.trackingNumber || "CIVIC-LOG-881"}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-[#F1FAEE] truncate cursor-pointer hover:text-[#2A9D8F]" onClick={() => onSelectReport(report)}>
                      {report.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#8E9299] line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#2C2F33]/60 text-xs">
                      <div className="flex items-center gap-2 text-[#A8DADC]">
                        <MapPin className="w-3.5 h-3.5 text-[#2A9D8F]" />
                        <span>{report.locationName}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[#8E9299]">
                        <span>Authority:</span>
                        <span className="font-medium text-[#F1FAEE]">{report.concernedAuthority}</span>
                      </div>
                    </div>

                    {/* SLA Audit & Authority Progress Section */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#0F1113]/80 p-3 rounded-2xl border border-[#2C2F33]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#8E9299]">SLA Inactive Timer:</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          (report.daysElapsedWithoutAction || 0) >= 10 ? "bg-[#E63946] text-white" :
                          (report.daysElapsedWithoutAction || 0) >= 7 ? "bg-[#F4A261] text-black" :
                          "bg-[#1C1F22] text-[#A8DADC]"
                        }`}>
                          {report.daysElapsedWithoutAction || 0} days
                        </span>
                      </div>

                      {report.authorityBlacklisted ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/50 font-bold flex items-center gap-1.5 text-[11px] animate-pulse">
                          <Ban className="w-3.5 h-3.5" /> Authority Blacklisted (&gt;10 Days No Action!)
                        </span>
                      ) : report.slaWarned ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#F4A261]/20 text-[#F4A261] border border-[#F4A261]/50 font-bold flex items-center gap-1.5 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> SLA Warning: 1 Week Elapsed!
                        </span>
                      ) : null}

                      {report.authorityProgressNotes && (
                        <div className="w-full text-[11px] text-[#A8DADC] bg-[#264653]/40 p-2 rounded-xl border border-[#2A9D8F]/30 italic">
                          💡 Authority Progress: "{report.authorityProgressNotes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex md:flex-col items-center justify-end gap-2.5 w-full md:w-44 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#2C2F33]">
                    <button
                      onClick={() => {
                        setActivePortalModal(report);
                        setPortalStatus(report.status || "Solution Developing");
                        setPortalNotes(report.authorityProgressNotes || "");
                      }}
                      className="py-2 px-3 rounded-xl bg-[#2A9D8F]/15 hover:bg-[#2A9D8F]/25 text-[#2A9D8F] border border-[#2A9D8F]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
                    >
                      <Wrench className="w-3.5 h-3.5 shrink-0" />
                      <span>Mark Progress</span>
                    </button>

                    <button
                      onClick={() => onUpvote(report.id)}
                      className={`flex-1 md:w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                        report.hasUserUpvoted
                          ? "bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-md shadow-[#2A9D8F]/20"
                          : "bg-[#1C1F22] text-[#E0E0E0] border-[#2C2F33] hover:border-[#2A9D8F]"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${report.hasUserUpvoted ? "fill-current" : ""}`} />
                      <span>{report.upvotes} Endorse</span>
                    </button>

                    <button
                      onClick={() => onSelectReport(report)}
                      className="py-2.5 px-4 rounded-xl bg-[#1C1F22] hover:bg-[#264653] text-[#A8DADC] hover:text-white border border-[#2C2F33] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full"
                    >
                      <span>View Notice</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="bg-[#16181C] p-12 rounded-3xl border border-[#2C2F33] text-center text-[#8E9299] space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm">No community relief reports matched your query.</p>
            </div>
          )}
        </div>

        {/* Authority Portal Progress Marking Modal */}
        {activePortalModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#16181C] border border-[#2A9D8F] rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-left">
              <button
                onClick={() => setActivePortalModal(null)}
                className="absolute top-5 right-5 text-[#8E9299] hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2A9D8F]/20 border border-[#2A9D8F]/40 flex items-center justify-center text-[#2A9D8F]">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#2A9D8F] font-bold">Authority Action Portal</span>
                  <h3 className="text-xl font-bold text-[#F1FAEE]">Update Solution Progress</h3>
                </div>
              </div>

              <div className="bg-[#0F1113] p-3.5 rounded-2xl border border-[#2C2F33] text-xs space-y-1">
                <span className="text-[#8E9299]">Concerned Report:</span>
                <p className="font-bold text-[#F1FAEE] truncate">{activePortalModal.title}</p>
                <span className="text-[11px] text-[#A8DADC] font-mono block">Bureau: {activePortalModal.concernedAuthority}</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#8E9299] uppercase text-[10px] block mb-1.5">Select Current Progress Phase:</label>
                  <select
                    value={portalStatus}
                    onChange={e => setPortalStatus(e.target.value as any)}
                    className="w-full bg-[#0F1113] border border-[#2C2F33] rounded-xl px-4 py-3 text-xs text-[#F1FAEE] font-semibold focus:outline-none focus:border-[#2A9D8F] cursor-pointer"
                  >
                    <option value="Solution Developing">Solution Developing (Engineering / Survey)</option>
                    <option value="Investigating Issue">Investigating Issue (In Field)</option>
                    <option value="Crew In Progress">Crew In Progress (Active Repair)</option>
                    <option value="Resolved">Resolved & Closed</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#8E9299] uppercase text-[10px] block mb-1.5">Public Progress Notes / Actions Taken:</label>
                  <textarea
                    rows={3}
                    value={portalNotes}
                    onChange={e => setPortalNotes(e.target.value)}
                    placeholder="E.g., Asphalt mix ordered. Field crew arriving tomorrow morning at 8 AM..."
                    className="w-full bg-[#0F1113] border border-[#2C2F33] rounded-xl p-3.5 text-xs text-[#F1FAEE] focus:outline-none focus:border-[#2A9D8F] leading-relaxed"
                  />
                  <span className="text-[10px] text-[#8E9299] mt-1 block">Saving progress resets citizen SLA delay timer and clears 7-day warnings.</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setActivePortalModal(null)}
                  className="flex-1 py-3 rounded-xl bg-[#1C1F22] hover:bg-[#2C2F33] text-[#8E9299] hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onUpdateProgress(activePortalModal.id, portalStatus, portalNotes || "Progress updated by municipal division.");
                    setActivePortalModal(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-[#2A9D8F] hover:bg-[#264653] text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-[#2A9D8F]/25"
                >
                  Save Progress
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
