/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

interface HomeCardProps {
  title: string;
  icon: string;
  text: string;
}

const HomeCard = ({ title, icon, text }: HomeCardProps) => {
  return (
    <div className="rounded-xl p-6 flex-1 text-white bg-gradient-to-r from-[var(--color-primary)] to-orange-400">
      <div className="flex flex-col w-full">
        <div className="flex justify-between">
          <span className="text-xl font-bold">{title}</span>
          <span className="text-3xl font-bold">{icon}</span>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-lg">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeCard;
