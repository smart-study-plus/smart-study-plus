'use client';

import React, { useEffect, useState } from 'react';
import TopicCard from '@/components/practice/card-topic';
import { Topic } from '@/interfaces/topic';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';

interface PracticeModule {
  module_id: string;
  name: string;
  chapters: any[];
}

const PracticeMode = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetchWithAuth(
          'http://localhost:8000/api/tests/practice-tests'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch topics');
        }

        const data: PracticeModule[] = await response.json();

        const transformedTopics: Topic[] = data.map((module, index) => ({
          id: index + 1,
          title: module.name,
          description: `Practice questions from ${module.name}`,
          progress: 0, // might want to fetch actual progress from an API
          module_id: module.module_id,
        }));

        setTopics(transformedTopics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const getIconForModule = (moduleName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Financial Markets and Products': '📈',
      'Quantitative Analysis': '📊',
      'Valuation and Risk Models': '💹',
      'Foundations of Risk Management': '🛡️',
    };
    return iconMap[moduleName] || '📚';
  };

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Practice Mode</h1>
        <p className="text-lg">
          Choose a topic to practice and improve your understanding
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
};

export default PracticeMode;
