import React from "react";
// import { Navigate } from "react-router";

interface IProtectedRouteProps {
    authToken: string | null;
    children: React.ReactNode;
}

export function ProtectedRoute(props: IProtectedRouteProps) {
    // Temporarily skip auth check for testing file upload
    // if (!props.authToken) {
    //     return <Navigate to="/login" replace />
    // }

    return props.children;
}