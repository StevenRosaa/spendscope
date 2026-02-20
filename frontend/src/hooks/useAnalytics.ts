import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api'; // Assicurati che il path sia corretto

// Tipizzazioni (rimangono invariate)
export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface CategoryDataPoint extends ChartDataPoint {
  percentage: number;
}

export interface AnalyticsData {
  total_spent: number;
  spending_over_time: ChartDataPoint[];
  top_categories: CategoryDataPoint[];
}

export function useAnalytics(startDate: string, endDate: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Guarda com'è pulito ora! Nessun token manuale, niente headers.
        // Passiamo i query params direttamente tramite l'oggetto config di Axios.
        const response = await apiClient.get<AnalyticsData>('/api/analytics', {
          params: {
            start_date: startDate,
            end_date: endDate
          }
        });

        setData(response.data);
      } catch (err: any) {
        // Axios racchiude gli errori HTTP nell'oggetto response
        const errorMsg = err.response?.data?.detail || err.message || 'Errore nel recupero dati';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [startDate, endDate]);

  return { data, isLoading, error };
}