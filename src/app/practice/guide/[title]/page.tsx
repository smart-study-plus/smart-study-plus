'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { createClient } from '@/utils/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Loading } from '@/components/ui/loading';
import { ENDPOINTS } from '@/config/urls';
import { ChevronLeft, CheckCircle, PlayCircle, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CompletedTest, TestResultsResponse } from '@/interfaces/test';
import { cn } from '@/lib/utils';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

// Define types for the new JSON structure
interface QuizChoice {
  question: string;
  choices: Record<string, string>;
  correct: string;
  explanation: string;
}

interface ShortAnswer {
  question: string;
  ideal_answer: string;
}

interface SectionQuiz {
  concept: string;
  quizzes: {
    multiple_choice: QuizChoice[];
    short_answer: ShortAnswer[];
  };
}

interface Section {
  title: string;
  key_concepts: string[];
  quizzes: SectionQuiz[];
  completed?: boolean;
  source_pages?: string[];
  source_texts?: string[];
}

interface Chapter {
  title: string;
  sections: Section[];
}

interface StudyGuideData {
  title: string;
  chapters: Chapter[];
  study_guide_id?: string;
}

interface TestMap {
  [key: string]: string;
}

// Add interface for practice test
interface PracticeTest {
  practice_test_id: string;
  section_title: string;
  questions: QuizChoice[];
  short_answer?: ShortAnswer[];
}

// Add interface for practice tests data
interface PracticeTestsData {
  practice_tests: PracticeTest[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

const fetcher = async (url: string) => {
  const supabase = createClient();
  const token = await supabase.auth
    .getSession()
    .then((res) => res.data.session?.access_token);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

const StudyGuidePage: React.FC = () => {
  const params = useParams();
  const title = typeof params.title === 'string' ? params.title : '';
  const router = useRouter();
  const supabase = createClient();
  const [generatingTests, setGeneratingTests] = useState<boolean>(false);

  const { data: userData } = useSWR('user', async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  });

  const userId = userData?.id;

  const { data: studyGuide, error: studyGuideError } = useSWR<StudyGuideData>(
    title ? ENDPOINTS.studyGuide(title) : null,
    fetcher
  );

  const { data: testsData, error: testsError } = useSWR(
    title ? ENDPOINTS.practiceTests(title) : null,
    fetcher
  );

  const { data: completedTestsData, error: completedError } = useSWR(
    userId && studyGuide ? ENDPOINTS.testResults(userId) : null,
    fetcher
  );

  const loading = !studyGuide || !testsData || !completedTestsData;
  const error = studyGuideError || testsError || completedError;

  const getErrorMessage = () => {
    if (studyGuideError) {
      return "We couldn't find this study guide. It may have been deleted or you may not have access to it.";
    }
    if (testsError) {
      return 'Failed to load practice tests for this study guide.';
    }
    if (completedError) {
      return 'Failed to load your progress data.';
    }
    return 'An unexpected error occurred.';
  };

  // Process the data
  const practiceTests = (testsData?.practice_tests.reduce(
    (acc: TestMap, test: PracticeTest) => {
      acc[test.section_title] = test.practice_test_id;
      return acc;
    },
    {} as TestMap
  ) || {}) as TestMap;

  const completedTests = new Set(
    completedTestsData?.test_results
      ?.filter(
        (test: CompletedTest) =>
          test.study_guide_id === studyGuide?.study_guide_id
      )
      .map((test: CompletedTest) => test.test_id) || []
  );

  const progress = (() => {
    if (!testsData?.practice_tests || !completedTestsData?.test_results)
      return 0;

    const totalTests = testsData.practice_tests.length;
    const completedCount = completedTests.size;

    return totalTests > 0 ? (completedCount / totalTests) * 100 : 0;
  })();

  // Process the study guide to add completion status to sections
  const processedGuide = studyGuide
    ? {
        ...studyGuide,
        chapters: studyGuide.chapters.map((chapter: Chapter) => ({
          ...chapter,
          sections: chapter.sections.map((section: Section) => ({
            ...section,
            completed: completedTests.has(practiceTests[section.title] || ''),
          })),
        })),
      }
    : null;

  const handleQuizClick = (testId: string): void => {
    if (!title) return;

    if (completedTests.has(testId)) {
      router.push(
        `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}/results`
      );
    } else {
      router.push(
        `/practice/guide/${encodeURIComponent(title)}/quiz/${testId}`
      );
    }
  };

  // Generate practice tests from the studyGuide data
  const generatePracticeTests = async () => {
    if (!studyGuide) return;

    try {
      setGeneratingTests(true);
      const token = await supabase.auth
        .getSession()
        .then((res) => res.data.session?.access_token);

      // Call the API to generate practice tests
      const response = await fetch('/api/practice-tests/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guide_id: studyGuide.study_guide_id }),
      });

      if (response.ok) {
        // Refresh the tests data after generating
        const newTestsData = await fetcher(ENDPOINTS.practiceTests(title));

        // Update the UI with the new tests
        if (newTestsData && newTestsData.practice_tests) {
          // Update practice tests mapping
          const newPracticeTests = newTestsData.practice_tests.reduce(
            (acc: TestMap, test: PracticeTest) => {
              acc[test.section_title] = test.practice_test_id;
              return acc;
            },
            {} as TestMap
          );

          // Force re-render
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error generating practice tests:', error);
    } finally {
      setGeneratingTests(false);
    }
  };

  // Update MathJax config with additional macros
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

        // Limits and sums
        '\\lim': '\\lim\\limits',
        '\\sum': '\\sum\\limits',
        '\\prod': '\\prod\\limits',
        '\\int': '\\int\\limits',

        // Additional statistical operators
        '\\Cov': '\\operatorname{Cov}',
        '\\Corr': '\\operatorname{Corr}',
        '\\SE': '\\operatorname{SE}',
        '\\Prob': '\\operatorname{P}',

        // Additional mathematical operators
        '\\argmax': '\\operatorname{arg\\,max}',
        '\\argmin': '\\operatorname{arg\\,min}',
        '\\trace': '\\operatorname{tr}',
        '\\diag': '\\operatorname{diag}',

        // Matrix notation
        '\\bm': ['\\boldsymbol{#1}', 1],
        '\\matrix': ['\\begin{matrix}#1\\end{matrix}', 1],
        '\\pmatrix': ['\\begin{pmatrix}#1\\end{pmatrix}', 1],
        '\\bmatrix': ['\\begin{bmatrix}#1\\end{bmatrix}', 1],

        // Additional decorators
        '\\underbar': ['\\underline{#1}', 1],
        '\\overbar': ['\\overline{#1}', 1],

        // Probability and statistics
        '\\iid': '\\stackrel{\\text{iid}}{\\sim}',
        '\\indep': '\\perp\\!\\!\\!\\perp',

        // Calculus
        '\\dd': '\\,\\mathrm{d}',
        '\\partial': '\\partial',
        '\\grad': '\\nabla',

        // Sets and logic
        '\\setminus': '\\backslash',
        '\\implies': '\\Rightarrow',
        '\\iff': '\\Leftrightarrow',

        // Spacing
        '\\negspace': '\\negmedspace{}',
        '\\thinspace': '\\thinspace{}',
        '\\medspace': '\\medspace{}',
        '\\thickspace': '\\thickspace{}',
        '\\quad': '\\quad{}',
        '\\qquad': '\\qquad{}',
      },
    },
    svg: {
      fontCache: 'global',
      scale: 1,
      minScale: 0.5,
      matchFontHeight: true,
      mtextInheritFont: true,
    },
    options: {
      enableMenu: false,
      menuOptions: {
        settings: {
          zoom: 'Click',
          zscale: '200%',
        },
      },
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
      renderActions: {
        addMenu: [],
        checkLoading: [],
      },
    },
  };

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

