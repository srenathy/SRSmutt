import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';

export const DEFAULT_GOTRAS = [
  'Kashyapa', 'Vasishta', 'Bharadwaja', 'Gautama', 'Agastya', 'Atri', 'Viswamitra', 
  'Angirasa', 'Jamadagni', 'Harita', 'Kaundinya', 'Srivatsa', 'Shandilya', 'Kutsa', 
  'Garga', 'Mudgala', 'Naidhruva', 'Parashara', 'Vadhula', 'Bhrigu'
];

export const DEFAULT_NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 
  'Chitra', 'Svati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 
  'Uttara Bhadrapada', 'Revati'
];

export const DEFAULT_RASHIS = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)', 
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

export function useVedicMasters() {
  const gotrasQuery = useQuery({
    queryKey: ['master-gotras'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/gotras');
        const list = (res.data.data || []).map((g: any) => g.name);
        return list.length > 0 ? list : DEFAULT_GOTRAS;
      } catch (e) {
        return DEFAULT_GOTRAS;
      }
    },
    staleTime: 5 * 60 * 1000
  });

  const nakshatrasQuery = useQuery({
    queryKey: ['master-nakshatras'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/nakshatras');
        const list = (res.data.data || []).map((n: any) => n.name);
        return list.length > 0 ? list : DEFAULT_NAKSHATRAS;
      } catch (e) {
        return DEFAULT_NAKSHATRAS;
      }
    },
    staleTime: 5 * 60 * 1000
  });

  const rashisQuery = useQuery({
    queryKey: ['master-rashis'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/rashis');
        const list = (res.data.data || []).map((r: any) => r.name);
        return list.length > 0 ? list : DEFAULT_RASHIS;
      } catch (e) {
        return DEFAULT_RASHIS;
      }
    },
    staleTime: 5 * 60 * 1000
  });

  return {
    gotras: gotrasQuery.data || DEFAULT_GOTRAS,
    nakshatras: nakshatrasQuery.data || DEFAULT_NAKSHATRAS,
    rashis: rashisQuery.data || DEFAULT_RASHIS,
    isLoading: gotrasQuery.isLoading || nakshatrasQuery.isLoading || rashisQuery.isLoading
  };
}
