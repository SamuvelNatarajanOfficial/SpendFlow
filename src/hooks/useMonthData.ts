import { useCallback, useEffect, useState } from 'react';
import { loadMonth, type MonthData } from '../services/financeEngine/monthService';
import { getFriendlyErrorMessage } from '../services/googleSheets/errors';

export interface UseMonthDataResult {
  data: MonthData | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/** Loads (and regenerates, where needed) one month's full finance picture. */
export function useMonthData(monthId: string): UseMonthDataResult {
  const [data, setData] = useState<MonthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadMonth(monthId)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(getFriendlyErrorMessage(cause));
      });

    return () => {
      cancelled = true;
    };
  }, [monthId, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  // No data yet and no error yet means the first load for this hook instance
  // is still in flight; switching months keeps showing the previous month's
  // data (no flicker) while the new one loads in the background.
  return { data, isLoading: data === null && error === null, error, reload };
}
