import { Navigate, Outlet } from 'react-router-dom';

// Notice we removed the Props interface entirely since we don't need 'children'

const ProtectedRoute = () => {
  const token = localStorage.getItem('jwt_token'); 
  const isAuthenticated = !!token; 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // <Outlet /> automatically renders whatever child <Route> matches in App.tsx
  return <Outlet />; 
};

export default ProtectedRoute;