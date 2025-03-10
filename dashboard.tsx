'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Brain,
  Clock,
  Target,
  Award,
  ChevronDown,
  BarChart3,
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// This would come from your backend
const recentlyMissedQuestions = [
  {
    id: 1,
    question: 'Why is consistency an important property for an estimator?',
    yourAnswer: 'B',
    correctAnswer: 'A',
  },
  {
    id: 2,
    question:
      'How does convergence in probability relate to almost sure convergence?',
    yourAnswer: 'C',
    correctAnswer: 'B',
  },
  {
    id: 3,
    question:
      'Which of the following is an implication of the Law of Large Numbers?',
    yourAnswer: 'A',
    correctAnswer: 'C',
  },
  {
    id: 4,
    question: 'How does the Law of Large Numbers relate to gambling?',
    yourAnswer: 'D',
    correctAnswer: 'B',
  },
];

const weeklyProgress = [
  {
    week: 'Mar 6, 2025',
    progress: 33.33,
  },
  {
    week: 'Mar 7, 2025',
    progress: 22.22,
  },
  {
    week: 'Mar 8, 2025',
    progress: 55.56,
  },
];

// Study guides data
const studyGuides = [
  {
    id: 'properties-of-point-estimators',
    title: 'Properties of Point Estimators and Methods of Estimation',
    description:
      'In-depth study of statistical estimation methods and their properties',
    progress: 28.57,
    stats: {
      testsTaken: 3,
      averageScore: 3.2,
      accuracy: 64,
      studyTime: 4.5,
    },
    performanceData: [
      { date: 'Mar 3', score: 2.8, accuracy: 56 },
      { date: 'Mar 5', score: 3.2, accuracy: 64 },
      { date: 'Mar 8', score: 3.6, accuracy: 72 },
    ],
    recentlyMissedQuestions: [
      {
        id: 1,
        question: 'Why is consistency an important property for an estimator?',
        yourAnswer: 'B',
        correctAnswer: 'A',
        section: 'Consistency',
      },
      {
        id: 2,
        question:
          'How does convergence in probability relate to almost sure convergence?',
        yourAnswer: 'C',
        correctAnswer: 'B',
        section: 'Consistency',
      },
    ],
    latestTest: {
      date: 'Mar 8, 2025',
      score: 3.6,
      accuracy: 72,
      timeSpent: '18 minutes',
      questions: [
        {
          id: 1,
          question: 'What is the definition of a Consistent estimator?',
          correct: true,
          yourAnswer: 'A',
        },
        {
          id: 2,
          question:
            'Which of the following properties must a consistent estimator possess?',
          correct: true,
          yourAnswer: 'B',
        },
        {
          id: 3,
          question: 'What is the relationship between consistency and bias?',
          correct: false,
          yourAnswer: 'A',
          correctAnswer: 'C',
        },
      ],
    },
  },
  {
    id: 'bishop-pattern-recognition',
    title: 'Bishop - Pattern Recognition and Machine Learning',
    description:
      'Comprehensive guide covering pattern recognition and machine learning fundamentals',
    progress: 14.29,
    stats: {
      testsTaken: 1,
      averageScore: 2.8,
      accuracy: 56,
      studyTime: 2.5,
    },
    performanceData: [{ date: 'Mar 4', score: 2.8, accuracy: 56 }],
    recentlyMissedQuestions: [
      {
        id: 1,
        question:
          'What is the primary advantage of using Bayesian methods in machine learning?',
        yourAnswer: 'C',
        correctAnswer: 'A',
        section: 'Bayesian Methods',
      },
    ],
    latestTest: {
      date: 'Mar 4, 2025',
      score: 2.8,
      accuracy: 56,
      timeSpent: '22 minutes',
      questions: [
        {
          id: 1,
          question:
            'What is the primary advantage of using Bayesian methods in machine learning?',
          correct: false,
          yourAnswer: 'C',
          correctAnswer: 'A',
        },
        {
          id: 2,
          question:
            'Which of the following is a key component of the EM algorithm?',
          correct: true,
          yourAnswer: 'B',
        },
      ],
    },
  },
];

