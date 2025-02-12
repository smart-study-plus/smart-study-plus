/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

import React from 'react';
import StatusCard from '@/components/dashboard/card-status';
import DailyCheckIn from '@/components/dashboard/card-daily';
import FrequentlyMissed from '@/components/dashboard/card-missed';
import RankingTable from '@/components/dashboard/ranking-table';

import getGreeting from '@/utils/greeter';
import getUser from '@/utils/supabase/get-user';
import Link from 'next/link';

const Dashboard = async () => {
  const greeting = getGreeting();
  const user = await getUser();

  return (
    <div className="space-y-8">
      <span className="text-2xl font-bold">
        {greeting} {user.user_metadata?.display_name}
      </span>
      <DailyCheckIn />

      <div className="bg-white p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Status</h2>
          </div>
          <div>
            <Link
              href="/study-guide"
              className="text-[var(--color-text-secondary)] underline hover:text-[var(--color-text)]"
            >
              View Study Guide →
            </Link>
          </div>
        </div>
        <div className="flex space-x-6">
          <StatusCard
            icon="📚"
            title="Lessons"
            count={42}
            total={72}
            color="orange"
          />
          <StatusCard
            icon="📝"
            title="Assignments"
            count={8}
            total={24}
            color="pink"
          />
          <StatusCard
            icon="✅"
            title="Tests"
            count={3}
            total={6}
            color="emerald"
          />
        </div>
      </div>

      <FrequentlyMissed />
      <RankingTable />
    </div>
  );
};

export default Dashboard;