  // // Simple string hashing function for generating unique keys
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link
              href="/practice"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Practice
            </Link>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {studyGuide?.title ||
                    decodeURIComponent(title).replace(/_/g, ' ')}
                </h1>
                <p className="mt-2 text-gray-600">Study Guide Content</p>
              </div>

              {studyGuide?.study_guide_id && userId && (
                <Link
                  href={`/study-guide/${studyGuide.study_guide_id}/mastery`}
                >
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                  >
                    <BarChart className="h-4 w-4" />
                    View Topic Mastery
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          {loading ? (
            <Loading size="lg" text="Loading study guide..." />
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-200 max-w-2xl mx-auto"
            >
              <div className="text-center space-y-4">
                <p className="text-xl font-semibold text-red-600">
                  {getErrorMessage()}
                </p>
                <p className="text-gray-600">
                  You can try refreshing the page or going back to the practice
                  section.
                </p>
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="default"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try Again
                  </Button>
                  <Link href="/practice">
                    <Button variant="outline">Return to Practice</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-4 gap-8"
            >
              <motion.div
                variants={item}
                className="md:col-span-3 bg-white rounded-xl shadow-lg p-6 border-2 border-gray-300"
              >
                <Accordion
                  type="multiple"
                  defaultValue={['chapter-0']}
                  className="w-full space-y-4"
                >
                  {processedGuide?.chapters.map(
                    (chapter: Chapter, chapterIndex: number) => (
                      <motion.div key={chapterIndex} variants={item}>
                        <AccordionItem
                          value={`chapter-${chapterIndex}`}
                          className="border-2 border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden data-[state=open]:shadow-md"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:no-underline transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                                <BarChart className="h-5 w-5 text-[var(--color-primary)]" />
                              </div>
                              <span className="text-left font-semibold text-gray-900">
                                {chapter.title}
                              </span>
                            </div>
                          </AccordionTrigger>

                          <AccordionContent className="px-6 pb-6 pt-2">
                            <div className="space-y-3">
                              {chapter.sections.map(
                                (section: Section, sectionIndex: number) => (
                                  <motion.div
                                    key={sectionIndex}
                                    variants={item}
                                  >
                                    <AccordionItem
                                      value={`section-${chapterIndex}-${sectionIndex}`}
                                      className="border-2 border-gray-300 rounded-lg overflow-hidden hover:border-[var(--color-primary)]/50 transition-all duration-300 data-[state=open]:shadow-md data-[state=open]:border-[var(--color-primary)]/40"
                                    >
                                      <AccordionTrigger className="px-4 py-3 hover:no-underline transition-colors">
                                        <div className="flex items-center gap-3">
                                          <div
                                            className={cn(
                                              'p-1.5 rounded-lg transition-colors',
                                              section.completed
                                                ? 'bg-green-200'
                                                : 'bg-[var(--color-primary)]/10'
                                            )}
                                          >
                                            {section.completed ? (
                                              <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                              <PlayCircle className="h-4 w-4 text-[var(--color-primary)]" />
                                            )}
                                          </div>
                                          <span className="text-left font-medium text-gray-800">
                                            {section.title}
                                          </span>
                                        </div>
                                      </AccordionTrigger>

                                      <AccordionContent className="px-4 pb-4 pt-1">
                                        <div className="space-y-2.5">
                                          {/* Key Concepts */}
                                          {section.key_concepts && (
                                            <div className="space-y-2">
                                              <h4 className="font-medium text-gray-900">
                                                Key Concepts
                                              </h4>
                                              <ul className="list-disc list-inside space-y-2 text-gray-700">
                                                {section.key_concepts.map(
                                                  (concept, index) => (
                                                    <li key={index}>
                                                      {renderTextWithLatex(
                                                        concept
                                                      )}
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            </div>
                                          )}

                                          {/* Source Information */}
                                          {section.source_pages &&
                                            section.source_pages.length > 0 && (
                                              <div className="text-sm text-gray-500">
                                                Source Page
                                                {section.source_pages.length > 1
                                                  ? 's'
                                                  : ''}
                                                :{' '}
                                                {section.source_pages.join(
                                                  ', '
                                                )}
                                              </div>
                                            )}

                                          {/* Source Texts */}
                                          {section.source_texts &&
                                            section.source_texts.length > 0 && (
                                              <div className="space-y-2">
                                                {section.source_texts.map(
                                                  (text, index) => (
                                                    <div
                                                      key={index}
                                                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                    >
                                                      <p className="text-sm text-gray-600 italic leading-relaxed">
                                                        &ldquo;
                                                        {renderTextWithLatex(
                                                          text
                                                        )}
                                                        &rdquo;
                                                      </p>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            )}

                                          {/* Quiz Button or Generate Tests Button */}
                                          {practiceTests[section.title] ? (
                                            <div className="pt-4">
                                              <Button
                                                onClick={() =>
                                                  handleQuizClick(
                                                    practiceTests[section.title]
                                                  )
                                                }
                                                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-purple-400 text-white hover:from-[var(--color-primary)]/90 hover:to-purple-500/90 transition-all duration-300"
                                              >
                                                {completedTests.has(
                                                  practiceTests[section.title]
                                                )
                                                  ? 'View Results'
                                                  : 'Start Quiz'}
                                              </Button>
                                            </div>
                                          ) : (
                                            <div className="pt-4">
                                              <Button
                                                onClick={generatePracticeTests}
                                                disabled={generatingTests}
                                                className="w-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                                              >
                                                {generatingTests ? (
                                                  <div className="flex items-center gap-2">
                                                    <span className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full"></span>
                                                    <span>
                                                      Generating Tests...
                                                    </span>
                                                  </div>
                                                ) : (
                                                  'Generate Practice Tests'
                                                )}
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </motion.div>
                                )
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    )
                  )}
                </Accordion>

                {/* Global generating tests indicator */}
                {generatingTests && (
                  <div className="mt-6 p-4 bg-[var(--color-primary)]/5 rounded-lg text-center">
                    <Loading size="sm" text="Generating practice tests..." />
                  </div>
                )}
              </motion.div>

              <motion.div variants={item} className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-[var(--color-primary)]" />
                    Guide Info
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Chapters</p>
                      <p className="font-medium">
                        {studyGuide?.chapters?.length || 0} chapters available
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Sections</p>
                      <p className="font-medium">
                        {studyGuide?.chapters?.reduce(
                          (acc, chapter) =>
                            acc + (chapter.sections?.length || 0),
                          0
                        ) || 0}{' '}
                        sections
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Practice Tests
                      </p>
                      <p className="font-medium">
                        {testsData?.practice_tests?.length || 0} available
                      </p>
                    </div>
                    {testsData?.practice_tests?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-1">Progress</p>
                        <div className="flex justify-between">
                          <p className="font-medium">
                            {completedTests.size}/
                            {testsData.practice_tests.length} completed
                          </p>
                          <p className="font-medium text-[var(--color-primary)]">
                            {progress.toFixed(0)}%
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${progress}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
};

export default StudyGuidePage;
