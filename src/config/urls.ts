// Use environment variable for API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const ENDPOINTS = {
  studyGuide: (title: string) =>
    `${API_URL}/api/study-guide/${encodeURIComponent(title)}`,
  studyGuides: `${API_URL}/api/study-guide/all`,
  studyHours: (userId: string) =>
    `${API_URL}/api/user/study-hours/${encodeURIComponent(userId)}`,
  enhancedStudyHours: (
    userId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      includeOngoing?: boolean;
      aggregateBy?: 'day' | 'week' | 'month';
      includeAnonymous?: boolean;
    }
  ) => {
    let url = `${API_URL}/api/user/study-hours/${encodeURIComponent(userId)}`;
    const params = new URLSearchParams();

    if (options?.startDate) params.append('start_date', options.startDate);
    if (options?.endDate) params.append('end_date', options.endDate);
    if (options?.includeOngoing !== undefined)
      params.append('include_ongoing', options.includeOngoing.toString());
    if (options?.aggregateBy)
      params.append('aggregate_by', options.aggregateBy);
    if (options?.includeAnonymous !== undefined)
      params.append('include_anonymous', options.includeAnonymous.toString());

    const paramString = params.toString();
    if (paramString) url += `?${paramString}`;

    return url;
  },
  practiceTests: (title: string) =>
    `${API_URL}/api/study-guide/practice/guide/${encodeURIComponent(title)}`,
  practiceTest: (testId: string) =>
    `${API_URL}/api/study-guide/practice/${testId}`,
  testAnalytics: (userId: string) =>
    `${API_URL}/api/user/test-analytics/${encodeURIComponent(userId)}`,
  guideAnalytics: (userId: string, guideId: string) =>
    `${API_URL}/api/user/test-analytics/${encodeURIComponent(userId)}/${encodeURIComponent(guideId)}`,
  allGuideAnalytics: (userId: string) =>
    `${API_URL}/api/user/test-analytics/all/${encodeURIComponent(userId)}`,
  testResults: (userId: string, testId?: string) =>
    testId
      ? `${API_URL}/api/study-guide/practice/results/${userId}/${testId}`
      : `${API_URL}/api/study-guide/practice/results/${userId}`,
  guidePerformance: (guideId: string) =>
    `${API_URL}/api/study-guide/results/guide/${encodeURIComponent(guideId)}`,
  submitTest: `${API_URL}/api/study-guide/practice/submit`,
  startSession: `${API_URL}/api/user/session/start`,
  endSession: `${API_URL}/api/user/session/end`,

  // Add new RAG endpoints
  ragChatHistory: `${API_URL}/api/rag/chat-history`,
  ragAnswerChat: `${API_URL}/api/rag/answer-chat`,
  ragFetchHint: `${API_URL}/api/rag/fetch-hint`,
  ragGenerateHint: `${API_URL}/api/rag/generate-hint`,

  // Add new endpoint for claiming anonymous sessions
  claimAnonymousSessions: `${API_URL}/api/user/claim-sessions`,
};
