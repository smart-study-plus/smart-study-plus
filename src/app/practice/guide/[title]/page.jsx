'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import Sidebar from '@/components/layout/sidebar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const StudyGuidePage = () => {
  const { title } = useParams();
  const router = useRouter();
  const [studyGuide, setStudyGuide] = useState(null);
  const [practiceTests, setPracticeTests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both study guide and practice tests in parallel
        const [guideResponse, testsResponse] = await Promise.all([
          fetchWithAuth(`http://localhost:8000/api/study-guide/${encodeURIComponent(title)}`),
          fetchWithAuth(`http://localhost:8000/api/study-guide/practice-tests/${encodeURIComponent(title)}`)
        ]);
        
        if (!guideResponse.ok || !testsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [guideData, testsData] = await Promise.all([
          guideResponse.json(),
          testsResponse.json()
        ]);

        // Create a map of section titles to test IDs for easy lookup
        const testMap = testsData.practice_tests.reduce((acc, test) => {
          acc[test.section_title] = test.practice_test_id;
          return acc;
        }, {});

        setStudyGuide(guideData);
        setPracticeTests(testMap);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [title]);

  const handleQuizClick = (testId) => {
    router.push(`/practice/guide/${encodeURIComponent(title)}/quiz/${testId}`);
  };

  return (
    <div className="flex h-screen bg-[var(--color-background-alt)]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[var(--color-text)]">
              {decodeURIComponent(title).replace(/_/g, ' ')}
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] mt-2">
              Study guide content
            </p>
          </div>

          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-[var(--color-text-secondary)]">Loading study guide...</p>
            </div>
          ) : error ? (
            <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-500">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {studyGuide?.chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex} className="bg-[var(--color-background)] rounded-xl p-8 shadow-sm">
                  <h2 className="text-3xl font-semibold text-[var(--color-text)] mb-6">
                    {chapter.title}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-6">
                    {chapter.sections.map((section, sectionIndex) => (
                      <AccordionItem 
                        key={sectionIndex} 
                        value={`section-${chapterIndex}-${sectionIndex}`}
                        className="border-2 border-[var(--color-gray-200)] rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:bg-[var(--color-background-alt)] text-xl font-medium">
                          {section.title}
                        </AccordionTrigger>
                        <AccordionContent className="px-6 py-4">
                          <ul className="space-y-4">
                            {section.concepts.map((concept, conceptIndex) => (
                              <li 
                                key={conceptIndex}
                                className="flex items-center text-lg text-[var(--color-text)] p-3 rounded-lg hover:bg-[var(--color-background-alt)]"
                              >
                                <span className="mr-3 text-xl">•</span>
                                {concept.concept}
                              </li>
                            ))}
                          </ul>
                          {practiceTests[section.title] && (
                            <button
                              onClick={() => handleQuizClick(practiceTests[section.title])}
                              className="mt-6 w-full px-6 py-4 text-lg font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                            >
                              View Quiz for {section.title}
                            </button>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyGuidePage;