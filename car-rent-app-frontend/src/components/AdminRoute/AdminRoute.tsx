import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface AdminRouteProps {
  children: React.ReactNode;
}

interface JwtPayload {
  role?: string;
  // add other fields if needed, e.g., exp, username, etc.
}

const getUserRole = (): string | undefined => {
  const token = localStorage.getItem("token"); // adjust if your key differs
  if (!token) return undefined;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role;
  } catch {
    return undefined;
  }
};

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const role = getUserRole();
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default AdminRoute;
