'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';

interface Question {
  test_id: string;
  name: string;
  questions: string[];
  difficulty: string;
  created_at: string;
}

interface Chapter {
  chapter_id: string;
  name: string;
  practice_tests: Question[];
}

interface ModuleData {
  module_id: string;
  name: string;
  chapters: Chapter[];
}

const ModulePracticePage = () => {
  const router = useRouter();
  const { moduleId } = useParams() as { moduleId: string };
  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openChapters, setOpenChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPracticeTests = async () => {
      try {
        const response = await fetchWithAuth(
          `http://localhost:8000/api/tests/practice-tests/module/${moduleId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch practice tests');
        }

        const data = await response.json();
        setModuleData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeTests();
  }, [moduleId]);

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const handleStartTest = (testId: string) => {
    router.push(`/practice/test/${testId}`);
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!moduleData) {
    return <div className="text-center p-8">No data available</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">{moduleData.name}</h1>
      </div>

      <div className="space-y-4">
        {moduleData.chapters.map((chapter) => (
          <div
            key={chapter.chapter_id}
            className="border border-[var(--color-gray-200)] rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleChapter(chapter.chapter_id)}
              className="w-full px-6 py-4 text-left bg-[var(--color-background)] hover:bg-[var(--color-background-alt)] flex justify-between items-center text-[var(--color-text)]"
            >
              <span className="font-medium">{chapter.name}</span>
              <span className="transform transition-transform duration-200">
                {openChapters.has(chapter.chapter_id) ? '▼' : '▶'}
              </span>
            </button>

            {openChapters.has(chapter.chapter_id) && (
              <div className="bg-[var(--color-background-alt)] px-6 py-4">
                <div className="space-y-3">
                  {chapter.practice_tests.map((test, index) => (
                    <div
                      key={test.test_id}
                      className="flex items-center justify-between bg-[var(--color-background)] p-4 rounded-lg shadow-sm"
                    >
                      <div>
                        <h3 className="font-medium text-[var(--color-text)]">
                          Test {index + 1}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {test.questions.length} questions • {test.difficulty}
                        </p>
                      </div>
                      <button
                        onClick={() => handleStartTest(test.test_id)}
                        className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                      >
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulePracticePage;
