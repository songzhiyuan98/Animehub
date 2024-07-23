// src/components/PrivateRoute.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ component: Component }) => {
  const isLoggedIn = useSelector(state => state.user.isLoggedIn);
  return isLoggedIn ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
