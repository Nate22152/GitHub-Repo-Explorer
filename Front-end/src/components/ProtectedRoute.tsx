import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // No token found? Send them away.
    return <Navigate to="/login" replace />;
  }

  // Token exists? Let them see the page.
  return <>{children}</>;
};

export default ProtectedRoute;