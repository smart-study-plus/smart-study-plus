import React, { useState, useEffect } from 'react';
import SidebarLayout from '../components/layout/SidebarLayout';
import { useNavigate } from 'react-router-dom';

const TestCard = ({ test, onStart, onShowResults }) => {
  const isCompleted = test.attempts > 0;

  return (
    <div className="bg-[#FFE5E5] rounded-xl p-6 border border-[#FFD1D1]">
      <h3 className="text-xl font-bold mb-4">{test.test_name}</h3>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">⏱</span>
          <span>Time: {test.duration} minutes</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">📝</span>
          {/* <span>Number of Questions: {test.total_questions}</span> */}
          <span>Number of Questions: 10</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">🔄</span>
          <span>Attempts: {test.attempts || 1}</span>
        </div>
        {test.last_score && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">✅</span>
            <span>Last Score: {test.last_score}/100</span>
          </div>
        )}
      </div>
      <div className="mt-6">
        {test.completed ? (
          <button
            onClick={() => onShowResults(test.test_id)}
            className="px-6 py-2 bg-[#F4976C] text-white rounded-full hover:bg-[#f3855c] transition-colors"
          >
            Show Results
          </button>
        ) : (
          <button
            onClick={() => onStart(test.test_id)}
            className="px-6 py-2 bg-[#F4976C] text-white rounded-full hover:bg-[#f3855c] transition-colors"
          >
            Start Test
          </button>
        )}
      </div>
    </div>
  );
};

const LoadingCard = () => (
  <div className="bg-[#FFE5E5] rounded-xl p-6 border border-[#FFD1D1] animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
    <div className="mt-6">
      <div className="h-10 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
);

const TestMode = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/tests/public?skip=0&limit=10');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tests');
        }

        const data = await response.json();
        setTests(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleStartTest = (testId) => {
    navigate(`/test/${testId}`);
  };

  const handleShowResults = (testId) => {
    console.log(`Showing results for test ${testId}`);
    // Add navigation to results page
  };

  return (
    <SidebarLayout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-[#F4976C] to-[#F28B4B] rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-4">Mock Tests</h1>
          <p className="text-lg mb-2">
            Description of the test: Number of Questions + Time given
          </p>
          <p className="text-sm opacity-80">
            The test will only be attempted once.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            tests.map((test) => (
              <TestCard
                key={test.test_id}
                test={test}
                onStart={handleStartTest}
                onShowResults={handleShowResults}
              />
            ))
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TestMode; 