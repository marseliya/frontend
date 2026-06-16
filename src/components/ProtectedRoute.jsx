import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user?.role; // ← "ADMIN", "USER", "DRIVER"

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === "ADMIN") return <Navigate to="/home-admin" replace />;
    if (userRole === "DRIVER") return <Navigate to="/home-driver" replace />;
    return <Navigate to="/home-user" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;