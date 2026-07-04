import { Navigate, Outlet } from "react-router-dom";
import { decryptLocalStorage } from "../utils/DparcelHelper";

interface Props {
  roles: string[];
}

const RoleRoute = ({ roles }: Props) => {
  const user = decryptLocalStorage("user");

  if (!user) return <Navigate to="/signin" replace />;

  const hasRole = roles.some((role) => user?.roles?.includes(role));

  if (!hasRole) {
    // Redirect to their own dashboard instead of a blank/error page
    if (user?.roles?.includes("admin")) return <Navigate to="/admin/dashboard" replace />;
    if (user?.roles?.includes("shipper")) return <Navigate to="/shipper/dashboard" replace />;
    if (user?.roles?.includes("shopper")) return <Navigate to="/shopper/request" replace />;
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
