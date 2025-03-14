// Use environment variable for API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const ENDPOINTS = {
  studyGuide: (title: string) =>
    `${API_URL}/api/study-guide/${encodeURIComponent(title)}`,
  studyGuides: `${API_URL}/api/study-guide/all`,
  studyHours: (userId: string) =>
    `${API_URL}/api/user/study-hours/${encodeURIComponent(userId)}`,
  practiceTests: (title: string) =>
    `${API_URL}/api/study-guide/practice/guide/${encodeURIComponent(title)}`,
  practiceTest: (testId: string) =>
    `${API_URL}/api/study-guide/practice/${testId}`,
  testAnalytics: (userId: string) =>
    `${API_URL}/api/user/test-analytics/${encodeURIComponent(userId)}`,
  guideAnalytics: (userId: string, guideId: string) =>
    `${API_URL}/api/user/test-analytics/${encodeURIComponent(userId)}/${encodeURIComponent(guideId)}`,
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
};
