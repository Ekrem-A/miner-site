import { useEffect, useState } from 'react';
import { Category } from '@/types';
import fetchCategories from '@/lib/getCategories';

export function useCategories() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCategories()
      .then((res) => {
        if (!mounted) return;
        setCategories(res);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { categories, loading, error };
}

export default useCategories;