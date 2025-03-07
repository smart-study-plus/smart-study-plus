'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle,
  ClipboardCheck,
  BarChart3,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RiComputerLine } from 'react-icons/ri';
import { MdDashboard } from 'react-icons/md';
import { AuthForm } from '@/components/auth/auth-form';
import { useRouter } from 'next/navigation';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const hoverScale = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMethod, setAuthMethod] = useState<'signin' | 'signup' | null>(
    null
  );
  const router = useRouter();

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    router.push('/dashboard');
  };

  const openAuthModal = (method: 'signin' | 'signup') => {
    setAuthMethod(method);
    setShowAuthModal(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      {showAuthModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative"
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-2 -right-2 bg-[var(--color-background)] rounded-full p-1 hover:bg-[var(--color-gray-100)] transition-colors"
            >
              <X className="h-5 w-5 text-[var(--color-text)]" />
            </button>
            <AuthForm method={authMethod} onSuccess={handleAuthSuccess} />
          </motion.div>
        </motion.div>
      )}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 w-full border-b border-[var(--color-gray-200)] bg-white shadow-sm"
      >
        <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Brain className="h-8 w-8 text-[var(--color-primary)]" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-purple-600">
                SmartStudy+
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="#features"
                className="text-base font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-base font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              >
                How It Works
              </Link>
              <Link
                href="#get-started"
                className="text-base font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              >
                Get Started
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => openAuthModal('signin')}
                className="text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
              >
                Log in
              </Button>
              <Button
                size="lg"
                onClick={() => openAuthModal('signup')}
                className="bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </motion.header>
      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                <div className="inline-flex items-center rounded-lg bg-[var(--color-primary)]/10 px-3 py-1 text-sm text-[var(--color-primary)]">
                  <Sparkles className="mr-1 h-4 w-4" />
                  <span>AI-Powered Learning</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-[var(--color-text)]">
                  Transform Your Study Materials Into Interactive Guides
                </h1>
                <p className="max-w-[600px] text-lg text-[var(--color-text-secondary)] md:text-xl">
                  Smart Study+ uses AI to convert your lecture slides and PDFs
                  into comprehensive study guides with chapter-based quizzes,
                  progress analytics, and mock tests to master key concepts.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 hover:translate-y-1 transition-transform duration-300">
                  <Button
                    size="lg"
                    className="px-8 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                    onClick={() => openAuthModal('signup')}
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)]/20 p-4 shadow-lg flex items-center justify-center"
              >
                <RiComputerLine className="w-32 h-32 text-white/80" />
              </motion.div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="bg-[var(--color-background-alt)] py-20"
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              variants={fadeIn}
              initial="initial"
              animate="animate"
              className="mx-auto max-w-[58rem] text-center"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[var(--color-text)]">
                Intelligent Features for Effective Learning
              </h2>
              <p className="mt-4 text-[var(--color-text-secondary)] md:text-xl">
                Our platform analyzes your materials to create structured,
                comprehensive study guides.
              </p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                  <FileText className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[var(--color-text)]">
                  Smart Content Organization
                </h3>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  Automatically structures content into logical chapters and
                  sections based on your materials.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                  <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[var(--color-text)]">
                  Interactive Study Guides
                </h3>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  Transform static content into engaging study materials with
                  practice tests for each chapter.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                  <Brain className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[var(--color-text)]">
                  Comprehensive Mock Tests
                </h3>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  Generate full mock exams that combine concepts from all
                  chapters to test overall mastery.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: '-100px' }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)]/60 p-4 shadow-lg order-last lg:order-first flex items-center justify-center"
              >
                <MdDashboard className="w-32 h-32 text-white/80" />
              </motion.div>
              <motion.div
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ margin: '-100px' }}
                className="space-y-6"
              >
                <div className="inline-flex items-center rounded-lg bg-[var(--color-primary)]/10 px-3 py-1 text-sm text-[var(--color-primary)]">
                  <Sparkles className="mr-1 h-4 w-4" />
                  <span>Progress Tracking</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-[var(--color-text)]">
                  Track Your Learning Journey
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)]">
                  Monitor your progress with detailed analytics on your
                  dashboard. See which concepts you&apos;ve mastered and which
                  areas need more attention.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-[var(--color-primary)]" />
                    <span>
                      Visualize your progress across all study materials
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-[var(--color-primary)]" />
                    <span>
                      Identify knowledge gaps with concept mastery tracking
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-[var(--color-primary)]" />
                    <span>
                      Get personalized recommendations for further study
                    </span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-[var(--color-background-alt)] py-20"
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ margin: '-100px' }}
              className="mx-auto max-w-[58rem] text-center"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[var(--color-text)]">
                How SmartStudy+ Works
              </h2>
              <p className="mt-4 text-[var(--color-text-secondary)] md:text-xl">
                A complete learning system designed for student success
              </p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ margin: '-100px' }}
              className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3"
            >
              <motion.div
                variants={hoverScale}
                whileHover="hover"
                whileTap="tap"
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[var(--color-text)]">
                  Study Guides
                </h3>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  AI-generated study materials organized into chapters and
                  sections with key concepts highlighted.
                </p>
              </motion.div>
              <motion.div
                variants={hoverScale}
                whileHover="hover"
                whileTap="tap"
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[var(--color-text)]">
                  Practice Section
                </h3>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  Chapter-specific practice tests to reinforce your
                  understanding of individual concepts.
                </p>
              </motion.div>
              <motion.div
                variants={hoverScale}
                whileHover="hover"
                whileTap="tap"
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[var(--color-text)]">
                  Test & Analytics
                </h3>
                <p className="mt-2 text-[var(--color-text-secondary)]">
                  Comprehensive mock tests and detailed analytics to track your
                  progress and identify areas for improvement.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: '-100px' }}
          transition={{ duration: 0.5 }}
          id="get-started"
          className="bg-[var(--color-primary)] py-20"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-[58rem] text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Ready to Transform Your Study Experience?
              </h2>
              <p className="mt-4 text-white/90 md:text-xl">
                Join SmartStudy+ today and start creating intelligent study
                guides from your materials.
              </p>
            </div>
          </div>
        </motion.section>
      </main>
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-t border-[var(--color-gray-200)] py-8"
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-lg font-semibold text-[var(--color-text)]">
              Smart Study+
            </span>
          </div>
          <p className="text-center text-sm text-[var(--color-text-muted)] md:text-left">
            © {new Date().getFullYear()} Smart Study+. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
