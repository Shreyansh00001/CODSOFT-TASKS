import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, isAdminRequired = false }) {
  const { userInfo } = useContext(AuthContext);
  const location = useLocation();

  if (!userInfo) {
    // Redirect to login but save the path they tried to visit
    return <Navigate to={`/login?redirect=${location.pathname.substring(1)}`} replace />;
  }

  if (isAdminRequired && !userInfo.isAdmin) {
    // Denied access for non-admins
    return <Navigate to="/" replace />;
  }

  return children;
}
