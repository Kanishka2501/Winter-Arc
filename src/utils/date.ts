/**
 * Robust date and calendar utilities for Winter Arc.
 * All functions operate on local timezone strings (YYYY-MM-DD) to prevent UTC skew.
 */

import { DailyRecord } from '../types';

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

export function daysBetween(startStr: string, endStr: string): number {
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDateDisplay(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString(undefined, options || {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatTimeDisplay(dateOrIso: Date | string): string {
  try {
    const d = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function isPastDate(dateStr: string, referenceDateStr: string = getLocalDateString()): boolean {
  return dateStr < referenceDateStr;
}

export function isFutureDate(dateStr: string, referenceDateStr: string = getLocalDateString()): boolean {
  return dateStr > referenceDateStr;
}

export function isTodayDate(dateStr: string): boolean {
  return dateStr === getLocalDateString();
}

/**
 * Calculates current streak, longest streak, perfect, partial, and missed days.
 * Operates strictly within the current Arc range [arcStartDate, arcEndDate].
 * Ignores future dates and dates outside the Arc.
 * Today's incomplete state does not break yesterday's streak.
 */
export function calculateStreakEngine(
  dailyRecords: Record<string, DailyRecord>,
  arcStartDate: string,
  arcEndDate: string,
  todayStr: string = getLocalDateString()
) {
  let currentStreak = 0;
  let longestStreak = 0;
  let perfectDays = 0;
  let partialDays = 0;
  let missedDays = 0;
  let totalActiveDays = 0;

  if (!arcStartDate || !arcEndDate || arcStartDate > arcEndDate) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      perfectDays: 0,
      partialDays: 0,
      missedDays: 0,
      totalActiveDays: 0
    };
  }

  // If today is before Arc starts, nothing has occurred in this Arc yet
  if (todayStr < arcStartDate) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      perfectDays: 0,
      partialDays: 0,
      missedDays: 0,
      totalActiveDays: 0
    };
  }

  // Count metrics for all calendar days from arcStartDate up to min(todayStr, arcEndDate)
  const effectiveEnd = todayStr <= arcEndDate ? todayStr : arcEndDate;
  const start = arcStartDate;

  let tempStreak = 0;
  let cursor = start;

  while (cursor <= effectiveEnd) {
    const record = dailyRecords[cursor];
    const score = record && typeof record.score === 'number' ? Math.max(0, Math.min(100, record.score)) : 0;
    const isToday = cursor === todayStr;

    const meetsThreshold = score >= 50;
    const isPerfect = score >= 90;

    if (meetsThreshold) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      totalActiveDays++;
      if (isPerfect) {
        perfectDays++;
      }
    } else {
      if (isToday) {
        // Today is still ongoing. An incomplete today does not break the streak built up to yesterday
      } else {
        tempStreak = 0;
        if (score > 0) {
          partialDays++;
          totalActiveDays++;
        } else {
          missedDays++;
        }
      }
    }

    cursor = addDays(cursor, 1);
  }

  // Calculate current streak walking backward from today or yesterday
  currentStreak = 0;

  if (todayStr <= arcEndDate) {
    const todayRecord = dailyRecords[todayStr];
    const todayScore = todayRecord && typeof todayRecord.score === 'number' ? todayRecord.score : 0;
    const todayMeets = todayScore >= 50;

    let checkCursor = todayStr;
    if (todayMeets) {
      currentStreak++;
      checkCursor = addDays(todayStr, -1);
    } else {
      // Today is in-progress: check streak starting from yesterday
      checkCursor = addDays(todayStr, -1);
    }

    while (checkCursor >= start) {
      const rec = dailyRecords[checkCursor];
      const recScore = rec && typeof rec.score === 'number' ? rec.score : 0;
      if (recScore >= 50) {
        currentStreak++;
        checkCursor = addDays(checkCursor, -1);
      } else {
        break;
      }
    }
  } else {
    // Arc ended in the past: calculate streak ending at arcEndDate
    let checkCursor = arcEndDate;
    while (checkCursor >= start) {
      const rec = dailyRecords[checkCursor];
      const recScore = rec && typeof rec.score === 'number' ? rec.score : 0;
      if (recScore >= 50) {
        currentStreak++;
        checkCursor = addDays(checkCursor, -1);
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    perfectDays,
    partialDays,
    missedDays,
    totalActiveDays,
  };
}

/**
 * Returns array of date strings between start and end (inclusive)
 */
export function getDateRangeArray(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  let curr = startStr;
  const maxLoops = 400; // safety ceiling
  let loops = 0;

  while (curr <= endStr && loops < maxLoops) {
    dates.push(curr);
    curr = addDays(curr, 1);
    loops++;
  }
  return dates;
}
