import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { FaUserCircle, FaBookOpen, FaQuestionCircle, FaClipboardList, FaRobot, FaChartLine, FaLightbulb } from 'react-icons/fa';

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section className="bg-white rounded-xl shadow p-6 mb-8 border border-zinc-200">
    <div className="flex items-center mb-3">
      <span className="text-2xl mr-3 text-primary">{icon}</span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
    <div className="text-zinc-700 text-base">{children}</div>
  </section>
);

const HelpPage = () => (
  <AppLayout>
    <div className="max-w-2xl mx-auto p-6 sm:p-10">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <span role="img" aria-label="book">📚</span> Help Center
      </h1>
      <p className="mb-8 text-zinc-600">Find answers to common questions and tips for making the most of your study experience.</p>

      <Section icon={<FaUserCircle />} title="About Your Account">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Sign Up:</b> Create an account easily with your name, email, and password.</li>
          <li><b>Login:</b> Use your email and password to securely sign in.</li>
          <li><b>Reset Password:</b> Forgot your password? You can reset it anytime from the settings page.</li>
        </ul>
      </Section>

      <Section icon={<FaBookOpen />} title="Studying & Learning">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Diagnostic Test:</b> When you first join, you&apos;ll take a diagnostic test. This helps us understand your starting point and personalize your roadmap.</li>
          <li><b>Roadmap:</b> Based on your diagnostic and goals, you&apos;ll receive a <b>custom study plan</b> with milestones and target dates.</li>
          <li><b>Topics:</b> Learn topic-by-topic. Each topic groups related practice questions and study material (like &quot;Risk Measurement&quot; or &quot;Derivatives Pricing&quot;).</li>
        </ul>
      </Section>

      <Section icon={<FaQuestionCircle />} title="Practice Questions">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Questions Library:</b> Access a library of both real and AI-generated questions. Questions come with 4 options (A–D), and full explanations after you answer.</li>
          <li><b>Question Features:</b>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>Some questions may include diagrams or figures.</li>
              <li>Each question is tagged by topic for easier tracking.</li>
              <li>Explanations are provided after submission to help you learn.</li>
            </ul>
          </li>
        </ul>
      </Section>

      <Section icon={<FaClipboardList />} title="Taking Tests">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Test Types:</b>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li><b>Diagnostic Tests:</b> To assess your starting point.</li>
              <li><b>Mock Tests:</b> Simulate real exam conditions.</li>
              <li><b>Custom Tests:</b> Create your own tests from selected topics.</li>
            </ul>
          </li>
          <li><b>Submitting a Test:</b> After answering all questions, submit the test to instantly see your score and feedback.</li>
          <li><b>Reviewing Results:</b> After each test, you can review your answers vs. correct answers, detailed explanations, and your overall score and progress history.</li>
        </ul>
      </Section>

      <Section icon={<FaRobot />} title="AI Assistance">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>AI Feedback (Coming Soon):</b> You&apos;ll be able to request AI-generated explanations for any question you got wrong, with suggestions for improvement!</li>
        </ul>
      </Section>

      <Section icon={<FaChartLine />} title="Progress Tracking">
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Study Log:</b> Your learning sessions are automatically logged, so you can track daily progress by topic and percentage completed.</li>
          <li><b>Performance History:</b> See how your scores improve across all tests you&apos;ve taken over time.</li>
        </ul>
      </Section>

      <Section icon={<FaLightbulb />} title="Quick Tips">
        <ul className="list-disc pl-5 space-y-1">
          <li>Switch between <b>Learn Mode</b> and <b>Test Mode</b> based on your preference.</li>
          <li>Complete milestones on your roadmap to stay on track.</li>
          <li>Review test feedback to strengthen weak areas.</li>
        </ul>
      </Section>
    </div>
  </AppLayout>
);

export default HelpPage;
