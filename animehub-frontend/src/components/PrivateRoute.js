import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ component: Component }) => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const loading = useSelector((state) => state.user.loading);

  if (loading) {
    return null; // 等待 loading 状态确定
  }

  return isLoggedIn ? <Component /> : <Navigate to="/login" />;
};

export default PrivateRoute;
