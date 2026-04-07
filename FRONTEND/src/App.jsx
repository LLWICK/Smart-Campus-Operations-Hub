import { Routes, Route, Outlet } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import FacilitiesPage from './pages/FacilitiesPage';
import FacilityDetailPage from './pages/FacilityDetailPage';
import BookingsPage from './pages/BookingsPage';
import NewBookingPage from './pages/NewBookingPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ManageFacilitiesPage from './pages/ManageFacilitiesPage';
import ManageBookingsPage from './pages/ManageBookingsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminRoute from './auth/AdminRoute';
import ManageUsersPage from './pages/ManageUsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="facilities" element={<FacilitiesPage />} />
        <Route path="facilities/:id" element={<FacilityDetailPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/new" element={<NewBookingPage />} />
        <Route path="bookings/new/:facilityId" element={<NewBookingPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        
        {/* Admin Routes */}
        <Route element={<AdminRoute><Outlet /></AdminRoute>}>
          <Route path="admin/facilities" element={<ManageFacilitiesPage />} />
          <Route path="admin/bookings" element={<ManageBookingsPage />} />
          <Route path="admin/users" element={<ManageUsersPage />} />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
