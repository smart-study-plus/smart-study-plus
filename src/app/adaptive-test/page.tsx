'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import useSWR from 'swr';
import { ENDPOINTS } from '@/config/urls';
import { Header } from '@/components/layout/header';
import { Loader2, PlayCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TopicMasteryCard } from '@/components/dashboard/topic-mastery-card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/route-guard';
import { initSessionActivity } from '@/utils/session-management';

// --- Interfaces (should potentially move to interfaces file) ---
interface RawTopicSubmission {
  _id: string;
  user_id: string;
  topic_id: string;
  accuracy_rate: number;
  confidence_score: number;
  last_interaction: string; // Date as string from backend
  mastery_score: number;
  question_exposure_count: number;
  recency_weight: number;
  questions: QuestionData[]; // Define more specifically
}

interface QuestionData {
  question_id: string;
  question: string;
  question_type: string;
  user_answer?: string;
  user_answer_text?: string;
  correct_answer: string;
  is_correct: boolean;
  notes?: string;
  confidence_level?: number;
  topic_id?: string;
  topic_name?: string;
}

interface RawTopicSection {
  section_title: string;
  submissions: RawTopicSubmission[];
}

interface RawTopicChapter {
  chapter_title: string;
  sections: RawTopicSection[];
}

interface RawMasteryStudyGuide {
  study_guide_title: string;
  study_guide_id: string;
  chapters: RawTopicChapter[];
}

interface RawMasteryDataPayload {
  study_guides: RawMasteryStudyGuide[];
}

interface RawTopicMasteryResponse {
  message: string;
  mastery_data: RawMasteryDataPayload | null;
}

// Processed data for FE display
interface ProcessedTopicMastery {
  studyGuideTitle: string;
  studyGuideId: string;
  chapterTitle: string; // Added chapter title
  sectionTitle: string;
  masteryScore: number;
  accuracy: number;
  confidence: number;
  recency: number;
  questionCount: number;
  lastInteraction: Date;
}

// Structure for grouped data in useMemo
interface ProcessedChapter {
  sections: ProcessedTopicMastery[];
  // Add eligibility info if needed later
  // isEligibleForAdaptiveTest?: boolean;
}

interface ProcessedGuide {
  title: string;
  chapters: {
    [chapterTitle: string]: ProcessedChapter;
  };
}

interface GroupedMasteryData {
  [guideId: string]: ProcessedGuide;
}

interface AdaptiveTestResponse {
  message: string;
  practice_test?: {
    practice_test_id: string;
    study_guide_id: string;
    study_guide_title: string;
    section_title: string; // Title might be "Adaptive Test: Chapter X"
    chapter_title?: string; // Added chapter title
  } | null;
}

// Add interface for the list endpoint response
interface ExistingAdaptiveTestInfo {
  practice_test_id: string;
  study_guide_id: string;
  study_guide_title?: string;
  chapter_title?: string;
  created_at?: string; // Assuming ISO string from backend
  test_type?: string;
}

interface ListAdaptiveTestsResponse {
  message: string;
  adaptive_tests: ExistingAdaptiveTestInfo[];
}

// --- NEW: Interfaces for Adaptive Test Submissions ---
interface AdaptiveTestSubmissionQuestion {
  question_id?: string;
  question: string;
  question_type: string;
  user_answer: string; // Changed from any to string
  correct_answer: string; // Changed from any to string
  is_correct: boolean;
  choices?: { [key: string]: string };
}

interface AdaptiveTestSubmissionData {
  submission_id: string;
  user_id: string;
  practice_test_id: string; // The ID of the adaptive test submitted
  study_guide_id: string;
  chapter_title: string;
  score: number;
  accuracy: number; // Percentage 0-100
  total_questions: number;
  time_taken: number; // Seconds
  questions: AdaptiveTestSubmissionQuestion[];
  submitted_at: string; // ISO Date string
}

interface ListAdaptiveTestSubmissionsResponse {
  message: string;
  submissions: AdaptiveTestSubmissionData[];
}
// --- END: New Interfaces ---

