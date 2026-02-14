import React, { useState } from "react";
import axios from "axios";

export default function Report() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("mobile"); // მობილური ან დესკტოპი
  const [report, setReport] = useState(() => {
    const savedReport = localStorage.getItem("lastReport");
    return savedReport ? JSON.parse(savedReport) : null;
  });

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setReport(null);
    localStorage.removeItem("lastReport");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      const response = await axios.post(
        `${API_URL}/api/analyze`,
        { url },
        { timeout: 150000 },
      );
      setReport(response.data);
      localStorage.setItem("lastReport", JSON.stringify(response.data));
    } catch (err) {
      console.error("Error details:", err);
      alert(err.response?.data?.error || "შეცდომა ანალიზისას. სერვერი დუმს.");
    } finally {
      setLoading(false);
    }
  };

  // მონაცემების ამოღების დაზუსტებული ლოგიკა
  const resultData = report?.result || report;
  const platformData = resultData?.platform || {}; // თუ არ არსებობს, გახდეს ცარიელი ობიექტი

  const activePlatforms = Object.entries(platformData).filter(
    ([key, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    },
  );
  // ვამოწმებთ, რომ ქულები ნამდვილად არსებობს ობიექტში
  const currentScores =
    activeTab === "mobile"
      ? resultData?.mobileScores
      : resultData?.desktopScores;

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-4 md:p-8 font-sans text-stone-200 flex justify-center items-start selection:bg-stone-500 selection:text-white">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8">
        {/* მარცხენა პანელი */}
        <div className="md:w-5/12 lg:w-4/12 flex flex-col justify-start bg-[#1f1f1f] p-6 rounded-2xl shadow-2xl border border-stone-800/50 sticky top-8 h-fit">
          <div className="mb-10 border-l-4 border-stone-500 pl-5 bg-red-500/5 py-3">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              MAIN_THREAD
            </h1>
            <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] mt-1 font-bold italic">
              System Diagnostics v4.0
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="flex flex-col gap-5">
            <input
              className="w-full p-4 bg-[#262626] border border-stone-800 rounded-xl text-white outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500/30 transition-all placeholder:text-stone-700 shadow-inner font-mono text-sm"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://target-site.com"
              required
            />
            <button
              disabled={loading}
              className="group relative w-full py-4 bg-stone-200 hover:bg-white text-black rounded-xl font-black text-lg transition-all active:scale-[0.97] disabled:bg-stone-800 disabled:text-stone-600 cursor-pointer overflow-hidden uppercase tracking-widest"
            >
              <span className="relative z-10">
                {loading ? "SCANNING..." : "START_DIAGNOSTICS"}
              </span>
              {loading && (
                <div className="absolute inset-0 bg-stone-700 animate-pulse"></div>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-stone-800/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">
                System Status
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-full border border-stone-800">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-orange-500 animate-pulse shadow-[0_0_8px_#f97316]" : "bg-green-500 shadow-[0_0_8px_#22c55e]"}`}
                ></span>
                <span className="text-[10px] font-mono text-stone-400">
                  {loading ? "BUSY" : "READY"}
                </span>
              </span>
            </div>

            {resultData && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-[#262626] p-3 rounded-lg border border-stone-800 flex justify-between items-center group hover:border-stone-600 transition-colors">
                  <span className="text-[10px] text-stone-600 uppercase font-bold tracking-tighter">
                    Target_Platform
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activePlatforms.map(([key, value]) => (
                      <span
                        key={key}
                        className="text-xs font-mono text-white bg-stone-800 px-2 py-0.5 rounded uppercase"
                      >
                        {/* თუ მნიშვნელობა მასივია, ვაერთებთ მძიმით, თუ არა - პირდაპირ ვწერთ */}
                        {key}: {Array.isArray(value) ? value.join(", ") : value}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-[#262626] p-3 rounded-lg border border-stone-800 flex justify-between items-center">
                  <span className="text-[10px] text-stone-600 uppercase font-bold tracking-tighter">
                    Security_Node
                  </span>
                  <span className="text-[10px] font-mono text-green-500 font-bold tracking-tighter">
                    ENCRYPTED_SSL
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* მარჯვენა პანელი */}
        <div className="md:w-7/12 lg:w-8/12 flex flex-col gap-6">
          {loading && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-[#212121] p-5 rounded-xl border border-stone-800/40 h-24 animate-pulse flex flex-col justify-end"
                  >
                    <div className="h-2 w-16 bg-stone-800 rounded mb-3"></div>
                    <div className="h-8 w-12 bg-stone-800 rounded"></div>
                  </div>
                ))}
              </div>
              <div className="bg-[#1c1c1c] border border-stone-800 rounded-2xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
                <div className="bg-[#2d2d2d] px-6 py-3 border-b border-stone-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_#f97316]"></div>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                      Terminal_Diagnostics
                    </span>
                  </div>
                </div>
                <div className="p-8 font-mono text-[11px] md:text-xs text-stone-500 space-y-4">
                  <p className="flex gap-3">INITIALIZING_VIRTUAL_BROWSER...</p>
                  <p className="flex gap-3 text-stone-300 animate-pulse font-bold tracking-widest uppercase">
                    {">"} RUNNING_FULL_AUDIT...
                  </p>
                </div>
              </div>
            </div>
          )}

          {report && !loading && (
            <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-700">
              {/* მობილური/დესკტოპი გადამრთველი */}
              <div className="flex gap-2 p-1 bg-[#212121] rounded-xl border border-stone-800 w-fit">
                {["mobile", "desktop"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab
                        ? "bg-stone-200 text-black shadow-lg"
                        : "text-stone-500 hover:text-stone-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ქულების ბლოკი */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-[#212121] p-5 rounded-xl border border-stone-800 flex flex-col justify-center items-start shadow-xl">
                  <span className="text-stone-600 text-[9px] uppercase font-black mb-1 tracking-tighter">
                    security
                  </span>
                  <div
                    className={`text-3xl font-black ${
                      (resultData?.security?.score || 0) >= 90
                        ? "text-green-400"
                        : (resultData?.security?.score || 0) >= 50
                          ? "text-orange-400"
                          : "text-red-500"
                    }`}
                  >
                    {/* თუ score არ არის, დაწერს 0-ს */}
                    {String(resultData?.security?.score ?? 0)}
                    <span className="text-xs opacity-30 ml-0.5">%</span>
                  </div>
                </div>
                {currentScores && Object.keys(currentScores).length > 0 ? (
                  Object.entries(currentScores).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-[#212121] p-5 rounded-xl border border-stone-800 flex flex-col justify-center items-start shadow-xl"
                    >
                      <span className="text-stone-600 text-[9px] uppercase font-black mb-1 tracking-tighter">
                        {String(key).replace(/-/g, "_")}
                      </span>
                      <div
                        className={`text-3xl font-black ${Number(value) >= 90 ? "text-green-400" : Number(value) >= 50 ? "text-orange-400" : "text-red-500"}`}
                      >
                        {String(value)}
                        <span className="text-xs opacity-30 ml-0.5">%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-4 text-stone-600 font-mono text-[10px] uppercase">
                    No score data found for {activeTab}
                  </div>
                )}
              </div>

              {/* AI რჩევები */}
              <div className="bg-[#262626] border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-[#2d2d2d] px-6 py-4 border-b border-stone-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                    <span className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">
                      AI_DIAGNOSIS_OUTPUT
                    </span>
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  <div className="text-stone-300 leading-[1.8] font-mono text-sm whitespace-pre-wrap">
                    {Array.isArray(report?.aiAdvice)
                      ? // აქ ვირჩევთ მობილურის ან დესკტოპის რჩევას ტაბის მიხედვით
                        activeTab === "mobile"
                        ? report.aiAdvice[0]?.mobileAdvice
                        : report.aiAdvice[0]?.desktopAdvice
                      : "ანალიზი მზად არის."}
                  </div>

                  {/* ხარვეზები */}
                  {resultData?.issuesForAi?.length > 0 && (
                    <div className="mt-10 border-t border-stone-800/50 pt-8">
                      <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="text-red-500">(!)</span>{" "}
                        {activeTab === "mobile" ? "Mobile" : "Desktop"}
                        _Critical_Issues
                      </h4>
                      <div className="grid gap-3">
                        {(activeTab === "mobile"
                          ? resultData?.mobileAudits
                          : resultData?.desktopAudits
                        ).map((issue, idx) => (
                          <div
                            key={idx}
                            className="bg-black/20 p-4 rounded-lg border border-stone-800/50 flex flex-col gap-1"
                          >
                            <span className="text-[10px] text-orange-400 font-mono font-bold">
                              {issue.title} {issue.value && `— ${issue.value}`}
                            </span>
                            <span className="text-[11px] text-stone-500 italic">
                              {issue.description?.substring(0, 150)}...
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!report && !loading && (
            <div className="h-full min-h-[500px] border-2 border-dashed border-stone-800/20 rounded-3xl flex flex-col items-center justify-center p-12 opacity-40">
              <div className="text-stone-800 text-8xl font-black italic mb-6 tracking-tighter">
                STDBY
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
