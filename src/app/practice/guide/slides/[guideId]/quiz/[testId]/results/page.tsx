'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { Header } from '@/components/layout/header';
import Link from 'next/link';
import { getUserId } from '@/app/auth/getUserId';
import { Loading } from '@/components/ui/loading';
import { ENDPOINTS } from '@/config/urls';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AIChat } from '@/components/practice/AIChat';
import { QuizQuestion, QuizResults } from '@/interfaces/test';
import { ResultCard } from '@/components/practice/ResultCard';
import { MathJaxContext } from 'better-react-mathjax';

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

const SlidesQuizResultsPage: React.FC = () => {
  const params = useParams();
  const testId = typeof params.testId === 'string' ? params.testId : '';
  const guideId = typeof params.guideId === 'string' ? params.guideId : '';
  const router = useRouter();

  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async (): Promise<void> => {
      if (!testId) return;

      try {
        const authUserId = await getUserId();
        if (!authUserId) throw new Error('User authentication required');

        const response = await fetchWithAuth(
          ENDPOINTS.testResults(authUserId, testId)
        );

        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data: QuizResults = await response.json();
        setResults(data);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, [testId]);

  return (
    <MathJaxContext config={mathJaxConfig}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/practice/guide/slides/${encodeURIComponent(guideId)}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Study Guide
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
            <p className="mt-2 text-gray-600">
              Review your answers and learn from the explanations
            </p>
          </div>

          {loading ? (
            <Loading size="lg" text="Loading results..." />
          ) : error ? (
            <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
              <p className="text-base text-red-500">Error: {error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="default"
              >
                Try Again
              </Button>
            </div>
          ) : (
            results && (
              <>
                <div className="grid gap-6 md:grid-cols-4 mb-8">
                  <Card
                    className={cn(
                      'bg-white shadow-lg hover:shadow-xl transition-all duration-300',
                      'border-l-4 border-l-blue-500'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Score
                        </h3>
                        <Trophy className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {results.score}
                        </span>
                        <span className="ml-2 text-gray-600">points</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      'bg-white shadow-lg hover:shadow-xl transition-all duration-300',
                      'border-l-4',
                      results.accuracy >= 70
                        ? 'border-l-green-500'
                        : 'border-l-yellow-500'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Accuracy
                        </h3>
                        <Target className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {results.accuracy.toFixed(0)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      'bg-white shadow-lg hover:shadow-xl transition-all duration-300',
                      'border-l-4',
                      'border-l-blue-500'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Time Taken
                        </h3>
                        <Clock className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {Math.round(results.time_taken)}
                        </span>
                        <span className="ml-2 text-gray-600">seconds</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={cn(
                      'bg-white shadow-lg hover:shadow-xl transition-all duration-300',
                      'border-l-4',
                      'border-l-green-500'
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Status
                        </h3>
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900 capitalize">
                          {results.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {results.questions.map((question, index) => (
                    <ResultCard
                      key={question.question_id}
                      questionNumber={index + 1}
                      isCorrect={question.is_correct === true}
                      userAnswer={
                        question.question_type === 'multiple_choice' &&
                        question.user_answer &&
                        question.choices
                          ? `${question.user_answer}. ${question.choices[question.user_answer]}`
                          : question.user_answer || ''
                      }
                      userAnswerText={
                        question.user_answer_text ||
                        (question.question_type === 'short_answer'
                          ? 'No answer provided'
                          : '')
                      }
                      correctAnswer={
                        question.question_type === 'multiple_choice' &&
                        question.correct_answer &&
                        question.choices
                          ? `${question.correct_answer}. ${question.choices[question.correct_answer]}`
                          : question.question_type === 'short_answer'
                            ? question.ideal_answer || ''
                            : question.correct_answer_text || ''
                      }
                      explanation={question.explanation || ''}
                      userId={results.user_id}
                      testId={testId}
                      questionId={question.question_id}
                      questionType={question.question_type}
                      question={question.question}
                      sourcePage={question.source_page}
                      sourceText={question.source_text}
                      reference_part={question.reference_part}
                      feedback={question.feedback}
                    />
                  ))}
                </div>
              </>
            )
          )}
        </main>
      </div>
    </MathJaxContext>
  );
};

export default SlidesQuizResultsPage;
