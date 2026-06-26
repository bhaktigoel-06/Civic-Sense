import React, { useState, useRef, useEffect } from "react";
import { IssueCategory, CivicReport } from "../types";
import { PRESET_TEST_SAMPLES } from "../data/mockData";
import { Camera, Upload, RefreshCw, Send, CheckCircle2, AlertCircle, Sparkles, MapPin, ShieldCheck, Award, FileText, ArrowRight, X } from "lucide-react";

interface CameraReportProps {
  onReportSubmitted: (newReport: CivicReport, earnedPoints: number) => void;
  onCancel: () => void;
}

export const CameraReport: React.FC<CameraReportProps> = ({ onReportSubmitted, onCancel }) => {
  const [captureMode, setCaptureMode] = useState<"camera" | "upload" | "presets">("presets");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>("Downtown Transit Corridor, Sector 4");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 37.7849, lng: -122.4094 });

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // Dispatch State
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<any | null>(null);

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Start Camera if tab is selected
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (captureMode === "camera") {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setCameraActive(true);
          }
        })
        .catch(err => {
          console.warn("Webcam access restricted in sandbox iframe:", err);
          setAnalysisError("Camera access restricted in iframe preview. Please switch to Presets or File Upload.");
          setCaptureMode("presets");
        });
    } else {
      if (videoRef.current?.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach(t => t.stop());
      }
      setCameraActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [captureMode]);

  // Capture photo from live webcam
  const handleTakeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const vid = videoRef.current;
      const can = canvasRef.current;
      can.width = vid.videoWidth || 640;
      can.height = vid.videoHeight || 480;
      const ctx = can.getContext("2d");
      if (ctx) {
        ctx.drawImage(vid, 0, 0, can.width, can.height);
        const dataUrl = can.toDataURL("image/jpeg", 0.85);
        setSelectedImage(dataUrl);
        analyzeImagePayload(dataUrl, "Live Camera Snapshot");
      }
    }
  };

  // Handle manual file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setSelectedImage(result);
        analyzeImagePayload(result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: typeof PRESET_TEST_SAMPLES[0]) => {
    setSelectedImage(preset.imageUrl);
    setLocationName(preset.locationName);
    setCoords({ lat: preset.lat, lng: preset.lng });
    analyzeImagePayload(preset.imageUrl, preset.title);
  };

  // Fetch image base64 if it's an external URL (for presets)
  async function getBase64FromUrl(url: string): Promise<string> {
    if (url.startsWith("data:")) return url;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return url; // fallback
    }
  }

  // Send photo to backend AI endpoint
  const analyzeImagePayload = async (imgData: string, locCtx: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAiResult(null);

    try {
      const base64Str = await getBase64FromUrl(imgData);

      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Str,
          mimeType: "image/jpeg",
          lat: coords.lat,
          lng: coords.lng,
          locationName: locationName || locCtx
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to identify civic defect.");
      }

      setAiResult(data.data);
    } catch (err: any) {
      console.error("AI Evaluation failed:", err);
      setAnalysisError(err.message || "Could not analyze image. Please try another photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Dispatch notice to official department
  const handleConfirmDispatch = async () => {
    if (!aiResult || !selectedImage) return;

    setIsDispatching(true);
    try {
      const res = await fetch("/api/dispatch-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aiResult.title,
          concernedAuthority: aiResult.concernedAuthority,
          authorityEmail: aiResult.authorityEmail
        })
      });

      const dispData = await res.json();
      setDispatchSuccess(dispData);

      // Create new report object for map sync
      const newRep: CivicReport = {
        id: `rep-${Date.now().toString().slice(-5)}`,
        title: aiResult.title,
        category: (aiResult.category as IssueCategory) || "Roads & Potholes",
        description: aiResult.description,
        severity: aiResult.severity || 6,
        imageUrl: selectedImage,
        lat: coords.lat,
        lng: coords.lng,
        locationName,
        concernedAuthority: aiResult.concernedAuthority,
        authorityEmail: aiResult.authorityEmail,
        draftMessage: aiResult.draftMessage,
        status: "Dispatched to Authority",
        trackingNumber: dispData.trackingNumber,
        upvotes: 1,
        hasUserUpvoted: true,
        reporterName: "Bhakti Goel (You)",
        reporterAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        createdAt: new Date().toISOString(),
        estimatedDaysToFix: aiResult.estimatedDaysToFix || 4,
        duplicateReportsCount: 1,
        daysElapsedWithoutAction: 0
      };

      // Calculate worthy reward points based on severity
      const earnedPts = 50 + (aiResult.severity || 5) * 10;

      setTimeout(() => {
        onReportSubmitted(newRep, earnedPts);
      }, 2400);

    } catch (e: any) {
      setAnalysisError("Failed to dispatch official letter. Please try again.");
      setIsDispatching(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAiResult(null);
    setAnalysisError(null);
    setDispatchSuccess(null);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0F1113] text-[#E0E0E0] p-4 sm:p-8 flex justify-center items-start overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#16181C] rounded-3xl border border-[#2C2F33] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="p-6 bg-[#121418] border-b border-[#2C2F33] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] flex items-center justify-center text-white shadow-lg shadow-[#2A9D8F]/25">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F1FAEE] tracking-tight">AI Civic Issue Reporter</h2>
              <p className="text-xs text-[#8E9299]">Automatic Location & Authority Relief Dispatcher</p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-[#1C1F22] border border-[#2C2F33] text-[#8E9299] hover:text-[#F1FAEE] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* STEP 1: Capture Mode Selector or Active Capture */}
          {!selectedImage && (
            <div className="space-y-6">
              
              {/* Tab Pills */}
              <div className="flex p-1.5 bg-[#0F1113] rounded-2xl border border-[#2C2F33] max-w-md mx-auto">
                <button
                  onClick={() => setCaptureMode("presets")}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    captureMode === "presets" ? "bg-[#2A9D8F] text-white shadow-md" : "text-[#8E9299] hover:text-[#E0E0E0]"
                  }`}
                >
                  ⚡ One-Click Presets
                </button>
                <button
                  onClick={() => setCaptureMode("upload")}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    captureMode === "upload" ? "bg-[#2A9D8F] text-white shadow-md" : "text-[#8E9299] hover:text-[#E0E0E0]"
                  }`}
                >
                  📁 File Upload
                </button>
                <button
                  onClick={() => setCaptureMode("camera")}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    captureMode === "camera" ? "bg-[#2A9D8F] text-white shadow-md" : "text-[#8E9299] hover:text-[#E0E0E0]"
                  }`}
                >
                  📸 Live Camera
                </button>
              </div>

              {/* Mode Content */}
              {captureMode === "presets" && (
                <div>
                  <div className="text-center mb-4">
                    <span className="text-xs uppercase tracking-widest text-[#A8DADC] font-bold">Select Sample Community Problem</span>
                    <p className="text-xs text-[#8E9299] mt-1">Simulate instant camera photo capture in preview sandbox</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PRESET_TEST_SAMPLES.map(pst => (
                      <div
                        key={pst.id}
                        onClick={() => handleSelectPreset(pst)}
                        className="group bg-[#1C1F22] rounded-2xl border border-[#2C2F33] hover:border-[#2A9D8F] p-4 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] shadow-md hover:shadow-[#2A9D8F]/15"
                      >
                        <img src={pst.imageUrl} alt={pst.title} className="w-16 h-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0 text-left">
                          <span className="text-[10px] uppercase font-bold text-[#2A9D8F] bg-[#2A9D8F]/10 px-2 py-0.5 rounded-md">{pst.category}</span>
                          <h4 className="font-semibold text-sm text-[#F1FAEE] truncate mt-1">{pst.title}</h4>
                          <p className="text-[11px] text-[#8E9299] truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#2A9D8F]" />
                            {pst.locationName}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#8E9299] group-hover:text-[#2A9D8F] group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {captureMode === "upload" && (
                <label className="w-full aspect-[16/9] bg-[#0F1113] rounded-3xl border-2 border-dashed border-[#2C2F33] hover:border-[#2A9D8F] flex flex-col items-center justify-center text-center p-8 cursor-pointer group transition-all shadow-inner">
                  <div className="w-16 h-16 bg-[#1C1F22] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#2A9D8F] transition-colors shadow-lg">
                    <Upload className="w-8 h-8 text-[#A8DADC] group-hover:text-white" />
                  </div>
                  <h3 className="text-[#F1FAEE] font-semibold text-lg">Click or Drag Photo of Civic Defect</h3>
                  <p className="text-[#8E9299] text-xs mt-1.5 max-w-sm">Supports high-res road potholes, drainage clogs, trash heaps, or streetlight damage (JPG, PNG)</p>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}

              {captureMode === "camera" && (
                <div className="flex flex-col items-center bg-[#0F1113] rounded-3xl border border-[#2C2F33] p-4 sm:p-6 overflow-hidden">
                  <div className="relative w-full max-w-xl aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-[#2C2F33] mb-4 shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    {!cameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[#8E9299] p-6 text-center bg-[#121418]">
                        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#2A9D8F]" />
                        <p className="text-sm">Initializing camera stream...</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleTakeSnapshot}
                    disabled={!cameraActive}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#2A9D8F] to-[#264653] text-white font-bold text-sm shadow-xl shadow-[#2A9D8F]/30 hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
                  >
                    📸 Capture Issue Snapshot
                  </button>
                </div>
              )}

              {/* Location Override Option */}
              <div className="pt-4 border-t border-[#2C2F33] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs bg-[#121418] p-4 rounded-2xl border border-[#2C2F33]">
                <div className="flex items-center gap-2 text-[#A8DADC]">
                  <MapPin className="w-4 h-4 text-[#2A9D8F]" />
                  <span className="font-semibold">Detected GPS Location:</span>
                </div>
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  className="bg-[#1C1F22] border border-[#2C2F33] px-3.5 py-2 rounded-xl text-[#F1FAEE] text-xs font-medium w-full sm:w-80 focus:outline-none focus:border-[#2A9D8F]"
                  placeholder="Enter street or neighborhood name..."
                />
              </div>

            </div>
          )}

          {/* STEP 2: AI Analyzing Loading Screen */}
          {selectedImage && isAnalyzing && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-[#2C2F33]"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[#2A9D8F] border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#A8DADC] animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#F1FAEE]">AI Vision Evaluating Defect</h3>
                <p className="text-xs text-[#A8DADC] max-w-md mx-auto">
                  Identifying problem category, assessing severity rating, pinpointing coordinates, and formatting official municipal relief notice...
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {analysisError && (
            <div className="p-4 rounded-2xl bg-[#E63946]/15 border border-[#E63946]/40 text-[#F1FAEE] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-[#E63946] shrink-0" />
                <span>{analysisError}</span>
              </div>
              <button onClick={handleReset} className="px-3 py-1 rounded-lg bg-[#1C1F22] text-xs font-semibold hover:bg-[#2C2F33] cursor-pointer shrink-0">
                Retry
              </button>
            </div>
          )}

          {/* STEP 3: AI Results Review & Dispatch Confirmation */}
          {selectedImage && !isAnalyzing && aiResult && !dispatchSuccess && (
            <div className="space-y-8 animate-fadeIn">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Captured Photo Preview */}
                <div className="md:col-span-1 rounded-2xl overflow-hidden border border-[#2C2F33] aspect-square bg-[#0F1113] relative group shadow-lg">
                  <img src={selectedImage} alt="Civic Defect" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    onClick={handleReset}
                    className="absolute bottom-3 left-3 right-3 py-2 rounded-xl bg-[#1C1F22]/90 backdrop-blur-md text-xs font-semibold text-[#8E9299] hover:text-[#F1FAEE] border border-[#2C2F33] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retake Photo
                  </button>
                </div>

                {/* AI Structured Findings */}
                <div className="md:col-span-2 space-y-4 text-left flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-[#2A9D8F]/20 text-[#2A9D8F] font-bold border border-[#2A9D8F]/30">
                        {aiResult.category}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-[#F4A261]/20 text-[#F4A261] font-bold border border-[#F4A261]/40">
                        Severity {aiResult.severity}/10
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#F1FAEE]">{aiResult.title}</h3>
                    <p className="text-xs text-[#A8DADC] mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#2A9D8F]" /> {locationName}
                    </p>
                  </div>

                  <div className="bg-[#1C1F22] p-4 rounded-2xl border border-[#2C2F33] space-y-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#8E9299] font-bold block">Defect Analysis & Safety Hazard</span>
                    <p className="text-sm text-[#E0E0E0]">{aiResult.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#121418] p-3.5 rounded-2xl border border-[#2C2F33]">
                    <div>
                      <span className="text-[#8E9299] block">Target Authority:</span>
                      <span className="font-semibold text-[#F1FAEE] block truncate">{aiResult.concernedAuthority}</span>
                    </div>
                    <div>
                      <span className="text-[#8E9299] block">Official Bureau Email:</span>
                      <span className="font-mono text-[#2A9D8F] block truncate">{aiResult.authorityEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formal Draft Letter Box */}
              <div className="bg-[#1C1F22] rounded-3xl border border-[#2C2F33] p-6 text-left space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A8DADC] uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2A9D8F]" /> Formal Municipal Dispatch Letter
                  </span>
                  <span className="text-[11px] text-[#8E9299]">Ready to Send</span>
                </div>
                <textarea
                  readOnly
                  value={aiResult.draftMessage}
                  rows={5}
                  className="w-full bg-[#121418] border border-[#2C2F33] rounded-2xl p-4 text-xs font-mono text-[#E0E0E0] leading-relaxed focus:outline-none resize-none"
                />
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#2C2F33]">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-2xl text-xs font-semibold text-[#8E9299] hover:text-[#F1FAEE] hover:bg-[#1C1F22] transition-colors cursor-pointer"
                >
                  Discard
                </button>

                <button
                  onClick={handleConfirmDispatch}
                  disabled={isDispatching}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2A9D8F] via-[#264653] to-[#2A9D8F] text-white font-bold text-sm sm:text-base shadow-2xl shadow-[#2A9D8F]/40 hover:scale-102 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDispatching ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Dispatching Notice...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Dispatch Official Relief Notice
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: Celebration Success Banner */}
          {dispatchSuccess && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-[#2A9D8F] flex items-center justify-center text-white shadow-2xl shadow-[#2A9D8F]/50 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-[#2A9D8F]/20 text-[#2A9D8F] text-xs font-bold uppercase tracking-wider border border-[#2A9D8F]/40">
                  Notice Successfully Dispatched
                </span>
                <h3 className="text-3xl font-extrabold text-[#F1FAEE]">Civic Duty Completed!</h3>
                <p className="text-sm text-[#A8DADC] max-w-md mx-auto">
                  Official complaint tracking number <strong className="font-mono text-[#F4A261]">#{dispatchSuccess.trackingNumber}</strong> delivered to {dispatchSuccess.recipient}.
                </p>
              </div>

              {/* Reward Celebration Card */}
              <div className="bg-gradient-to-r from-[#264653] via-[#1C1F22] to-[#264653] p-6 rounded-3xl border border-[#2A9D8F] max-w-sm mx-auto shadow-2xl space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-lg">
                  <Award className="w-6 h-6 animate-pulse" /> +{(50 + (aiResult?.severity || 5) * 10)} Rank Points Earned!
                </div>
                <p className="text-xs text-[#8E9299]">Your citizen rank has increased. Check the Rewards tab to claim municipal transit passes and eco vouchers.</p>
              </div>

              <p className="text-xs text-[#8E9299] animate-pulse">Syncing location map for fellow travelers...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