// Fetcher function
const fetcher = async (url: string) => {
  const supabase = createClient();
  const token = await supabase.auth
    .getSession()
    .then((res) => res.data.session?.access_token);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Fetch error:', res.status, errorBody);
    throw new Error(`Failed to fetch data: ${res.statusText}`);
  }
  try {
    return await res.json();
  } catch (e) {
    console.error('Failed to parse JSON response:', e);
    throw new Error('Invalid JSON response from server');
  }
};

export default function AdaptiveTestPage() {
  const supabase = createClient();
  const router = useRouter();
  // State to track which CHAPTER is generating a test
  const [generatingChapterId, setGeneratingChapterId] = useState<string | null>(
    null
  );

  // Fetch user data
  const { data: userData, error: userError } = useSWR('user', async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  });
  const userId = userData?.id;

  // Fetch Topic Mastery Data (using the raw response type)
  const {
    // Changed variable name for clarity
    data: rawMasteryResponse,
    error: masteryError,
    isLoading: masteryLoading,
  } = useSWR<RawTopicMasteryResponse>(
    userId ? ENDPOINTS.topicMastery(userId) : null,
    fetcher
  );

  // Fetch existing GENERATED adaptive tests
  const {
    data: existingTestsResponse,
    error: existingTestsError,
    isLoading: existingTestsLoading,
  } = useSWR<ListAdaptiveTestsResponse>(
    userId ? ENDPOINTS.listAdaptiveTests(userId) : null,
    fetcher
  );

  // Fetch COMPLETED adaptive test submissions
  const {
    data: adaptiveSubmissionsResponse,
    error: adaptiveSubmissionsError,
    isLoading: adaptiveSubmissionsLoading,
  } = useSWR<ListAdaptiveTestSubmissionsResponse>(
    userId ? ENDPOINTS.listAdaptiveTestSubmissions(userId) : null,
    fetcher
  );

  // Memoize the list of existing tests for quick lookup
  const existingAdaptiveTestsMap = useMemo(() => {
    if (!existingTestsResponse?.adaptive_tests) return {};
    const map: { [key: string]: ExistingAdaptiveTestInfo } = {}; // Key: "guideId-chapterTitle"
    existingTestsResponse.adaptive_tests.forEach((test) => {
      if (test.study_guide_id && test.chapter_title) {
        const key = `${test.study_guide_id}-${test.chapter_title}`;
        // Store the first found test for a given chapter (or latest if sorted)
        if (!map[key]) {
          map[key] = test;
        }
      }
    });
    return map;
  }, [existingTestsResponse]);

  // --- NEW: Memoize submitted adaptive tests for quick lookup by practice_test_id ---
  const submittedAdaptiveTestsMap = useMemo(() => {
    if (!adaptiveSubmissionsResponse?.submissions) return {};
    const map: { [practiceTestId: string]: AdaptiveTestSubmissionData } = {};
    adaptiveSubmissionsResponse.submissions.forEach((sub) => {
      // Store the most recent submission if multiple exist for the same test ID
      if (
        !map[sub.practice_test_id] ||
        new Date(sub.submitted_at) >
          new Date(map[sub.practice_test_id].submitted_at)
      ) {
        map[sub.practice_test_id] = sub;
      }
    });
    return map;
  }, [adaptiveSubmissionsResponse]);

  // Process and group mastery data by Guide -> Chapter -> Section
  const groupedMasteryData = useMemo(() => {
    if (!rawMasteryResponse?.mastery_data?.study_guides) return {};

    const grouped: GroupedMasteryData = {};

    for (const guide of rawMasteryResponse.mastery_data.study_guides) {
      if (!grouped[guide.study_guide_id]) {
        grouped[guide.study_guide_id] = {
          title: guide.study_guide_title,
          chapters: {},
        };
      }

      for (const chapter of guide.chapters) {
        if (!grouped[guide.study_guide_id].chapters[chapter.chapter_title]) {
          grouped[guide.study_guide_id].chapters[chapter.chapter_title] = {
            sections: [],
            // Placeholder for eligibility - ideally fetched or calculated based on required sections
            // isEligibleForAdaptiveTest: checkChapterEligibility(guide.study_guide_id, chapter.chapter_title, guide.chapters)
          };
        }

        for (const section of chapter.sections) {
          // We only care about submissions for the current user
          const userSubmissions = section.submissions.filter(
            (sub) => sub.user_id === userId
          );

          if (userSubmissions.length > 0) {
            // Sort submissions by date to find the latest
            const sortedSubmissions = [...userSubmissions].sort(
              (a, b) =>
                new Date(b.last_interaction).getTime() -
                new Date(a.last_interaction).getTime()
            );
            const latestSubmission = sortedSubmissions[0];

            grouped[guide.study_guide_id].chapters[
              chapter.chapter_title
            ].sections.push({
              studyGuideTitle: guide.study_guide_title,
              studyGuideId: guide.study_guide_id,
              chapterTitle: chapter.chapter_title, // Add chapter title here
              sectionTitle: section.section_title,
              masteryScore: latestSubmission.mastery_score,
              accuracy: latestSubmission.accuracy_rate,
              confidence: latestSubmission.confidence_score,
              recency: latestSubmission.recency_weight * 100,
              questionCount: latestSubmission.question_exposure_count,
              lastInteraction: new Date(latestSubmission.last_interaction),
            });
          }
        }
        // Sort sections within the chapter by mastery score (optional)
        grouped[guide.study_guide_id].chapters[
          chapter.chapter_title
        ].sections.sort((a, b) => b.masteryScore - a.masteryScore);
      }
    }
    return grouped;
  }, [rawMasteryResponse, userId]);

  // Generate default open values for accordions (e.g., open first guide and chapter)
  const defaultAccordionValues = useMemo(() => {
    const defaults: string[] = [];
    const guideIds = Object.keys(groupedMasteryData);
    if (guideIds.length > 0) {
      const firstGuideId = guideIds[0];
      defaults.push(`guide-${firstGuideId}`); // Default open first guide
      const chapterTitles = Object.keys(
        groupedMasteryData[firstGuideId].chapters
      );
      if (chapterTitles.length > 0) {
        // defaults.push(`chapter-${firstGuideId}-${chapterTitles[0]}`); // Optional: default open first chapter
      }
    }
    return defaults;
  }, [groupedMasteryData]);

  // Updated handler for Chapter-level generation
  const handleGenerateAdaptiveTest = async (
    guideId: string,
    chapterTitle: string
  ) => {
    if (!userId) {
      toast.error('User not identified. Cannot generate test.');
      return;
    }
    // Unique ID for loading state based on chapter
    const uniqueChapterId = `${guideId}-${chapterTitle}`;
    setGeneratingChapterId(uniqueChapterId);
    toast.info(`Generating adaptive test for ${chapterTitle}...`);

    try {
      const token = await supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);
      const response = await fetch(ENDPOINTS.generateAdaptiveTest, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          study_guide_id: guideId,
          chapter_title: chapterTitle, // Send chapter_title now
        }),
      });

      const result: AdaptiveTestResponse = await response.json();

      if (!response.ok) {
        // Improved error handling
        console.error('API Error:', result.message || response.statusText);
        throw new Error(
          result.message || `Request failed with status ${response.status}`
        );
      }

      if (!result.practice_test) {
        // Handle case where backend confirms generation failed (e.g., eligibility)
        toast.info(result.message || 'Could not generate adaptive test.');
        throw new Error(
          result.message ||
            'Failed to generate adaptive test (no test data returned)'
        );
      }

      toast.success(
        `Adaptive test generated for ${chapterTitle}! Starting now...`
      );
      // Navigate to the newly generated test
      const testId = result.practice_test.practice_test_id;
      const guideTitle = groupedMasteryData[guideId]?.title || 'study-guide';
      router.push(
        `/practice/guide/${encodeURIComponent(guideTitle)}/quiz/${testId}`
      );
    } catch (error) {
      console.error('Error generating adaptive test:', error);
      toast.error(
        `Failed to generate adaptive test: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setGeneratingChapterId(null);
    }
  };

  // --- NEW: Handler for starting an existing adaptive test ---
  const handleStartAdaptiveTest = (guideId: string, testId: string) => {
    // Show loading toast while navigating
    toast.info('Loading adaptive test...', {
      duration: 3000,
    });

    const guideTitle = groupedMasteryData[guideId]?.title || 'study-guide';
    router.push(
      `/practice/guide/${encodeURIComponent(guideTitle)}/quiz/${testId}`
    );
  };
  // --- END: New Handler ---

  // --- NEW: Handler for viewing adaptive test results ---
  const handleViewAdaptiveResults = (submissionId: string) => {
    // Show loading toast while navigating
    toast.info('Loading adaptive test results...', {
      duration: 3000,
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
    });

    // Navigate to our dedicated adaptive test results page
    router.push(`/adaptive-test/results/${submissionId}`);
  };
  // --- END: New Handler ---

  const isLoading =
    masteryLoading ||
    !userData ||
    existingTestsLoading ||
    adaptiveSubmissionsLoading;
  const anyError =
    masteryError || existingTestsError || adaptiveSubmissionsError;

  // Add useEffect hook to initialize session activity tracking inside the component
  useEffect(() => {
    // Initialize session activity monitoring
    const cleanupSessionActivity = initSessionActivity();

    // Cleanup when component unmounts
    return () => {
      if (cleanupSessionActivity) {
        cleanupSessionActivity();
      }
    };
  }, []);

  return (
    <RouteGuard requireAuth>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Adaptive Tests by Chapter
            </h1>

            {isLoading ? (
              <div className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                <p className="ml-3 text-lg text-gray-600">
                  Loading Mastery Data...
                </p>
              </div>
            ) : anyError ? (
              <div className="text-center p-10 bg-red-100 border border-red-300 rounded-md">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-semibold mb-2">
                  Error Loading Mastery Data
                </p>
                <p className="text-red-600 text-sm">
                  Could not fetch your mastery progress. Please try refreshing
                  the page. If the problem persists, contact support.
                </p>
                <p className="text-xs text-red-500 mt-3">
                  ({masteryError?.message})
                </p>
                <p className="text-red-500 text-center">
                  Error loading data. Please try again.
                  {existingTestsError &&
                    `(Existing Tests: ${existingTestsError.message})`}
                </p>
              </div>
            ) : Object.keys(groupedMasteryData).length === 0 ? (
              <p className="text-gray-600 text-center py-10">
                No topic mastery data available yet. Complete some quizzes to
                unlock adaptive tests!
              </p>
            ) : (
              <Accordion
                type="multiple" // Allow multiple guides to be open
                defaultValue={defaultAccordionValues} // Open first guide by default
                className="w-full space-y-6"
              >
                {/* --- Outer Accordion: Study Guides --- */}
                {Object.entries(groupedMasteryData).map(
                  ([guideId, guideData]) => (
                    <AccordionItem
                      key={guideId}
                      value={`guide-${guideId}`}
                      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors w-full text-left">
                        <span className="text-xl font-semibold text-gray-800">
                          {guideData.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 pt-0 border-t border-gray-100">
                        {Object.keys(guideData.chapters).length === 0 ? (
                          <p className="text-gray-500 pt-4">
                            No chapter mastery data available for this guide
                            yet.
                          </p>
                        ) : (
                          <Accordion
                            type="multiple" // Allow multiple chapters open
                            // defaultValue={[`chapter-${guideId}-${Object.keys(guideData.chapters)[0]}`]} // Optional: Open first chapter
                            className="w-full space-y-4 pt-4"
                          >
                            {/* --- Inner Accordion: Chapters --- */}
                            {Object.entries(guideData.chapters).map(
                              ([chapterTitle, chapterData]) => {
                                const uniqueChapterId = `${guideId}-${chapterTitle}`;
                                const isGenerating =
                                  generatingChapterId === uniqueChapterId;

                                // Check if an adaptive test has been generated
                                const existingTest =
                                  existingAdaptiveTestsMap[uniqueChapterId];

                                // Check if the existing test has been submitted
                                const existingSubmission = existingTest
                                  ? submittedAdaptiveTestsMap[
                                      existingTest.practice_test_id
                                    ]
                                  : null;

                                // TODO: Add actual eligibility check here based on required sections vs chapterData.sections
                                const isEligible = true; // Placeholder: Assume eligible for now

                                return (
                                  <AccordionItem
                                    key={uniqueChapterId}
                                    value={`chapter-${uniqueChapterId}`}
                                    className="bg-gray-50 rounded-md border border-gray-200/80 overflow-hidden"
                                  >
                                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-100 transition-colors w-full text-left flex justify-between items-center gap-4">
                                      <span className="text-lg font-medium text-gray-700 flex-grow">
                                        {chapterTitle}
                                      </span>

                                      {/* --- Conditional Button Logic --- */}
                                      {existingTest ? ( // Test exists
                                        existingSubmission ? ( // Submission exists for this test
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewAdaptiveResults(
                                                existingSubmission.submission_id
                                              );
                                            }}
                                            size="sm"
                                            variant="secondary"
                                            className="bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-200 ease-in-out transform hover:scale-105 flex-shrink-0"
                                            title={`View results for ${chapterTitle} adaptive test`}
                                          >
                                            {/* Optional Icon: <FileText className="h-4 w-4 mr-2" /> */}
                                            View Results
                                          </Button>
                                        ) : (
                                          // Test exists, but no submission yet
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleStartAdaptiveTest(
                                                guideId,
                                                existingTest.practice_test_id
                                              );
                                            }}
                                            size="sm"
                                            variant="outline"
                                            className="border-[var(--color-info)] text-[var(--color-info)] hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105 flex-shrink-0"
                                            title={`Start existing adaptive test for ${chapterTitle}`}
                                          >
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Start Test
                                          </Button>
                                        )
                                      ) : (
                                        // No existing test found
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleGenerateAdaptiveTest(
                                              guideId,
                                              chapterTitle
                                            );
                                          }}
                                          disabled={isGenerating || !isEligible}
                                          size="sm"
                                          variant={
                                            isEligible ? 'default' : 'secondary'
                                          }
                                          className={`transition-all duration-200 ease-in-out transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0 ${isEligible ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white' : 'bg-gray-300 hover:bg-gray-400 cursor-help text-gray-600'}`}
                                          title={
                                            isEligible
                                              ? `Generate adaptive test for ${chapterTitle}`
                                              : 'Complete all sections in this chapter to unlock adaptive test'
                                          }
                                        >
                                          {isGenerating ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          ) : (
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                          )}
                                          {isGenerating
                                            ? 'Generating...'
                                            : 'Generate Test'}
                                        </Button>
                                      )}
                                      {/* --- End Conditional Button Logic --- */}
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-2 border-t border-gray-200">
                                      {chapterData.sections.length === 0 ? (
                                        <p className="text-sm text-gray-500 pt-2">
                                          No section mastery data available for
                                          this chapter yet.
                                        </p>
                                      ) : (
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-3">
                                          {/* --- Sections within Chapter --- */}
                                          {chapterData.sections.map(
                                            (mastery) => (
                                              <TopicMasteryCard
                                                key={`${mastery.studyGuideId}-${mastery.chapterTitle}-${mastery.sectionTitle}`}
                                                studyGuideTitle={
                                                  mastery.studyGuideTitle
                                                }
                                                sectionTitle={
                                                  mastery.sectionTitle
                                                }
                                                masteryScore={
                                                  mastery.masteryScore
                                                }
                                                accuracy={mastery.accuracy}
                                                recency={mastery.recency}
                                                confidence={mastery.confidence}
                                                questionCount={
                                                  mastery.questionCount
                                                }
                                                lastInteraction={
                                                  mastery.lastInteraction
                                                }
                                              />
                                            )
                                          )}
                                        </div>
                                      )}
                                    </AccordionContent>
                                  </AccordionItem>
                                );
                              }
                            )}
                          </Accordion>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </Accordion>
            )}
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
