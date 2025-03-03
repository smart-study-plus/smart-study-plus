export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const ENDPOINTS = {
  studyGuide: (title: string) =>
    `${API_URL}/api/study-guide/${encodeURIComponent(title)}`,
  practiceTests: (title: string) =>
    `${API_URL}/api/study-guide/practice-tests/${encodeURIComponent(title)}`,
  practiceTest: (testId: string) =>
    `${API_URL}/api/study-guide/practice-test/${testId}`,
  testResults: (userId: string, testId?: string) =>
    testId
      ? `${API_URL}/api/study-guide/practice-tests/results/${userId}/${testId}`
      : `${API_URL}/api/study-guide/practice-tests/results/${userId}`,
  submitTest: `${API_URL}/api/study-guide/practice-tests/submit`,
};
