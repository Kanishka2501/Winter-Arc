export interface Quote {
  text: string;
  author: string;
}

export const WINTER_ARC_QUOTES: Quote[] = [
  { text: "Stay quiet. Let the results make noise.", author: "Winter Arc Principle" },
  { text: "Consistency becomes identity.", author: "The Standard" },
  { text: "Nobody is coming. Build anyway.", author: "Discipline Oath" },
  { text: "One disciplined day changes the next.", author: "The Arc" },
  { text: "Winter is temporary. What you build isn't.", author: "Arc Doctrine" },
  { text: "Disappear for a while and come back unrecognizable.", author: "The Rebirth" },
  { text: "You don't need motivation when you have unbreakable standards.", author: "Marcus Aurelius" },
  { text: "He who conquers himself is the mightiest warrior.", author: "Confucius" },
  { text: "The cold doesn't care about your excuses. Work through it.", author: "Command Center" },
  { text: "Silence is the sanctuary of transformation.", author: "Winter Arc" },
  { text: "Greatness is merely a collection of ordinary tasks executed with extraordinary discipline.", author: "The Standard" },
  { text: "Pain of discipline or pain of regret. You choose every single morning.", author: "Jim Rohn" },
  { text: "When you feel like quitting, remember why you went dark in the first place.", author: "Arc Command" },
  { text: "A fortress isn't built in sunshine. It is forged in the dead of winter.", author: "Old Proverb" },
  { text: "Do not negotiate with weakness. Execute the mission.", author: "Daily Order" },
  { text: "Master your mornings, master your winter, master your life.", author: "The Protocol" },
  { text: "The version of you six months from now will thank you for today's restraint.", author: "Future Self" },
  { text: "Small, relentless, non-negotiable habits will move mountains.", author: "Deep Work" },
  { text: "Self-respect is the fruit of discipline; the dignity of a person to say no to oneself.", author: "Abraham Joshua Heschel" },
  { text: "Let your absence be felt. Let your return be undeniable.", author: "Winter Arc" }
];

export function getDailyQuote(seedDate?: string): Quote {
  if (!seedDate) {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return WINTER_ARC_QUOTES[dayOfYear % WINTER_ARC_QUOTES.length];
  }
  let hash = 0;
  for (let i = 0; i < seedDate.length; i++) {
    hash = (hash << 5) - hash + seedDate.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % WINTER_ARC_QUOTES.length;
  return WINTER_ARC_QUOTES[index];
}

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * WINTER_ARC_QUOTES.length);
  return WINTER_ARC_QUOTES[index];
}
