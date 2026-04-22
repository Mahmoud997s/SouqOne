'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  toYMD,
  diffDays,
  startOfDay,
  addDays,
  isSameDay,
} from '../utils/date-helpers';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RentalCalendarProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onSelectIn: (d: Date) => void;
  onSelectOut: (d: Date) => void;
  onClear: () => void;
  selectingEnd: boolean;
  setSelectingEnd: (v: boolean) => void;
  unavailableDates: string[];
  minRentalDays?: number | null;
  availableFrom?: string;
  availableTo?: string;
  hoverDate: Date | null;
  setHoverDate: (d: Date | null) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RentalCalendar({
  checkIn, checkOut, onSelectIn, onSelectOut, onClear,
  selectingEnd, setSelectingEnd, unavailableDates, minRentalDays,
  availableFrom, availableTo,
  hoverDate, setHoverDate,
}: RentalCalendarProps) {
  const tr = useTranslations('rental');
  const months = useMemo(() => [
    tr('monthJan'), tr('monthFeb'), tr('monthMar'), tr('monthApr'),
    tr('monthMay'), tr('monthJun'), tr('monthJul'), tr('monthAug'),
    tr('monthSep'), tr('monthOct'), tr('monthNov'), tr('monthDec'),
  ], [tr]);
  const days = useMemo(() => [
    tr('daySun'), tr('dayMon'), tr('dayTue'), tr('dayWed'),
    tr('dayThu'), tr('dayFri'), tr('daySat'),
  ], [tr]);

  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const today = startOfDay(new Date());

  const year  = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  // first day of month + padding
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth  = new Date(year, month + 1, 0).getDate();

  // prev month disabled if viewMonth <= current month
  const canGoPrev = new Date(year, month, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  function prevMonth() {
    if (!canGoPrev) return;
    setViewMonth(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewMonth(new Date(year, month + 1, 1));
  }

  // min rental days: compute the earliest valid checkOut date
  const minCheckOut = useMemo(() => {
    if (!checkIn || !minRentalDays) return null;
    return addDays(checkIn, minRentalDays);
  }, [checkIn, minRentalDays]);

  const availStart = availableFrom ? startOfDay(new Date(availableFrom)) : null;
  const availEnd = availableTo ? startOfDay(new Date(availableTo)) : null;

  function isOutOfRange(day: Date): boolean {
    if (availStart && day < availStart) return true;
    if (availEnd && day > availEnd) return true;
    return false;
  }

  function handleDayClick(day: Date) {
    if (day < today) return;
    if (isOutOfRange(day)) return;
    const ymd = toYMD(day);
    if (unavailableDates.includes(ymd)) return;

    if (!selectingEnd || !checkIn || day <= checkIn) {
      onSelectIn(day);
      setSelectingEnd(true);
    } else {
      // validate minRentalDays
      if (minRentalDays && diffDays(checkIn, day) < minRentalDays) return;
      // ensure no unavailable date in range
      let cur = addDays(checkIn, 1);
      let blocked = false;
      while (cur < day) {
        if (unavailableDates.includes(toYMD(cur))) { blocked = true; break; }
        cur = addDays(cur, 1);
      }
      if (blocked) return;
      onSelectOut(day);
      setSelectingEnd(false);
    }
  }

  // build calendar grid cells
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function dayClass(day: Date): { wrapper: string; btn: string } {
    const ymd     = toYMD(day);
    const isPast  = day < today;
    const isOOR   = isOutOfRange(day);
    const isUnavail = unavailableDates.includes(ymd) || isOOR;
    const isStart = !!checkIn  && isSameDay(day, checkIn);
    const isEnd   = !!checkOut && isSameDay(day, checkOut);
    const inRange = checkIn && checkOut && day > checkIn && day < checkOut;

    // hover preview range (only when selecting end)
    const effectiveEnd = selectingEnd && hoverDate && checkIn && hoverDate > checkIn ? hoverDate : null;
    const inHover = selectingEnd && effectiveEnd && checkIn && day > checkIn && day <= effectiveEnd && !checkOut;
    const isHoverEnd = selectingEnd && effectiveEnd && isSameDay(day, effectiveEnd) && !checkOut;

    // below-min indicator: days between checkIn and minCheckOut
    const isBelowMin = selectingEnd && checkIn && minCheckOut && day > checkIn && day < minCheckOut && !isPast && !isUnavail;

    let wrapper = 'relative flex items-center justify-center';
    let btn     = 'w-9 h-9 rounded-full text-[13px] transition-all duration-100 flex items-center justify-center';

    // ─ Disabled / Unavailable ─
    if (isPast) {
      btn += ' text-on-surface-variant/40 cursor-not-allowed line-through';
      return { wrapper, btn };
    }
    if (isUnavail) {
      btn += ' relative text-on-surface-variant/40 cursor-not-allowed';
      // diagonal stripes via pseudo-element (handled in after:)
      wrapper += ' [&>button]:after:content-[\'\'] [&>button]:after:absolute [&>button]:after:inset-0 [&>button]:after:rounded-full [&>button]:after:bg-[repeating-linear-gradient(135deg,transparent,transparent_3px,rgba(0,0,0,0.08)_3px,rgba(0,0,0,0.08)_4px)]';
      return { wrapper, btn };
    }

    // ─ Selected start+end same day ─
    if (isStart && isEnd) {
      btn += ' bg-on-surface text-background font-medium';
      return { wrapper, btn };
    }

    // ─ Selected start ─
    if (isStart) {
      wrapper += ' bg-primary/10 rounded-r-full'; // RTL: right rounded
      btn     += ' bg-on-surface text-background font-medium';
      return { wrapper, btn };
    }

    // ─ Selected end ─
    if (isEnd) {
      wrapper += ' bg-primary/10 rounded-l-full'; // RTL: left rounded
      btn     += ' bg-on-surface text-background font-medium';
      return { wrapper, btn };
    }

    // ─ In confirmed range ─
    if (inRange) {
      wrapper += ' bg-primary/10 w-full';
      btn     += ' text-on-surface';
      return { wrapper, btn };
    }

    // ─ Hover preview range ─
    if (inHover && !isHoverEnd) {
      wrapper += ' bg-primary/10 w-full';
      btn     += ' text-on-surface';
      return { wrapper, btn };
    }
    if (isHoverEnd) {
      wrapper += ' bg-primary/10 rounded-l-full'; // RTL
      btn     += ' border-2 border-dashed border-on-surface/50 text-on-surface';
      return { wrapper, btn };
    }

    // ─ Below min rental days (red indicator) ─
    if (isBelowMin) {
      btn += ' text-on-surface-variant cursor-not-allowed bg-red-50 dark:bg-red-900/10';
      return { wrapper, btn };
    }

    // ─ Normal day ─
    const isToday = isSameDay(day, today);
    btn += isToday
      ? ' font-semibold underline underline-offset-4 text-on-surface hover:bg-surface-container cursor-pointer'
      : ' text-on-surface hover:bg-surface-container cursor-pointer';
    return { wrapper, btn };
  }

  return (
    <div
      className="border border-outline-variant/30 rounded-2xl p-4 mt-2 bg-background shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
      onMouseLeave={() => setHoverDate(null)}
    >
      {/* Month header with Lucide chevrons */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <span className="text-[14px] font-medium text-on-surface">{months[month]} {year}</span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container cursor-pointer transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Day headers (RTL) */}
      <div className="grid grid-cols-7 mb-2">
        {days.map(d => (
          <div key={d} className="text-[11px] text-on-surface-variant text-center py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          const cls = day ? dayClass(day) : null;
          return (
            <div key={i} className={cls?.wrapper ?? ''}>
              {day && cls && (
                <button
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => selectingEnd && setHoverDate(day)}
                  className={cls.btn}
                  disabled={day < today || unavailableDates.includes(toYMD(day)) || isOutOfRange(day)}
                >
                  {day.getDate()}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        {minRentalDays ? (
          <p className="text-[11px] text-on-surface-variant">
            {tr('calendarMinDays', { count: minRentalDays })}
          </p>
        ) : <span />}
        <button
          onClick={onClear}
          className="text-[11px] text-primary underline cursor-pointer ms-auto"
        >
          {tr('calendarClear')}
        </button>
      </div>
    </div>
  );
}
