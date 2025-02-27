'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/app/auth/fetchWithAuth';
import { BookOpen } from 'lucide-react';
import Sidebar from '@/components/layout/sidebar';

const PracticePage = () => {
  const [studyGuides, setStudyGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStudyGuides = async () => {
      try {
        const response = await fetchWithAuth(
          'http://localhost:8000/api/study-guide/all'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch study guides');
        }

        const data = await response.json();
        setStudyGuides(data.study_guides || []);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStudyGuides();
  }, []);

  const handleCardClick = (title) => {
    router.push(`/practice/guide/${encodeURIComponent(title)}`);
  };

  return (
    <div className="flex h-screen bg-[var(--color-background-alt)]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-text)]">Practice Mode</h1>
            <p className="text-[var(--color-text-secondary)]">
              Select a study guide to practice with
            </p>
          </div>

          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-[var(--color-text-secondary)]">Loading study guides...</p>
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studyGuides.map((title, index) => (
                    <div
                    key={index}
                    onClick={() => handleCardClick(title)}
                    className="bg-[var(--color-background)] rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-[var(--color-gray-200)] hover:border-[var(--color-primary)] group flex flex-col justify-between h-full"
                    >
                    <div>
                        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2 break-words">
                        {title}
                        </h2>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-auto">
                        Click to view study guide
                    </p>
                    </div>
                ))}
              </div>


              {studyGuides.length === 0 && (
                <div className="text-center p-8 bg-[var(--color-background)] rounded-xl border border-[var(--color-gray-200)]">
                  <BookOpen className="mx-auto text-[var(--color-text-secondary)]" size={48} />
                  <p className="mt-4 text-[var(--color-text-secondary)]">
                    No study guides available. Please check back later.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
