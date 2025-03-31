/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

export interface Topic {
  id: number;
  title: string;
  description: string;
  progress: number;
  module_id: string;
}

export interface Concept {
  concept?: string;
  text?: string;
}

export interface Section {
  title: string;
  concepts: Concept[];
  completed?: boolean;
  locked?: boolean;
}

export interface Chapter {
  title: string;
  sections: Section[];
}

export interface StudyGuide {
  title: string;
  id: string;
  practice_tests: PracticeTest[];
}

export interface StudyGuideResponse {
  study_guide_id?: string;
  _id?: string;
}

export interface SlidesGuide {
  _id: string;
  title: string;
  description?: string;
  slides?: SlideContent[];
  topics?: SlideTopic[];
  quizzes?: SlideQuiz[];
}

export interface SlideContent {
  title: string;
  content: string;
  order?: number;
}

export interface SlideTopic {
  title: string;
  description?: string;
  key_points?: (Concept | string)[];
  explanation?: string;
  source_pages?: number[];
  source_texts?: string[];
  quizzes?: {
    topic: string;
    quizzes: {
      multiple_choice?: SlideQuestion[];
      short_answer?: ShortAnswerSlideQuestion[];
    };
  }[];
}

export interface SlideQuestion {
  question: string;
  choices?: Record<string, string>;
  correct: string;
  explanation: string;
  source_page?: number;
  source_text?: string;
}

export interface SlideQuiz {
  title: string;
  questions: SlideQuestion[];
}

export interface ShortAnswerSlideQuestion {
  question: string;
  ideal_answer: string;
  source_page?: number;
  source_text?: string;
}

export interface SlidePracticeTest {
  practice_test_id: string;
  study_guide_id: string;
  study_guide_title: string;
  section_title: string;
  questions: SlideQuestion[];
  guide_type: 'slides';
  short_answer?: ShortAnswerSlideQuestion[];
}

export interface PracticeTest {
  section_title: string;
  practice_test_id: string;
}

export interface PracticeTestsData {
  practice_tests: PracticeTest[];
}

export interface ProgressMap {
  [key: string]: number;
}

export interface TestMap {
  [key: string]: string;
}

export interface SlidesGuideListItem {
  _id: string;
  title: string;
  description?: string;
  topics?: { title: string }[];
  slides?: { title: string; content: string }[];
  fromAnalytics?: boolean;
}

export interface SlidesGuideListResponse {
  study_guides: SlidesGuideListItem[];
  message?: string;
}

export interface DashboardGuide {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: 'regular' | 'slides';
}
