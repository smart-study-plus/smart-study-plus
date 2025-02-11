/*
 * Copyright (c) 2025 SSP Team (Peyton, Alex, Jackson, Yousif)
 */

export default function getGreeting() {
  const greetingType = Math.floor(Math.random() * 2);

  if (greetingType) {
    const currentHour = new Date().getHours();
    let greeting = '';
    if (currentHour >= 5 && currentHour < 12) {
      greeting = 'Good morning, ';
    } else if (currentHour >= 12 && currentHour < 18) {
      greeting = 'Good afternoon, ';
    } else if (currentHour >= 18 && currentHour < 22) {
      greeting = 'Good evening, ';
    } else {
      greeting = 'Have a good day, ';
    }
    return greeting;
  } else {
    const currentDay = new Date().getDay();
    let greeting = '';
    switch (currentDay) {
      case 0:
        greeting = 'Enjoy your Sunday, ';
        break;
      case 1:
        greeting = 'Welcome back, ';
        break;
      case 2:
        greeting = 'Time to hit your goals today, ';
        break;
      case 3:
        greeting = 'Have a productive Wednesday, ';
        break;
      case 4:
        greeting = 'Almost there, ';
        break;
      case 5:
        greeting = 'Happy Friday! The weekend is near, ';
        break;
      case 6:
        greeting = 'It’s the weekend! Enjoy your time off, ';
        break;
      default:
        greeting = 'Welcome back, ';
        break;
    }
    return greeting;
  }
}
