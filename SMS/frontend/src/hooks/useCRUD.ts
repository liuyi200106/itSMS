import { useState, useCallback } from 'react';

interface UseCRUDOptions<T> {
  fetchFn: () => Promise<T[]>;
  createFn?: (data: any) => Promise<T>;
  updateFn?: (id: number, data: any) => Promise<T>;
  deleteFn?: (id: number) => Promise<void>;
}

interface UseCRUDReturn<T> {
  data: T[];
  loading: boolean;
  error: string;
  fetch: () => Promise<void>;
  create: (data: any) => Promise<boolean>;
  update: (id: number, data: any) => Promise<boolean>;
  remove: (id: number) => Promise<boolean>;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}

export function useCRUD<T>(options: UseCRUDOptions<T>): UseCRUDReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await options.fetchFn();
      setData(response);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  }, [options.fetchFn]);

  const create = useCallback(async (formData: any): Promise<boolean> => {
    if (!options.createFn) return false;
    setLoading(true);
    setError('');
    try {
      await options.createFn(formData);
      await fetch();
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Create failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.createFn, fetch]);

  const update = useCallback(async (id: number, formData: any): Promise<boolean> => {
    if (!options.updateFn) return false;
    setLoading(true);
    setError('');
    try {
      await options.updateFn(id, formData);
      await fetch();
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Update failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.updateFn, fetch]);

  const remove = useCallback(async (id: number): Promise<boolean> => {
    if (!options.deleteFn) return false;
    setLoading(true);
    setError('');
    try {
      await options.deleteFn(id);
      setData(prev => prev.filter(item => (item as any).id !== id));
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Delete failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.deleteFn]);

  return { data, loading, error, fetch, create, update, remove, setData };
}

export function useModal<T = void>() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const openModal = (initialData?: T) => {
    setData(initialData || null);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setData(null);
  };

  return { open, data, openModal, closeModal };
}

export function useSelection<T extends { id: number }>(items: T[]) {
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const selected = items.find(item => item.id === selectedId) || null;
  return { selectedId, setSelectedId, selected };
}
