import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const fallback =
      user.role === "admin" ? "/admin" :
      user.role === "restaurant" ? "/restaurant" :
      user.role === "delivery" ? "/delivery" : "/";
    return <Navigate to={fallback} replace />;
  }
  return <>{children}</>;
}
