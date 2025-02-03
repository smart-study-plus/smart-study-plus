import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';

const Timer = ({ duration }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-2xl font-mono font-bold text-gray-700">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

const QuestionCard = ({ question, onAnswerSelect, selectedAnswer }) => {
  const options = Array.isArray(question.options) ? question.options : 
    ['A', 'B', 'C', 'D'].map(letter => `Option ${letter}`); // Fallback options

  return (
    <div className="bg-[#FFE5E5] rounded-xl p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-800">
          Question {question.question_number || question.id}: {question.question_text || question.text}
        </h3>
        <div className="flex space-x-2">
          {question.has_code && (
            <button className="text-blue-500 hover:text-blue-700">
              <span role="img" aria-label="code">📝</span>
            </button>
          )}
          {question.has_image && (
            <button className="text-blue-500 hover:text-blue-700">
              <span role="img" aria-label="image">🖼️</span>
            </button>
          )}
        </div>
      </div>

      {question.code_snippet && (
        <pre className="bg-gray-800 text-white p-4 rounded-lg mb-4 overflow-x-auto">
          <code>{question.code_snippet}</code>
        </pre>
      )}

      {question.image_url && (
        <img 
          src={question.image_url} 
          alt="Question illustration" 
          className="mb-4 rounded-lg max-w-full h-auto"
        />
      )}

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(question.question_number || question.id, index)}
            className={`w-full text-left p-3 rounded-lg border transition-colors
              ${selectedAnswer === index 
                ? 'border-[#F4976C] bg-[#F4976C]/10' 
                : 'border-gray-200 hover:border-[#F4976C]'
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      {question.user_note_area && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Notes:</p>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Add your notes here..."
            rows="3"
          />
        </div>
      )}
    </div>
  );
};

const TestQuestion = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/tests/public/${testId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch test');
        }

        const data = await response.json();
        
        // Validate the response data
        if (!data || !data.questions || !Array.isArray(data.questions)) {
          throw new Error('Invalid test data received');
        }

        // Transform the data if needed
        const transformedData = {
          ...data,
          questions: data.questions.map((q, index) => ({
            ...q,
            id: q.id || index + 1,
            question_number: q.question_number || index + 1,
            question_text: q.question_text || q.text || `Question ${index + 1}`,
            options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D']
          }))
        };

        setTest(transformedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const handleAnswerSelect = (questionNumber, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: answerIndex
    }));
  };

  const handleSubmit = () => {
    console.log('Submitting answers:', answers);
    // Add API call to submit answers
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-[200px] bg-gray-200 rounded"></div>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
          <h3 className="font-medium mb-2">Error Loading Test</h3>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/test-mode')}
            className="mt-4 px-4 py-2 bg-[#F4976C] text-white rounded-md hover:bg-[#f3855c]"
          >
            Return to Test List
          </button>
        </div>
      </SidebarLayout>
    );
  }

  if (!test) return null;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {test.test_name || test.name || 'Test'}
            </h1>
            <Timer duration={test.duration || 30} />
          </div>
        </div>

        {test.questions.map((question) => (
          <QuestionCard
            key={question.id || question.question_number}
            question={question}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={answers[question.question_number || question.id]}
          />
        ))}

        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#F4976C] text-white rounded-full hover:bg-[#f3855c] transition-colors font-medium shadow-lg"
          >
            Submit Test
          </button>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TestQuestion; 