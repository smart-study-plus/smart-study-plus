/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

export interface Test {
  id: string;
  name: string;
  duration: number;
  attempts: number;
  lastScore: number;
}

export interface Question {
  question: string;
  choices: string[];
  correct: string;
  explanation: string;
}

export interface Quiz {
  section_title: string;
  questions: Question[];
}

export interface CompletedTest {
  test_id: string;
  study_guide_id: string;
}

export interface TestResultsResponse {
  test_results: CompletedTest[];
}

export interface SelectedAnswers {
  [key: string]: string;
}

export interface SubmissionResult {
  submission_id: string;
}

export interface QuizQuestion {
  question_id: string;
  is_correct: boolean;
  user_answer: string;
  correct_answer?: string;
  explanation: string;
  question: string;
}

export interface QuizResults {
  user_id: string;
  test_id: string;
  score: number;
  accuracy: number;
  status: string;
  questions: QuizQuestion[];
}
