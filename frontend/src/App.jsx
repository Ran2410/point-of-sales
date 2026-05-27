import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import Login           from "./pages/Login";
import Dashboard       from "./pages/Dashboard";
import BranchManagement from "./pages/BranchManagement";
import UserManagement  from "./pages/UserManagement";
import Categories      from "./pages/owner/Categories";
import Products        from "./pages/owner/Products";
import ProductStock    from "./pages/owner/ProductStock";
import Reports         from "./pages/owner/Reports";
import BranchProducts  from "./pages/branch/BranchProducts";
import BranchProductStock from "./pages/branch/BranchProductStock";
import BranchReports   from "./pages/branch/BranchReports";
import CashierPOS      from "./pages/cashier/CashierPOS";
import TransactionHistory from "./pages/cashier/TransactionHistory";
import Profile         from "./pages/Profile";
import NotFound        from "./pages/NotFound";
import Register        from "./pages/Register";
import AdminDashboard  from "./pages/admin/AdminDashboard";
import AdminStores     from "./pages/admin/AdminStores";
import AdminUsers      from "./pages/admin/AdminUsers";

// ─── Route Guards ─────────────────────────────────────────────────────────────

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  if (user.role === "admin")        return <Navigate to="/admin/dashboard" replace />;
  if (user.role === "owner")        return <Navigate to="/owner/dashboard" replace />;
  if (user.role === "branch_owner") return <Navigate to="/branch/dashboard" replace />;
  return <Navigate to="/pos" replace />;
}

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

function OwnerRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "owner") return <Navigate to="/login" replace />;
  return children;
}

function BranchOwnerRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "branch_owner") return <Navigate to="/login" replace />;
  return children;
}

function UserManagerRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!["owner", "branch_owner"].includes(user.role)) return <Navigate to="/pos" replace />;
  return children;
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/stores"    element={<AdminRoute><AdminStores /></AdminRoute>} />
      <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />

      {/* Owner */}
      <Route path="/owner/dashboard"          element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/owner/transactions"       element={<OwnerRoute><TransactionHistory /></OwnerRoute>} />
      <Route path="/owner/categories"         element={<OwnerRoute><Categories /></OwnerRoute>} />
      <Route path="/owner/products"           element={<OwnerRoute><Products /></OwnerRoute>} />
      <Route path="/owner/products/:id/stock" element={<OwnerRoute><ProductStock /></OwnerRoute>} />
      <Route path="/owner/branches"           element={<OwnerRoute><BranchManagement /></OwnerRoute>} />
      <Route path="/owner/users"              element={<UserManagerRoute><UserManagement /></UserManagerRoute>} />
      <Route path="/owner/reports"            element={<OwnerRoute><Reports /></OwnerRoute>} />

      {/* Branch Owner */}
      <Route path="/branch/dashboard"           element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/branch/transactions"        element={<BranchOwnerRoute><TransactionHistory /></BranchOwnerRoute>} />
      <Route path="/branch/products"            element={<BranchOwnerRoute><BranchProducts /></BranchOwnerRoute>} />
      <Route path="/branch/products/:id/stock"  element={<BranchOwnerRoute><BranchProductStock /></BranchOwnerRoute>} />
      <Route path="/branch/users"               element={<UserManagerRoute><UserManagement /></UserManagerRoute>} />
      <Route path="/branch/reports"             element={<BranchOwnerRoute><BranchReports /></BranchOwnerRoute>} />

      {/* Cashier */}
      <Route path="/pos"          element={<PrivateRoute><CashierPOS /></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />

      {/* Profile — semua role */}
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