export default function DashboardPage() {
  const [selectedGuideIndex, setSelectedGuideIndex] = useState(0);
  const selectedGuide = studyGuides[selectedGuideIndex];

  const handlePreviousGuide = () => {
    setSelectedGuideIndex((prev) =>
      prev === 0 ? studyGuides.length - 1 : prev - 1
    );
  };

  const handleNextGuide = () => {
    setSelectedGuideIndex((prev) =>
      prev === studyGuides.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                SmartStudy+
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/dashboard"
                className="text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/practice"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Practice
              </Link>
              <Link
                href="/dashboard/tests"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tests
              </Link>
            </nav>
            <Button
              variant="outline"
              className="hover:bg-gray-100 transition-colors"
            >
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome back, Quang!
          </h1>
          <p className="text-xl text-gray-600">
            Let's boost your learning today.
          </p>
        </div>

        <Tabs defaultValue="overall" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="overall">Overall Stats</TabsTrigger>
            <TabsTrigger value="guide-specific">
              Guide-Specific Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overall">
            <div className="grid gap-8 md:grid-cols-3 mb-12">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-300/20 rounded-bl-full"></div>
                  <Clock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Total Study Time
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      48.36
                    </span>
                    <span className="ml-2 text-gray-600">hours this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-200/30 to-orange-300/30 rounded-bl-full"></div>
                  <Target className="h-8 w-8 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Average Score
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      3.20
                    </span>
                    <span className="ml-2 text-gray-600">points</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-bl-full"></div>
                  <Award className="h-8 w-8 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Tests Taken
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">3</span>
                    <span className="ml-2 text-gray-600">total</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card className="bg-white shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Recently Missed Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {recentlyMissedQuestions.map((item, index) => (
                        <button
                          key={item.id}
                          className="w-full text-left group hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-start gap-3 p-4">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-gray-900 font-medium">
                                {item.question}
                              </p>
                            </div>
                            <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white shadow-lg h-fit">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Weekly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {weeklyProgress.map((week, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Week Starting: {week.week}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {week.progress}%
                          </span>
                        </div>
                        <Progress value={week.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guide-specific">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviousGuide}
                    className="rounded-full p-2 h-8 w-8 flex items-center justify-center"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedGuide.title}
                    </h2>
                    <p className="text-gray-600">{selectedGuide.description}</p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleNextGuide}
                    className="rounded-full p-2 h-8 w-8 flex items-center justify-center"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-lg font-semibold text-primary">
                    {selectedGuide.progress}%
                  </p>
                </div>
                <div className="w-32">
                  <Progress value={selectedGuide.progress} className="h-2" />
                </div>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-4 mb-8">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-300/20 rounded-bl-full"></div>
                  <Clock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Study Time
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {selectedGuide.stats.studyTime}
                    </span>
                    <span className="ml-2 text-gray-600">hours</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-200/30 to-orange-300/30 rounded-bl-full"></div>
                  <Target className="h-8 w-8 text-yellow-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Average Score
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {selectedGuide.stats.averageScore}
                    </span>
                    <span className="ml-2 text-gray-600">points</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-bl-full"></div>
                  <Award className="h-8 w-8 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Tests Taken
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {selectedGuide.stats.testsTaken}
                    </span>
                    <span className="ml-2 text-gray-600">total</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-bl-full"></div>
                  <BarChart3 className="h-8 w-8 text-blue-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Accuracy
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {selectedGuide.stats.accuracy}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="performance" className="mb-8">
              <TabsList className="mb-6">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="missed-questions">
                  Missed Questions
                </TabsTrigger>
                <TabsTrigger value="latest-test">Latest Test</TabsTrigger>
              </TabsList>

              <TabsContent value="performance">
                <Card className="bg-white shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-80 flex items-center justify-center">
                      {/* This would be a chart in a real implementation */}
                      <div className="w-full h-full p-4 relative">
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-200"></div>
                        <div className="absolute top-0 left-0 h-full w-[1px] bg-gray-200"></div>

                        {/* Y-axis labels */}
                        <div className="absolute top-0 left-[-30px] text-xs text-gray-500">
                          5.0
                        </div>
                        <div className="absolute top-1/4 left-[-30px] text-xs text-gray-500">
                          3.75
                        </div>
                        <div className="absolute top-1/2 left-[-30px] text-xs text-gray-500">
                          2.5
                        </div>
                        <div className="absolute top-3/4 left-[-30px] text-xs text-gray-500">
                          1.25
                        </div>
                        <div className="absolute bottom-[-20px] left-[-30px] text-xs text-gray-500">
                          0
                        </div>

                        {/* X-axis labels */}
                        {selectedGuide.performanceData.map((data, index) => (
                          <div
                            key={index}
                            className="absolute bottom-[-20px] text-xs text-gray-500"
                            style={{
                              left: `${(index / (selectedGuide.performanceData.length - 1)) * 100}%`,
                            }}
                          >
                            {data.date}
                          </div>
                        ))}

                        {/* Score line */}
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <polyline
                            points={selectedGuide.performanceData
                              .map(
                                (data, index) =>
                                  `${(index / (selectedGuide.performanceData.length - 1)) * 100},${100 - (data.score / 5) * 100}`
                              )
                              .join(' ')}
                            fill="none"
                            stroke="hsl(164, 59%, 35%)"
                            strokeWidth="2"
                          />
                          {selectedGuide.performanceData.map((data, index) => (
                            <circle
                              key={index}
                              cx={`${(index / (selectedGuide.performanceData.length - 1)) * 100}`}
                              cy={`${100 - (data.score / 5) * 100}`}
                              r="2"
                              fill="hsl(164, 59%, 35%)"
                            />
                          ))}
                        </svg>

                        {/* Accuracy line */}
                        <svg
                          className="w-full h-full absolute top-0 left-0"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <polyline
                            points={selectedGuide.performanceData
                              .map(
                                (data, index) =>
                                  `${(index / (selectedGuide.performanceData.length - 1)) * 100},${100 - (data.accuracy / 100) * 100}`
                              )
                              .join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                          />
                          {selectedGuide.performanceData.map((data, index) => (
                            <circle
                              key={index}
                              cx={`${(index / (selectedGuide.performanceData.length - 1)) * 100}`}
                              cy={`${100 - (data.accuracy / 100) * 100}`}
                              r="2"
                              fill="#3b82f6"
                            />
                          ))}
                        </svg>
                      </div>
                    </div>

                    <div className="flex justify-center gap-6 mt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Score (out of 5)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Accuracy (%)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="missed-questions">
                <Card className="bg-white shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Recently Missed Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {selectedGuide.recentlyMissedQuestions.map(
                        (item, index) => (
                          <button
                            key={item.id}
                            className="w-full text-left group hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-start gap-3 p-4">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-medium flex-shrink-0">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <p className="text-gray-900 font-medium">
                                  {item.question}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Section: {item.section}
                                </p>
                              </div>
                              <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="latest-test">
                <Card className="bg-white shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Latest Test Results
                      </CardTitle>
                      <div className="text-sm text-gray-500">
                        {selectedGuide.latestTest.date}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Score
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedGuide.latestTest.score}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Accuracy
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedGuide.latestTest.accuracy}%
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Time Spent
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedGuide.latestTest.timeSpent}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Questions
                    </h3>
                    <div className="space-y-4">
                      {selectedGuide.latestTest.questions.map((question) => (
                        <div
                          key={question.id}
                          className={cn(
                            'p-4 rounded-lg border',
                            question.correct
                              ? 'border-l-4 border-l-green-500 bg-green-50/30'
                              : 'border-l-4 border-l-red-500 bg-red-50/30'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={cn(
                                'flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium flex-shrink-0',
                                question.correct
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-600'
                              )}
                            >
                              {question.id}
                            </span>
                            <div>
                              <p className="text-gray-900 font-medium">
                                {question.question}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-4">
                                <div className="text-sm">
                                  <span className="text-gray-600">
                                    Your answer:{' '}
                                  </span>
                                  <span
                                    className={cn(
                                      'font-medium',
                                      question.correct
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    )}
                                  >
                                    {question.yourAnswer}
                                  </span>
                                </div>

                                {!question.correct && (
                                  <div className="text-sm">
                                    <span className="text-gray-600">
                                      Correct answer:{' '}
                                    </span>
                                    <span className="font-medium text-green-600">
                                      {question.correctAnswer}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                      <Button className="bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-600/90">
                        View Full Results
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                View Study Guide
              </Button>
              <Button className="bg-gradient-to-r from-primary to-purple-600 text-white hover:from-primary/90 hover:to-purple-600/90">
                Take Practice Test
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
