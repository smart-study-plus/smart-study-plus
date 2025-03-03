'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Brain,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle,
  ClipboardCheck,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RiComputerLine } from 'react-icons/ri';
import { MdDashboard } from 'react-icons/md';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-gray-200)] bg-[var(--color-background)] backdrop-blur supports-[backdrop-filter]:bg-[var(--color-background)]/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-[var(--color-primary)]" />
            <span className="text-xl font-bold text-[var(--color-text)]">
              Smart Study+
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              How It Works
            </Link>
            <Link
              href="#get-started"
              className="text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              Get Started
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Log in
            </Button>
            <Button size="sm">Sign up</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
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
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="px-8">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-muted p-4 shadow-lg flex items-center justify-center">
                <RiComputerLine className="w-32 h-32 text-primary/40" />
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="bg-[var(--color-background-alt)] py-20"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-[58rem] text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[var(--color-text)]">
                Intelligent Features for Effective Learning
              </h2>
              <p className="mt-4 text-[var(--color-text-secondary)] md:text-xl">
                Our platform analyzes your materials to create structured,
                comprehensive study guides.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
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
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="relative mx-auto aspect-video w-full max-w-xl overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-muted p-4 shadow-lg order-last lg:order-first flex items-center justify-center">
                <MdDashboard className="w-32 h-32 text-primary/40" />
              </div>
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-lg bg-[var(--color-primary)]/10 px-3 py-1 text-sm text-[var(--color-primary)]">
                  <Sparkles className="mr-1 h-4 w-4" />
                  <span>Progress Tracking</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-[var(--color-text)]">
                  Track Your Learning Journey
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)]">
                  Monitor your progress with detailed analytics on your
                  dashboard. See which concepts you've mastered and which areas
                  need more attention.
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
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-[var(--color-background-alt)] py-20"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-[58rem] text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-[var(--color-text)]">
                How Smart Study+ Works
              </h2>
              <p className="mt-4 text-[var(--color-text-secondary)] md:text-xl">
                A complete learning system designed for student success
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
              <div className="relative flex flex-col items-center text-center">
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
              </div>
              <div className="relative flex flex-col items-center text-center">
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
              </div>
              <div className="relative flex flex-col items-center text-center">
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
              </div>
            </div>
          </div>
        </section>

        <section id="get-started" className="bg-[var(--color-primary)] py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-[58rem] text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Ready to Transform Your Study Experience?
              </h2>
              <p className="mt-4 text-white/90 md:text-xl">
                Join Smart Study+ today and start creating intelligent study
                guides from your materials.
              </p>
              <Button size="lg" variant="secondary" className="mt-8 px-8">
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[var(--color-gray-200)] py-8">
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
      </footer>
    </div>
  );
}
