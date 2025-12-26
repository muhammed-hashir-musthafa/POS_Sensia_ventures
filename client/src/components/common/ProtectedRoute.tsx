import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { Spin } from 'antd';
import { RootState, AppDispatch } from '@/store';
import { loadUser } from '@/store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    dispatch(loadUser());
    setIsInitialized(true);
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized && requireAuth && !user) {
      router.push('/login');
    }
  }, [isInitialized, requireAuth, user, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
};