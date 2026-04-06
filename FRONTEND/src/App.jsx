import { Routes, Route } from 'react-router-dom';
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
        <Route path="admin/facilities" element={<ManageFacilitiesPage />} />
        <Route path="admin/bookings" element={<ManageBookingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
