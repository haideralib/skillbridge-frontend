import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "../stores/auth.store";
import { useAuthStore } from "../stores/auth.store";

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const hasRole = useAuthStore((state) => state.hasRole);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};