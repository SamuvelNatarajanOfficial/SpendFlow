import { useMemo, useState } from 'react';
import { mockCurrentMonthId, mockMonths } from '../data/mockData';

export function useMonthNavigation() {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      mockMonths.findIndex((month) => month.id === mockCurrentMonthId),
    ),
  );

  const activeMonth = useMemo(() => mockMonths[activeIndex], [activeIndex]);

  const goToPrevious = () => setActiveIndex((index) => Math.max(0, index - 1));

  const goToNext = () =>
    setActiveIndex((index) => Math.min(mockMonths.length - 1, index + 1));

  return {
    activeMonth,
    goToPrevious,
    goToNext,
    hasPrevious: activeIndex > 0,
    hasNext: activeIndex < mockMonths.length - 1,
  };
}
