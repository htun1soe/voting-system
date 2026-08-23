import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../lib/store';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin } = useStore();

  if (!admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;