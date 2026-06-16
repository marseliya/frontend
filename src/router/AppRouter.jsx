import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Auth from "../pages/Auth";
import HomeUser from "../pages/users/HomeUser";
import DetailBuku from "../pages/users/DetailBuku";
import ProfileUser from "../pages/users/ProfileUser";

import HomeAdmin from "../pages/admin/HomeAdmin";
import AdminBooks from "../pages/admin/AdminBooks";
import AdminVouchers from "../pages/admin/AdminVouchers";
import HomeDriver from "../pages/driver/HomeDriver";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminOrders from "../pages/admin/AdminOrders";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />

      <Route element={<MainLayout />}>
        {/* <Route element={<ProtectedRoute allowedRoles={["USER"]} />}> */}
          <Route path="/home-user" element={<HomeUser />} />
          <Route path="/profile-user" element={<ProfileUser />} />
          <Route path="/detail-buku/:id" element={<DetailBuku />} />
        {/* </Route> */}

        {/* <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}> */}
          <Route path="/home-admin" element={<HomeAdmin />} />
          <Route path="/kelola-buku" element={<AdminBooks />} />
          <Route path="/kelola-voucher" element={<AdminVouchers />} />
          <Route path="/kelola-user" element={<AdminUsers />} />
          <Route path="/kelola-order" element={<AdminOrders />} />
        {/* </Route> */}

        {/* <Route element={<ProtectedRoute allowedRoles={["DRIVER"]} />}> */}
          <Route path="/home-driver" element={<HomeDriver />} />
        {/* </Route> */}
      </Route>
    </Routes>
  );
}

export default AppRouter;
