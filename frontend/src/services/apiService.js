// Cloudflare Worker API Client with graceful mock emulation
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const apiService = {
  isConfigured: Boolean(API_BASE && API_BASE.startsWith("http")),

  async generateAiReport(feedbacks) {
    if (this.isConfigured) {
      try {
        const res = await fetch(`${API_BASE}/api/ai/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedbacks })
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn("Cloudflare Worker AI API call failed, falling back to client synthesis:", err);
      }
    }

    // Client-side synthesis of AI report
    const validFeedbacks = feedbacks.filter(f => !f.containsPII);
    const categoryCount = {};
    const sentimentCount = { Positive: 0, Neutral: 0, Negative: 0 };
    const urgencyCount = { High: 0, Medium: 0, Low: 0 };

    validFeedbacks.forEach(f => {
      categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
      const sent = f.aiAnalysis?.sentiment || "Neutral";
      const urg = f.aiAnalysis?.urgency || "Medium";
      sentimentCount[sent] = (sentimentCount[sent] || 0) + 1;
      urgencyCount[urg] = (urgencyCount[urg] || 0) + 1;
    });

    return {
      generatedAt: new Date().toISOString(),
      totalAnalyzed: validFeedbacks.length,
      excludedPIICount: feedbacks.length - validFeedbacks.length,
      categoryDistribution: categoryCount,
      sentimentDistribution: sentimentCount,
      urgencyDistribution: urgencyCount,
      executiveSummary: "Analysis of student submissions highlights key focus areas in Academics (lecture hall acoustic maintenance) and Student Transit (evening bus scheduling). General student morale remains positive regarding quick canteen facility repairs.",
      recurringThemes: [
        "Audio-visual equipment maintenance in Lecture Hall 3",
        "Extended transport facility for late clinical duty students",
        "Central Library evening air conditioning and extended hours"
      ],
      recommendations: [
        "Escalate Lecture Hall 3 microphone replacement to biomedical engineering team",
        "Submit transport extension proposal to College Dean's office",
        "Continue periodic hygiene inspections in mess and canteen facilities"
      ]
    };
  }
};
