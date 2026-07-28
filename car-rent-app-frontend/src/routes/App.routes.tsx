// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Cars from "../pages/Cars/Cars";
import CarWizard from "../components/AddCarWizard/AddCarWizard";
import SearchedCars from "../pages/searchedCars/searchedCars";
import MyCars from "../pages/MyCars/MyCars";
import CarDetails from "../pages/CarDetails/CarDetails";
import VerifyEmail from "../pages/verify-email/verify-email";
import ManageCars from "../pages/admin/manageCars/manageCars";
import ManageGuests from "../pages/admin/manageGuests/manageGuest";
import ManageHosts from "../pages/admin/manageHosts/manageHosts";
import ManageBookings from "../pages/admin/manageBookings/manageBookings";
import ManagePayments from "../pages/admin/managePayments/managePayments";
import ManageSupport from "../pages/admin/manageSupport/manageSupport";
import AdminRoute from "../components/AdminRoute/AdminRoute"; // Make sure path is correct
import MyDocumentsPage from "../pages/MyDocuments/MyDocuments";
// import BookACar from "../pages/BookACar/BookACar";
import Support from "../pages/support/support";
import Community from "../pages/community/community";
import Dashboard from "../pages/admin/dashboard/dashboard";
import GuestMyBookings from "../pages/guest-mybookings/guest-mybookings";
import HostMyBookings from "../pages/host-mybookings/host-mybookings";
import IntercityCars from "../pages/intercity-car/IntercityCars";
import SelfDriveCarDetails from "../pages/BookACar/selfDriveCarDetails";
import IntercityCarDetails from "../pages/BookACar/IntercityCarDetails";
// import RequireAuth from "../components/Auth/auth/RequireAuth";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cars" element={<Cars />} />
      <Route path="/add-car" element={<CarWizard />} />
      <Route path="/searched-cars" element={<SearchedCars />} />
      <Route path="/my-cars" element={<MyCars />} />
      <Route path="/car-details/:id" element={<CarDetails />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/my-documents" element={<MyDocumentsPage />} />
      <Route path="/support" element={<Support />} />
      <Route path="/community" element={<Community />} />
      <Route path="/selfdrive/car" element={<SelfDriveCarDetails />} />
      <Route path="/intercity/car" element={<IntercityCarDetails />} />
      <Route path="/guest-mybookings" element={<GuestMyBookings />} />
      <Route path="/host-mybookings" element={<HostMyBookings />} />
      <Route path="/intercity-cars" element={<IntercityCars />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-cars"
        element={
          <AdminRoute>
            <ManageCars />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-guests"
        element={
          <AdminRoute>
            <ManageGuests />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-hosts"
        element={
          <AdminRoute>
            <ManageHosts />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-bookings"
        element={
          <AdminRoute>
            <ManageBookings />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-payments"
        element={
          <AdminRoute>
            <ManagePayments />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/manage-support"
        element={
          <AdminRoute>
            <ManageSupport />
          </AdminRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
