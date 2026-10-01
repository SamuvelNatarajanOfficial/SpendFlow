import { useState } from 'react';
import { addMonths, getCurrentMonthId } from '../services/financeEngine/month';

/** Navigates month-by-month with no fixed bound — past months stay reachable. */
export function useMonthNavigation(initialMonthId: string = getCurrentMonthId()) {
  const [monthId, setMonthId] = useState(initialMonthId);

  return {
    monthId,
    goToPrevious: () => setMonthId((current) => addMonths(current, -1)),
    goToNext: () => setMonthId((current) => addMonths(current, 1)),
    goToToday: () => setMonthId(getCurrentMonthId()),
  };
}
