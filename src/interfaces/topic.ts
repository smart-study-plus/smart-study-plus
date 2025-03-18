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
  concept: string;
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
  slides?: any[];
  topics?: any[];
  quizzes?: any[];
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
