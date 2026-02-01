import React, { useState } from "react";
import axios from "axios";

export default function Report() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null); // აქ შევინახავთ ყველაფერს
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setReport(null);

    // 1. ვიღებთ ბექენდის მისამართს .env ფაილიდან.
    // თუ იქ ვერ იპოვა (მაგ. ლოკალურად), გამოიყენებს localhost-ს.
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      const response = await axios.post(
        `${API_URL}/analyze`, // დინამიური ლინკი
        { url },
        { timeout: 120000 }, // Lighthouse-ს ხშირად 90 წამზე მეტი სჭირდება, 120 ჯობია
      );

      setReport(response.data);
    } catch (err) {
      console.error("Error details:", err);
      alert(err.response?.data?.error || "შეცდომა ანალიზისას");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6 font-sans text-stone-200 flex justify-center items-start">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
        {/* Left Panel */}
        <div className="md:w-1/2 flex flex-col justify-start bg-[#1f1f1f] p-6 rounded-2xl shadow-lg">
          {/* Header */}
          <div className="mb-8 border-l-4 border-stone-500 pl-4">
            <h1 className="text-3xl font-black tracking-tight text-white">
              MAIN_THREAD
            </h1>
            <p className="text-stone-500 text-xs uppercase tracking-wider mt-1">
              System Diagnostics v4.0
            </p>
          </div>

          {/* Input Group */}
          <div className="flex flex-col gap-4">
            <input
              className="w-full p-4 bg-[#262626] border border-stone-800 rounded-xl text-white outline-none focus:border-stone-500 transition-all placeholder:text-stone-500 shadow-inner"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://target-site.com"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4 bg-stone-200 hover:bg-white text-black rounded-xl font-bold text-lg transition-transform active:scale-95 disabled:bg-stone-700 disabled:text-stone-500"
            >
              {loading ? "RUNNING_ANALYSIS..." : "START_DIAGNOSTICS"}
            </button>
          </div>
        </div>

        {/* Right Panel - Report */}
        {report && (
          <div className="md:w-1/2 flex flex-col gap-6 animate-in fade-in duration-700">
            {/* Scores Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(report.scores).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-[#212121] p-4 rounded-xl border border-stone-800 flex flex-col justify-center items-start"
                >
                  <span className="text-stone-500 text-[10px] uppercase font-bold mb-1">
                    {key}
                  </span>
                  <div
                    className={`text-2xl font-black ${
                      value >= 90
                        ? "text-green-400"
                        : value >= 50
                          ? "text-orange-400"
                          : "text-red-500"
                    }`}
                  >
                    {value}
                    <span className="text-sm opacity-50">%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insight Card */}
            <div className="bg-[#262626] border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-[#2d2d2d] px-6 py-3 border-b border-stone-800 flex justify-between items-center">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                  AI_RECOMMENDATION_ENGINE
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-stone-700"></div>
                  <div className="w-2 h-2 rounded-full bg-stone-700"></div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-stone-300 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                  {report.aiAdvice}
                </p>
              </div>
              <div className="px-6 py-3 bg-[#212121] text-[10px] text-stone-500 font-mono">
                STATUS: REPORT_GENERATED_SUCCESSFULLY
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
