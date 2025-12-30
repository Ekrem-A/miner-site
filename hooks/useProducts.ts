import { useEffect, useState } from 'react';
import { Product } from '@/types';
import fetchProducts from '@/lib/getProducts';

export function useProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProducts()
      .then((res) => {
        if (!mounted) return;
        setProducts(res);
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

  return { products, loading, error };
}

export default useProducts;