'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '../store';
import { loadUser } from '../store/slices/authSlice';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <Dashboard />;
}