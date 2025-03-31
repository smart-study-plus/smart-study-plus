'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  Target,
  Award,
  X,
  Check,
  Zap,
  Loader2,
  GraduationCap,
  Timer,
  Percent,
  CheckCircle2,
  Activity,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Header } from '@/components/layout/header';
import { ENDPOINTS } from '@/config/urls';
import { Progress } from '@/components/ui/progress';
import useSWR, { mutate } from 'swr';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion, AnimatePresence } from 'framer-motion';
import { RouteGuard } from '@/components/auth/route-guard';
import {
  WrongQuestion,
  WeeklyProgress,
  GuideAnalytics,
  EnhancedStudyHours,
  TimePeriod,
  TopicMasteryData,
  ProcessedTopicMastery,
  RawTopicMasteryResponse,
  RawMasteryStudyGuide,
  RawTopicChapter,
  RawTopicSection,
  RawTopicSubmission,
  GroupedMasteryData,
  ProcessedGuide,
  ProcessedChapter,
} from '@/interfaces/test';
import { DashboardGuide } from '@/interfaces/topic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { GuideStats } from '@/components/dashboard/guide-stats';
import { formatTime } from '@/lib/utils';
import * as Messages from '@/config/messages';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TopicMasteryCard } from '../../components/dashboard/topic-mastery-card';
import { initSessionActivity } from '@/utils/session-management';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// MathJax configuration
const mathJaxConfig = {
  loader: {
    load: [
      '[tex]/html',
      '[tex]/ams',
      '[tex]/noerrors',
      '[tex]/noundefined',
      '[tex]/mhchem',
      '[tex]/cancel',
    ],
  },
  tex: {
    packages: {
      '[+]': ['html', 'ams', 'noerrors', 'noundefined', 'mhchem', 'cancel'],
    },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    processEscapes: true,
    processEnvironments: true,
    processRefs: true,
    digits: /^(?:[0-9]+(?:\{,\}[0-9]{3})*(?:\.[0-9]*)?|\.[0-9]+)/,
    tags: 'ams',
    tagSide: 'right',
    tagIndent: '0.8em',
    useLabelIds: true,
    maxMacros: 1000,
    maxBuffer: 5 * 1024,
    macros: {
      // Number sets
      '\\R': '\\mathbb{R}',
      '\\N': '\\mathbb{N}',
      '\\Z': '\\mathbb{Z}',
      '\\Q': '\\mathbb{Q}',
      '\\C': '\\mathbb{C}',
      // Common operators and functions
      '\\Var': '\\operatorname{Var}',
      '\\Bias': '\\operatorname{Bias}',
      '\\EPE': '\\operatorname{EPE}',
      '\\RSS': '\\operatorname{RSS}',
      '\\MSE': '\\operatorname{MSE}',
      '\\E': '\\mathbb{E}',
      '\\P': '\\mathbb{P}',
      // Decorators
      '\\hat': '\\widehat',
      '\\bar': '\\overline',
      '\\tilde': '\\widetilde',
      '\\vec': '\\mathbf',
      '\\mat': '\\mathbf',
      // Greek letters shortcuts
      '\\eps': '\\varepsilon',
      '\\alp': '\\alpha',
      '\\bet': '\\beta',
      '\\gam': '\\gamma',
      '\\del': '\\delta',
      '\\the': '\\theta',
      '\\kap': '\\kappa',
      '\\lam': '\\lambda',
      '\\sig': '\\sigma',
      '\\Gam': '\\Gamma',
      '\\Del': '\\Delta',
      '\\The': '\\Theta',
      '\\Lam': '\\Lambda',
      '\\Sig': '\\Sigma',
      '\\Ome': '\\Omega',
      // Special operators
      '\\T': '^{\\intercal}',
      '\\given': '\\,|\\,',
      '\\set': '\\{\\,',
      '\\setend': '\\,\\}',
      '\\abs': ['\\left|#1\\right|', 1],
      '\\norm': ['\\left\\|#1\\right\\|', 1],
      '\\inner': ['\\left\\langle#1\\right\\rangle', 1],
      '\\ceil': ['\\left\\lceil#1\\right\\rceil', 1],
      '\\floor': ['\\left\\lfloor#1\\right\\rfloor', 1],
    },
  },
  svg: {
    fontCache: 'global',
  },
  options: {
    enableMenu: false,
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fetcher = async (url: string) => {
  const supabase = createClient();
  const token = await supabase.auth
    .getSession()
    .then((res) => res.data.session?.access_token);
  console.log(`Fetching data from: ${url}`);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch data');
  const data = await res.json();
  console.log(`Received data from ${url}:`, data);
  return data;
};

export default function DashboardPage() {
  const supabase = createClient();
  const [selectedGuideIndex, setSelectedGuideIndex] = useState(0);
  const [studyTimeView, setStudyTimeView] = useState<'day' | 'week' | 'month'>(
    'week'
  );
  const [isClaimingAnonymousSessions, setIsClaimingAnonymousSessions] =
    useState(false);

  // Fetch user data FIRST
  const { data: userData, error: userError } = useSWR('user', async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  });

  const userId = userData?.id; // Declare userId AFTER fetching userData

  // Fetch Topic Mastery Data (Now userId is available)
  const { data: rawMasteryData, error: masteryError } =
    useSWR<RawTopicMasteryResponse>(
      userId ? ENDPOINTS.topicMastery(userId) : null,
      fetcher
    );

  // Use enhanced study hours endpoint
  const {
    data: enhancedStudyHours,
    error: studyHoursError,
    mutate: mutateStudyHours,
  } = useSWR<EnhancedStudyHours>(
    userId
      ? ENDPOINTS.enhancedStudyHours(userId, {
          includeOngoing: true,
          aggregateBy: studyTimeView,
          includeAnonymous: false, // Don't include anonymous sessions by default
        })
      : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute to update ongoing session time
      revalidateOnFocus: true, // Revalidate when tab regains focus
      onError: (err) => {
        console.error('Error fetching study hours:', err);
      },
    }
  );

  // Add a function to check if user is new (no study hours)
  const isNewUser = useMemo(() => {
    if (!enhancedStudyHours) return true;
    return (
      enhancedStudyHours.total_hours === 0 &&
      !enhancedStudyHours.has_ongoing_session
    );
  }, [enhancedStudyHours]);

  const { data: testAnalytics, error: testError } = useSWR(
    userId ? ENDPOINTS.testAnalytics(userId) : null,
    fetcher
  );

  // Fetch all guide analytics in one request with proper logging
  const allGuideAnalyticsUrl = userId
    ? ENDPOINTS.allGuideAnalytics(userId)
    : null;
  const { data: allGuideAnalytics, error: allGuideAnalyticsError } = useSWR(
    allGuideAnalyticsUrl,
    fetcher
  );

  // Log the analytics data when it changes
  useEffect(() => {
    if (allGuideAnalytics) {
      console.log('All guide analytics loaded:', allGuideAnalytics);
    }
    if (allGuideAnalyticsError) {
      console.error(
        'Error loading all guide analytics:',
        allGuideAnalyticsError
      );
    }
  }, [allGuideAnalytics, allGuideAnalyticsError]);

  const { data: studyGuidesResponse, error: guidesError } = useSWR(
    ENDPOINTS.studyGuides,
    fetcher
  );

  const studyGuides = useMemo<DashboardGuide[]>(() => {
    if (!studyGuidesResponse?.study_guides) return [];

    // First get all available guide analytics
    const guidesWithAnalytics = allGuideAnalytics?.study_guides || [];
    console.log('All guides with analytics:', guidesWithAnalytics);

    // Create a map for fast lookup of analytics by guide ID
    const analyticsMap = new Map();
    guidesWithAnalytics.forEach((guide: GuideAnalytics) => {
      analyticsMap.set(guide.study_guide_id, guide);
    });

    // Regular guides from study_guides endpoint that also have analytics
    const regularGuides = studyGuidesResponse.study_guides
      .filter((guide: { study_guide_id: string; title: string }) =>
        analyticsMap.has(guide.study_guide_id)
      )
      .map((guide: { study_guide_id: string; title: string }) => {
        const analytics = analyticsMap.get(guide.study_guide_id);
        return {
          id: guide.study_guide_id,
          title: guide.title,
          description: `Study guide for ${guide.title}`,
          progress: analytics?.average_accuracy || 0,
          type: 'regular' as const,
        };
      });

    // Find guides in analytics that aren't in regular guides (these might be slides-based)
    const additionalGuides: DashboardGuide[] = [];

    guidesWithAnalytics.forEach((analytic: GuideAnalytics) => {
      const guideId = analytic.study_guide_id;
      const alreadyIncluded = regularGuides.some(
        (g: DashboardGuide) => g.id === guideId
      );

      if (!alreadyIncluded) {
        console.log(
          `Adding guide from analytics: ${guideId} - ${analytic.study_guide_title} (${analytic.guide_type || 'unknown type'})`
        );

        additionalGuides.push({
          id: guideId,
          title: analytic.study_guide_title || `Guide ${guideId}`,
          description: `Study guide with ${analytic.total_tests} test${analytic.total_tests !== 1 ? 's' : ''}`,
          progress: analytic.average_accuracy || 0,
          type: analytic.guide_type === 'slides' ? 'slides' : 'regular',
        });
      }
    });

    const allGuides = [...regularGuides, ...additionalGuides];
    console.log(`Total guides for dashboard: ${allGuides.length}`);

    return allGuides;
  }, [studyGuidesResponse, allGuideAnalytics]);

  // --- Process Mastery Data (Grouped by Guide -> Chapter -> Section) ---
  const groupedMasteryData = useMemo(() => {
    if (!rawMasteryData?.mastery_data?.study_guides) return {};

    const grouped: GroupedMasteryData = {};

    // Ensure correct typing for iteration
    const guidesToProcess = rawMasteryData.mastery_data
      .study_guides as RawMasteryStudyGuide[];

    // Iterate through guides
    for (const guide of guidesToProcess) {
      // Use the correctly typed variable
      if (!grouped[guide.study_guide_id]) {
        grouped[guide.study_guide_id] = {
          title: guide.study_guide_title,
          chapters: {},
        };
      }

      for (const chapter of guide.chapters as RawTopicChapter[]) {
        if (!grouped[guide.study_guide_id].chapters[chapter.chapter_title]) {
          grouped[guide.study_guide_id].chapters[chapter.chapter_title] = {
            sections: [],
          };
        }

        for (const section of chapter.sections as RawTopicSection[]) {
          const userSubmissions = (
            section.submissions as RawTopicSubmission[]
          ).filter((sub) => sub.user_id === userId);

          if (userSubmissions.length > 0) {
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
              chapterTitle: chapter.chapter_title,
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
        grouped[guide.study_guide_id].chapters[
          chapter.chapter_title
        ].sections.sort((a, b) => b.masteryScore - a.masteryScore);
      }
    }
    console.log('Processed Grouped Mastery Data (Dashboard):', grouped);
    return grouped;
  }, [rawMasteryData, userId]);
  // --- End Process Mastery Data ---

  const selectedGuide = studyGuides?.[selectedGuideIndex];

  // Find the selected guide's analytics from the all guide analytics data
  const selectedGuideAnalytics = useMemo(() => {
    if (
      !allGuideAnalytics?.study_guides ||
      !selectedGuide ||
      allGuideAnalytics.study_guides.length === 0
    )
      return null;

    return allGuideAnalytics.study_guides.find(
      (guide: GuideAnalytics) => guide.study_guide_id === selectedGuide.id
    );
  }, [allGuideAnalytics, selectedGuide]);

  // Individual guide fetch - keep as fallback if the all analytics endpoint fails
  const { data: individualGuideAnalytics, error: guideAnalyticsError } = useSWR(
    userId && selectedGuide?.id && !selectedGuideAnalytics
      ? ENDPOINTS.guideAnalytics(userId, selectedGuide.id)
      : null,
    fetcher
  );

  // Use either the analytics from all guides or individual fetch
  const guideAnalytics = selectedGuideAnalytics || individualGuideAnalytics;

  const isLoading = !userData || !enhancedStudyHours || !testAnalytics;
  const hasError = false; // We're handling errors gracefully now
  const userName =
    userData?.user_metadata?.full_name ||
    userData?.user_metadata?.name ||
    userData?.user_metadata?.display_name ||
    userData?.email?.split('@')[0] ||
    'Student';

  const handlePreviousGuide = () => {
    setSelectedGuideIndex((prev) =>
      prev === 0 ? (studyGuides?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextGuide = () => {
    setSelectedGuideIndex((prev) =>
      prev === (studyGuides?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  // Add function to select a guide by ID
  const selectGuideById = useCallback(
    (guideId: string) => {
      console.log(`Trying to select guide with ID: ${guideId}`);

      const guideIndex = studyGuides.findIndex(
        (guide: DashboardGuide) => guide.id === guideId
      );

      console.log(
        `Found guide at index: ${guideIndex}, total guides: ${studyGuides.length}`
      );

      if (guideIndex >= 0) {
        const guide = studyGuides[guideIndex];
        console.log(
          `Selecting guide: ${guide.title}, type: ${guide.type || 'regular'}`
        );
        setSelectedGuideIndex(guideIndex);
        return true;
      }

      console.log(`Guide not found in studyGuides list`);
      // For debugging, log all available guide IDs
      if (studyGuides.length > 0) {
        console.log('Available guide IDs:');
        studyGuides.forEach((g: DashboardGuide) =>
          console.log(`- ${g.id} (${g.title})`)
        );
      }

      return false;
    },
    [studyGuides]
  );

  // Try to match guides when allGuideAnalytics changes
  useEffect(() => {
    if (allGuideAnalytics?.study_guides?.length > 0 && studyGuides.length > 0) {
      console.log('Matching study guides with analytics...');

      // Find a guide that has analytics data
      const guideWithData = allGuideAnalytics.study_guides.find(
        (guide: GuideAnalytics) => guide.total_tests > 0
      );

      if (guideWithData) {
        console.log(
          `Found guide with data: ${guideWithData.study_guide_id}, trying to select it`
        );

        // Try to find this guide in studyGuides
        const guideIndex = studyGuides.findIndex(
          (guide: DashboardGuide) => guide.id === guideWithData.study_guide_id
        );

        if (guideIndex >= 0) {
          console.log(`Found guide at index ${guideIndex}, selecting it`);
          setSelectedGuideIndex(guideIndex);
        } else {
          console.log(
            `Guide not found in studyGuides, something may be wrong with the filtering`
          );
          console.log(
            'Available guides:',
            studyGuides.map((g) => `${g.id} (${g.title})`)
          );
        }
      }
    }
  }, [allGuideAnalytics, studyGuides]);

  // Modify the claim anonymous sessions function to only show for new users
  const handleClaimAnonymousSessions = useCallback(async () => {
    if (!userId || !isNewUser) return;

    try {
      setIsClaimingAnonymousSessions(true);
      const token = await supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(ENDPOINTS.claimAnonymousSessions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        console.error('Error response:', await response.text());
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Successfully claimed ${result.claimed_count} anonymous sessions!`
        );
        // After claiming, refetch with includeAnonymous=true
        mutate(
          ENDPOINTS.enhancedStudyHours(userId, {
            includeOngoing: true,
            aggregateBy: studyTimeView,
            includeAnonymous: true,
          })
        );
      } else {
        toast.info(result.message || 'No anonymous sessions found to claim');
      }
    } catch (error) {
      console.error('Error claiming anonymous sessions:', error);
      toast.error('Failed to claim anonymous sessions. Please try again.');
    } finally {
      setIsClaimingAnonymousSessions(false);
    }
  }, [userId, supabase, studyTimeView, isNewUser]);

  // Manually refresh study hours data when on dashboard tab
  useEffect(() => {
    // Check if session_id exists but user is logged in - this means we need to start a new session
    const hasSessionId = localStorage.getItem('session_id');
    if (!hasSessionId && userId) {
      console.log(
        'No session found but user is logged in, starting new session'
      );
      startNewSession(userId);
    }

    // Set up interval to refresh study hours
    const interval = setInterval(() => {
      if (enhancedStudyHours) {
        console.log('Auto-refreshing study hours data');
        mutateStudyHours();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [userId, enhancedStudyHours, mutateStudyHours]);

  // Session activity monitoring
  useEffect(() => {
    // Only run on the client
    if (typeof window === 'undefined') return;

    // Initialize session activity monitoring and get the cleanup function
    const cleanupSessionActivity = initSessionActivity();

    // Return the cleanup function to be called when component unmounts
    return () => {
      if (cleanupSessionActivity) {
        cleanupSessionActivity();
      }
    };
  }, []);

  // Modify the startNewSession function to include session activity monitoring
  const startNewSession = async (userId: string) => {
    try {
      console.log('Starting new session for dashboard');
      const token = await supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      const response = await fetch(ENDPOINTS.startSession, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device: 'browser',
          user_id: userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('session_id', data.session_id);
        console.log('Dashboard session started:', data.session_id);

        // Initialize session activity monitoring since we started a new session
        initSessionActivity();

        // Refresh study hours to include this new session
        mutateStudyHours();
      } else {
        console.error(
          'Failed to start dashboard session:',
          await response.text()
        );
      }
    } catch (error) {
      console.error('Error starting dashboard session:', error);
    }
  };

  // Generate default values for the accordion to have all items open
  const defaultAccordionValues = useMemo(() => {
    return Object.keys(groupedMasteryData).map((_, index) => `guide-${index}`);
  }, [groupedMasteryData]);

  // Helper function to render with KaTeX
  const renderWithKatex = (
    text: string,
    displayMode: boolean = false
  ): string => {
    try {
      return katex.renderToString(text, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
        macros: mathJaxConfig.tex.macros,
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return text;
    }
  };

  // Helper function to determine if text is simple LaTeX
  const isSimpleLatex = (text: string): boolean => {
    // Check if text contains only basic LaTeX commands and symbols
    const simpleLatexPattern = /^[a-zA-Z0-9\s\+\-\*\/\^\{\}\(\)\[\]\_\$\\]+$/;
    return simpleLatexPattern.test(text);
  };

  // Helper function to render text with LaTeX
  const renderTextWithLatex = (text: string) => {
    if (!text) return null;

    // First, unescape all double backslashes
    let processedText = text.replace(/\\\\/g, '\\');

    // Handle special LaTeX commands and symbols
    processedText = processedText
      // Handle \mathbb{R} notation
      .replace(/\\mathbb\{([^}]+)\}/g, (_, p1) => `\\mathbb{${p1}}`)
      // Handle subscripts and superscripts with multiple characters
      .replace(/_{([^}]+)}/g, '_{$1}')
      .replace(/\^{([^}]+)}/g, '^{$1}')
      // Handle special spacing around operators
      .replace(/\\sum(?![a-zA-Z])/g, '\\sum\\limits')
      .replace(/\\int(?![a-zA-Z])/g, '\\int\\limits')
      .replace(/\\prod(?![a-zA-Z])/g, '\\prod\\limits')
      // Handle spacing around vertical bars and other delimiters
      .replace(/\|/g, '\\,|\\,')
      .replace(/\\mid/g, '\\,|\\,')
      // Handle matrix transpose
      .replace(/\\T(?![a-zA-Z])/g, '^{\\intercal}')
      // Handle common statistical notation
      .replace(/\\Var/g, '\\operatorname{Var}')
      .replace(/\\Bias/g, '\\operatorname{Bias}')
      .replace(/\\MSE/g, '\\operatorname{MSE}')
      .replace(/\\EPE/g, '\\operatorname{EPE}')
      // Handle escaped curly braces
      .replace(/\\\{/g, '{')
      .replace(/\\\}/g, '}');

    // Split text by existing LaTeX delimiters while preserving the delimiters
    const parts = processedText.split(
      /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$|\\\([^)]*?\\\)|\\\[[\s\S]*?\\\])/g
    );

    return parts.map((part, index) => {
      // Generate a more unique key using content hash
      const key = `${index}-${hashString(part)}`;

      if (
        part.startsWith('$') ||
        part.startsWith('\\(') ||
        part.startsWith('\\[')
      ) {
        // Remove the delimiters
        let latex = part
          .replace(/^\$\$|\$\$$|^\$|\$$|^\\\(|\\\)$|^\\\[|\\\]$/g, '')
          .trim();

        const isDisplay = part.startsWith('$$') || part.startsWith('\\[');

        // Use KaTeX for simple expressions and MathJax for complex ones
        if (isSimpleLatex(latex)) {
          return (
            <span
              key={key}
              dangerouslySetInnerHTML={{
                __html: renderWithKatex(latex, isDisplay),
              }}
            />
          );
        }

        // Wrap the LaTeX in appropriate delimiters for MathJax
        latex = isDisplay ? `$$${latex}$$` : `$${latex}$`;

        return (
          <MathJax key={key} inline={!isDisplay} dynamic={true}>
            {latex}
          </MathJax>
        );
      }

      // Check if the part contains any LaTeX-like content
      if (part.includes('\\') || /[_^{}]/.test(part)) {
        // Use KaTeX for simple expressions
        if (isSimpleLatex(part)) {
          return (
            <span
              key={key}
              dangerouslySetInnerHTML={{
                __html: renderWithKatex(part, false),
              }}
            />
          );
        }

        // Use MathJax for complex expressions
        return (
          <MathJax key={key} inline={true} dynamic={true}>
            {`$${part}$`}
          </MathJax>
        );
      }

      return <span key={key}>{part}</span>;
    });
  };

  // Simple string hashing function for generating unique keys
  const hashString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36); // Convert to base-36 for shorter strings
  };

  return (
    <MathJaxContext config={mathJaxConfig}>
      <RouteGuard requireAuth>
        <div className="flex min-h-screen flex-col bg-[var(--color-background-alt)]">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
              >
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                  Welcome back, {userName}!
                </h1>
                <p className="text-xl text-gray-600">
                  Let&apos;s boost your learning today
                </p>
              </motion.div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                  <p className="text-lg text-gray-600">
                    Loading your dashboard...
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  <Tabs defaultValue="overall" className="mb-12">
                    <TabsList className="flex w-full border-b border-gray-200 mb-6 p-0 bg-transparent space-x-8">
                      <TabsTrigger
                        value="overall"
                        className="px-1 py-2 text-gray-600 data-[state=active]:text-[var(--color-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] rounded-none bg-transparent hover:text-[var(--color-primary)] transition-colors"
                      >
                        Overall Stats
                      </TabsTrigger>
                      <TabsTrigger
                        value="guide-specific"
                        className="px-1 py-2 text-gray-600 data-[state=active]:text-[var(--color-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] rounded-none bg-transparent hover:text-[var(--color-primary)] transition-colors"
                      >
                        Guide-Specific Stats
                      </TabsTrigger>
                      <TabsTrigger
                        value="topic-mastery"
                        className="px-1 py-2 text-gray-600 data-[state=active]:text-[var(--color-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-primary)] rounded-none bg-transparent hover:text-[var(--color-primary)] transition-colors"
                      >
                        Topic Mastery
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overall">
                      <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="space-y-8"
                      >
                        <motion.div
                          variants={fadeInUp}
                          className="grid gap-8 md:grid-cols-3 mb-12"
                        >
                          <motion.div
                            variants={fadeInUp}
                            className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-lg"
                          >
                            <CardContent className="p-6 relative">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--color-primary)]/20 to-purple-300/20 rounded-bl-full"></div>
                              <Clock className="h-8 w-8 text-[var(--color-primary)] mb-4" />
                              <CardTitle className="text-lg font-semibold text-gray-700 mb-2">
                                Total Study Time
                              </CardTitle>
                              <div className="flex flex-col">
                                {studyHoursError ||
                                !enhancedStudyHours?.total_hours ? (
                                  <div className="space-y-2">
                                    <p className="text-gray-600">
                                      {Messages.NO_STUDY_HOURS}
                                    </p>
                                    {userId && isNewUser && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-2 text-xs"
                                        onClick={handleClaimAnonymousSessions}
                                        disabled={isClaimingAnonymousSessions}
                                      >
                                        {isClaimingAnonymousSessions ? (
                                          <>
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            Claiming...
                                          </>
                                        ) : (
                                          'Find My Sessions'
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-baseline">
                                      <span className="text-4xl font-bold text-gray-900">
                                        {enhancedStudyHours.total_hours}
                                      </span>
                                      <span className="ml-2 text-gray-600">
                                        hours total
                                      </span>
                                    </div>

                                    {enhancedStudyHours.has_ongoing_session && (
                                      <div className="mt-2 text-sm flex items-center text-green-600">
                                        <Activity className="h-4 w-4 mr-1" />
                                        <span>
                                          Ongoing:{' '}
                                          {enhancedStudyHours.ongoing_hours.toFixed(
                                            2
                                          )}{' '}
                                          hours
                                        </span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </motion.div>

                          <motion.div
                            variants={fadeInUp}
                            className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-lg"
                          >
                            <CardContent className="p-6 relative">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-200/30 to-orange-300/30 rounded-bl-full"></div>
                              <Target className="h-8 w-8 text-yellow-500 mb-4" />
                              <CardTitle className="text-lg font-semibold text-gray-700 mb-2">
                                Average Score
                              </CardTitle>
                              <div className="flex items-baseline">
                                {testError || !testAnalytics?.average_score ? (
                                  <p className="text-gray-600">
                                    {Messages.NO_TEST_DATA}
                                  </p>
                                ) : (
                                  <>
                                    <span className="text-4xl font-bold text-gray-900">
                                      {testAnalytics.average_score.toFixed(2)}
                                    </span>
                                    <span className="ml-2 text-gray-600">
                                      points
                                    </span>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </motion.div>

                          <motion.div
                            variants={fadeInUp}
                            className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-lg"
                          >
                            <CardContent className="p-6 relative">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-bl-full"></div>
                              <Award className="h-8 w-8 text-green-500 mb-4" />
                              <CardTitle className="text-lg font-semibold text-gray-700 mb-2">
                                Tests Taken
                              </CardTitle>
                              <div className="flex items-baseline">
                                {testError || !testAnalytics?.total_tests ? (
                                  <p className="text-gray-600">
                                    {Messages.NO_TEST_DATA}
                                  </p>
                                ) : (
                                  <>
                                    <span className="text-4xl font-bold text-gray-900">
                                      {testAnalytics.total_tests}
                                    </span>
                                    <span className="ml-2 text-gray-600">
                                      total
                                    </span>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </motion.div>
                        </motion.div>

                        {/* Study Time Periods Section */}
                        {enhancedStudyHours?.time_periods &&
                          enhancedStudyHours.time_periods.length > 0 && (
                            <motion.div variants={fadeInUp} className="mb-12">
                              <Card className="bg-white shadow-lg">
                                <CardHeader className="border-b border-gray-100">
                                  <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                      <Calendar className="h-6 w-6 text-[var(--color-primary)] mr-2" />
                                      Study Activity
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                      <TabsList className="bg-gray-100">
                                        <TabsTrigger
                                          value="week"
                                          onClick={() =>
                                            setStudyTimeView('week')
                                          }
                                          className={
                                            studyTimeView === 'week'
                                              ? 'bg-white'
                                              : ''
                                          }
                                        >
                                          Week
                                        </TabsTrigger>
                                      </TabsList>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                  <div className="space-y-5">
                                    {enhancedStudyHours.time_periods.map(
                                      (period: TimePeriod, index: number) => (
                                        <motion.div
                                          key={period.period}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: index * 0.05 }}
                                          className="relative"
                                        >
                                          <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center">
                                              <BarChart3 className="h-4 w-4 text-gray-500 mr-2" />
                                              <span className="text-sm font-medium text-gray-700">
                                                {period.period}
                                              </span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                              <span className="text-sm text-gray-500">
                                                {period.session_count}{' '}
                                                {period.session_count === 1
                                                  ? 'session'
                                                  : 'sessions'}
                                              </span>
                                              <span className="text-sm font-bold text-[var(--color-primary)]">
                                                {period.hours.toFixed(1)} hrs
                                              </span>
                                            </div>
                                          </div>
                                          <Progress
                                            value={Math.min(
                                              period.hours * 10,
                                              100
                                            )}
                                            className="h-2"
                                          />
                                        </motion.div>
                                      )
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}

                        <motion.div
                          variants={fadeInUp}
                          className="grid gap-8 md:grid-cols-3"
                        >
                          <Card className="col-span-2 bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-100">
                              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                                Recently Missed Questions
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              {testError ||
                              !testAnalytics?.recent_wrong_questions ||
                              testAnalytics.recent_wrong_questions.length ===
                                0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-gray-600">
                                  <p>{Messages.NO_TEST_DATA}</p>
                                </div>
                              ) : (
                                <Accordion
                                  type="single"
                                  collapsible
                                  className="w-full"
                                >
                                  {testAnalytics.recent_wrong_questions.map(
                                    (q: WrongQuestion, index: number) => (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                      >
                                        <AccordionItem
                                          value={`item-${index}`}
                                          className="border-b border-gray-100 last:border-0"
                                        >
                                          <AccordionTrigger className="text-sm text-gray-900 hover:no-underline py-4">
                                            <div className="flex items-center">
                                              <span className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full mr-3 text-xs font-medium">
                                                {index + 1}
                                              </span>
                                              {renderTextWithLatex(q.question)}
                                            </div>
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            <div className="pl-9 pt-2 space-y-3">
                                              <div className="flex items-center text-sm bg-red-200 p-2 rounded">
                                                <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                                                <span className="text-gray-900 ml-1">
                                                  {q.user_choice}.{' '}
                                                  {renderTextWithLatex(
                                                    q.user_answer_text
                                                  )}
                                                </span>
                                              </div>
                                              <div className="flex items-center text-sm bg-green-200 p-2 rounded">
                                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                                <span className="text-gray-900 ml-1">
                                                  {q.correct_answer}.{' '}
                                                  {renderTextWithLatex(
                                                    q.correct_answer_text
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                          </AccordionContent>
                                        </AccordionItem>
                                      </motion.div>
                                    )
                                  )}
                                </Accordion>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="bg-white shadow-lg">
                            <CardHeader className="border-b border-gray-100">
                              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                                <Target className="h-6 w-6 text-[var(--color-primary)] mr-2" />
                                Weekly Progress
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                              {testError ||
                              !testAnalytics?.weekly_progress ||
                              testAnalytics.weekly_progress.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 text-gray-600">
                                  <p>{Messages.INSUFFICIENT_DATA}</p>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {testAnalytics.weekly_progress.map(
                                    (week: WeeklyProgress, index: number) => (
                                      <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                      >
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-sm font-medium text-gray-600">
                                            Week Starting:{' '}
                                            {new Date(
                                              week.week_start
                                            ).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                            })}
                                          </span>
                                          <span className="text-sm font-bold text-[var(--color-primary)]">
                                            {week.average_accuracy.toFixed(2)}%
                                          </span>
                                        </div>
                                        <Progress
                                          value={week.average_accuracy}
                                          className="h-2"
                                        />
                                      </motion.div>
                                    )
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="col-span-3 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="border-b border-gray-100 py-4">
                              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                                <GraduationCap className="h-5 w-5 text-[var(--color-primary)] mr-2" />
                                Latest Test Results
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                              {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-6">
                                  <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
                                  <p className="mt-3 text-sm text-gray-600">
                                    Loading latest results...
                                  </p>
                                </div>
                              ) : testError || !testAnalytics?.latest_test ? (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                                  <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
                                  <p className="text-lg">
                                    {Messages.NO_TEST_RESULTS}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Complete a test to see your results here
                                  </p>
                                </div>
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div className="mb-4">
                                    <p className="text-xs text-gray-500">
                                      Completed on{' '}
                                      {new Date(
                                        testAnalytics.latest_test.submitted_at
                                      ).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        hour12: true,
                                      })}
                                    </p>
                                  </div>

                                  <motion.div
                                    variants={staggerContainer}
                                    initial="initial"
                                    animate="animate"
                                    className="grid gap-4 md:grid-cols-3 mb-4"
                                  >
                                    <motion.div
                                      variants={fadeInUp}
                                      className="bg-white border hover:shadow-md transition-all duration-300 rounded-lg p-4 relative"
                                    >
                                      <Percent className="h-6 w-6 text-[var(--color-primary)] mb-2" />
                                      <h4 className="text-base font-semibold text-gray-700 mb-1">
                                        Accuracy
                                      </h4>
                                      <div className="flex items-baseline">
                                        <span className="text-2xl font-bold text-gray-900">
                                          {testAnalytics.latest_test.accuracy.toFixed(
                                            0
                                          )}
                                          %
                                        </span>
                                      </div>
                                      <p className="mt-1 text-xs text-gray-600">
                                        ({testAnalytics.latest_test.score}/
                                        {
                                          testAnalytics.latest_test
                                            .total_questions
                                        }{' '}
                                        correct)
                                      </p>
                                    </motion.div>

                                    <motion.div
                                      variants={fadeInUp}
                                      className="bg-white border hover:shadow-md transition-all duration-300 rounded-lg p-4 relative"
                                    >
                                      <Timer className="h-6 w-6 text-yellow-500 mb-2" />
                                      <h4 className="text-base font-semibold text-gray-700 mb-1">
                                        Time Spent
                                      </h4>
                                      <div className="flex items-baseline">
                                        <span className="text-2xl font-bold text-gray-900">
                                          {formatTime(
                                            testAnalytics.latest_test.time_taken
                                          )}
                                        </span>
                                        {testAnalytics.latest_test.time_taken <
                                          60 && (
                                          <span className="ml-1 text-xs text-gray-600">
                                            seconds
                                          </span>
                                        )}
                                      </div>
                                    </motion.div>

                                    <motion.div
                                      variants={fadeInUp}
                                      className="bg-white border hover:shadow-md transition-all duration-300 rounded-lg p-4 relative"
                                    >
                                      <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                                      <h4 className="text-base font-semibold text-gray-700 mb-1">
                                        Status
                                      </h4>
                                      <div className="flex items-baseline">
                                        <span className="text-2xl font-bold text-gray-900 capitalize">
                                          {testAnalytics.latest_test.status}
                                        </span>
                                      </div>
                                    </motion.div>
                                  </motion.div>
                                </motion.div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="guide-specific">
                      <GuideStats
                        selectedGuide={selectedGuide || null}
                        guideAnalytics={guideAnalytics || null}
                        allGuideAnalytics={
                          allGuideAnalytics?.study_guides || []
                        }
                        onPreviousGuide={handlePreviousGuide}
                        onNextGuide={handleNextGuide}
                        onSelectGuide={selectGuideById}
                      />
                    </TabsContent>

                    <TabsContent value="topic-mastery">
                      {masteryError ? (
                        <p className="text-red-500 text-center">
                          Error loading mastery data.
                        </p>
                      ) : !rawMasteryData ? (
                        <div className="flex justify-center items-center p-10">
                          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                          <p className="ml-3 text-lg text-gray-600">
                            Loading Topic Mastery...
                          </p>
                        </div>
                      ) : Object.keys(groupedMasteryData).length === 0 ? (
                        <p className="text-gray-600 text-center">
                          No topic mastery data available yet. Complete some
                          quizzes!
                        </p>
                      ) : (
                        <Accordion
                          type="multiple"
                          defaultValue={defaultAccordionValues}
                          className="w-full space-y-4"
                        >
                          {Object.entries(groupedMasteryData).map(
                            ([guideId, guideData], guideIndex) => (
                              <AccordionItem
                                key={guideId}
                                value={`guide-${guideId}`}
                                className="bg-white rounded-lg shadow-sm border border-gray-200"
                              >
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                  <span className="text-lg font-semibold text-gray-800">
                                    {guideData.title}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 pt-0">
                                  {Object.keys(guideData.chapters).length ===
                                  0 ? (
                                    <p className="text-gray-500 pt-4 border-t border-gray-100">
                                      No chapter data for this guide yet.
                                    </p>
                                  ) : (
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                      {Object.entries(guideData.chapters).map(
                                        ([chapterTitle, chapterData]) => (
                                          <div key={chapterTitle}>
                                            <h3 className="text-md font-semibold text-gray-700 mb-3">
                                              {chapterTitle}
                                            </h3>
                                            {chapterData.sections.length ===
                                            0 ? (
                                              <p className="text-sm text-gray-500 pl-2">
                                                No section data for this chapter
                                                yet.
                                              </p>
                                            ) : (
                                              <motion.div
                                                variants={staggerContainer}
                                                initial="initial"
                                                animate="animate"
                                                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                                              >
                                                {chapterData.sections.map(
                                                  (mastery) => (
                                                    <motion.div
                                                      key={`${mastery.studyGuideId}-${mastery.chapterTitle}-${mastery.sectionTitle}`}
                                                      variants={fadeInUp}
                                                    >
                                                      <TopicMasteryCard
                                                        studyGuideTitle={
                                                          mastery.studyGuideTitle
                                                        }
                                                        sectionTitle={
                                                          mastery.sectionTitle
                                                        }
                                                        masteryScore={
                                                          mastery.masteryScore
                                                        }
                                                        accuracy={
                                                          mastery.accuracy
                                                        }
                                                        recency={
                                                          mastery.recency
                                                        }
                                                        confidence={
                                                          mastery.confidence
                                                        }
                                                        questionCount={
                                                          mastery.questionCount
                                                        }
                                                        lastInteraction={
                                                          mastery.lastInteraction
                                                        }
                                                      />
                                                    </motion.div>
                                                  )
                                                )}
                                              </motion.div>
                                            )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            )
                          )}
                        </Accordion>
                      )}
                    </TabsContent>
                  </Tabs>
                </AnimatePresence>
              )}
            </div>
          </main>
        </div>
      </RouteGuard>
    </MathJaxContext>
  );
}
