'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { AuthForm } from '@/components/auth/auth-form';
import { useRouter } from 'next/navigation';
import { RouteGuard } from '@/components/auth/route-guard';


export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMethod, setAuthMethod] = useState<'signin' | 'signup' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
    <RouteGuard>
      <div className="flex min-h-screen flex-col bg-gray-50">
        {/* Auth Modal */}
        {showAuthModal && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div className="relative bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-3 right-3 bg-gray-100 rounded-full p-1 hover:bg-gray-200 transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
              <AuthForm method={authMethod} onSuccess={handleAuthSuccess} />
            </motion.div>
          </motion.div>
        )}

        {/* Header */}
        <motion.header className="sticky top-0 z-50 w-full bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">
                SmartStudy+
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">How It Works</Link>
              <Link href="#get-started" className="text-gray-600 hover:text-gray-900 transition">Get Started</Link>
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="lg" onClick={() => openAuthModal('signin')}>
                Log in
              </Button>
              <Button size="lg" className="bg-indigo-600 text-white" onClick={() => openAuthModal('signup')}>
                Sign up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-16 left-0 w-full bg-white shadow-md p-4 flex flex-col space-y-4"
            >
              <Link href="#features" className="text-gray-700 hover:text-gray-900" onClick={() => setMenuOpen(false)}>Features</Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-gray-900" onClick={() => setMenuOpen(false)}>How It Works</Link>
              <Link href="#get-started" className="text-gray-700 hover:text-gray-900" onClick={() => setMenuOpen(false)}>Get Started</Link>
              <Button variant="outline" size="lg" onClick={() => { openAuthModal('signin'); setMenuOpen(false); }}>
                Log in
              </Button>
              <Button size="lg" className="bg-indigo-600 text-white" onClick={() => { openAuthModal('signup'); setMenuOpen(false); }}>
                Sign up
              </Button>
            </motion.div>
          )}
        </motion.header>

        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Transform Your Study Materials Into Interactive Guides
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              SmartStudy+ converts your lecture slides into comprehensive study guides, complete with quizzes and progress tracking.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-indigo-600 text-white" onClick={() => openAuthModal('signup')}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-6 text-center">
          <p className="text-gray-600">&copy; {new Date().getFullYear()} Smart Study+. All rights reserved.</p>
        </footer>
      </div>
    </RouteGuard>
  );
}
