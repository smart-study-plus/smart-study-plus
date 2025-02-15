/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import HomeCard from '@/components/home/home-card';
import TopicCard from '@/components/practice/card-topic';
import React from 'react';
import { Topic } from '@/interfaces/topic';

export const metadata: Metadata = {
  title: 'Home - SmartStudy+',
};

const Home = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect('/dashboard');
  }

  // this will be dynamic eventually
  const topics: Topic[] = [
    {
      id: 1,
      title: 'Instagram Influencing',
      description: 'A Guide on Becoming Homeless',
      icon: '📈',
    },
    {
      id: 2,
      title: 'Tax Evasion Strategies',
      description: 'Hiding Your Fortune in a Swiss Bank Account',
      icon: '💼',
    },
    {
      id: 3,
      title: 'National Treasure',
      description:
        "Stealing the World's Most Valuable Artifacts and Selling them on the Black Market",
      icon: '🖋️',
    },
    {
      id: 4,
      title: 'Cat Cafe Management',
      description: "How To Keep the Cats Off Your Customer's Food",
      icon: '🍵',
    },
  ];

  return (
    <div>
      <header className="min-h-[40vh] bg-[url(/background-header.jpg)] bg-cover bg-center flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl drop-shadow-sm font-bold m-6 text-white">
          Learn Smarter, Not Harder
        </h1>
        <p className="text-l font-medium text-white mb-8 drop-shadow-sm max-w-2xl">
          SmartStudy+ helps you master your subjects with personalized learning
          paths, interactive exercises, and smart study tools.
        </p>
        <div className="flex gap-4 mb-6">
          <Link
            href="/auth?m=signup"
            className="px-8 py-3 rounded-full drop-shadow-sm bg-[var(--color-secondary)] text-white text-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </header>
      <div className="min-h-[30vh] min-w-full flex flex-col bg-[var(--color-background-alt)] px-4">
        <h2 className="mt-10 mx-4 md:ml-[10vw] text-4xl font-bold text-[var(--color-primary)]">
          Features
        </h2>
        <div className="flex flex-col lg:flex-row mx-4 md:mx-[10vw] gap-6 my-6">
          <HomeCard
            title="Neuroplasticity Hack"
            icon="👽"
            text="Our proprietary algorithm rewires your brain to learn new information at an exponential rate, allowing you to master entire subjects in a matter of minutes."
          />
          <HomeCard
            title="Dream Incubator"
            icon="🛰️"
            text="We use advanced brain-wave technology to induce lucid dreaming, allowing you to study and learn new material while you sleep, and even take practice quizzes in your subconscious mind."
          />
          <HomeCard
            title="Quantum Exam Generator"
            icon="👨‍🌾"
            text="Our platform uses quantum entanglement to generate mock exams that adapt to your learning style in real-time, even if you're not consciously aware of what you need to study, and can predict your test scores with 100% accuracy."
          />
        </div>
        <p className="text-center mb-6 mx-4 md:mx-[10vw]">
          By using our platform, you acknowledge that you may be transformed
          into a being of pure energy and forced to study calculus for eternity,
          and you hereby release us from any liability for damages resulting
          from spontaneous combustion, temporal paradoxes, or other unforeseen
          consequences.
        </p>
      </div>
      <div className="min-h-[30vh] min-w-full flex flex-col pt-4 mb-6">
        <h2 className="mt-10 ml-4 md:ml-[10vw] text-4xl font-bold text-[var(--color-secondary)]">
          Trending Topics
        </h2>
        <div className="flex flex-col lg:flex-row items-stretch mx-4 md:mx-[10vw] gap-6 mt-6">
          {topics.map((topic) => (
            <div key={topic.id} className="flex-1">
              <TopicCard key={topic.id} topic={topic} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col grow gap-6 bg-[url(/background-calltoaction.avif)] bg-cover bg-center">
        <h2 className="mt-10 md:mt-24 text-center drop-shadow-md text-4xl font-extrabold text-white">
          Ready to learn?
        </h2>
        <div className="flex mt-6 mb-10 md:mb-24 self-center">
          <Link
            href="/auth?m=signup"
            className="px-8 py-3 rounded-full bg-[var(--color-primary)] text-white text-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Let&#39;s go!
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Home;
