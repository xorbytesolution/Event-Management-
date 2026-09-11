import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";

import Home from "./pages/Home.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import CityEventsPage from "./pages/CityEventsPage.jsx";
import EventDetailsPage from "./pages/EventDetailsPage.jsx";
import Login from "./pages/Login.jsx";
import Registration from "./pages/Registration.jsx";
import AdminEventSubmissions from "./pages/AdminEventSubmissions.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import OrganizerLayout from "./components/organizer/OrganizerLayout.jsx";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard.jsx";
import OrganizerEvents from "./pages/organizer/OrganizerEvents.jsx";
import OrganizerEventDetails from "./pages/organizer/OrganizerEventDetails.jsx";
import OrganizerProfile from "./pages/organizer/OrganizerProfile.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminEventSubmissionDetails from "./pages/admin/AdminEventSubmissionDetails.jsx";
import AdminEvents from "./pages/admin/AdminEvents.jsx";
import AdminEventDetails from "./pages/admin/AdminEventDetails.jsx";
import AdminExhibitors from "./pages/admin/AdminExhibitors.jsx";
import AdminExhibitorDetails from "./pages/admin/AdminExhibitorDetails.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminUserDetails from "./pages/admin/AdminUserDetails.jsx";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import OrganizerRoute from "./routes/OrganizerRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <ScrollToTop />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/events/:cityName" element={<CityEventsPage />} />
            <Route path="/events/:city" element={<CityEventsPage />} />
            <Route
              path="/events/details/:eventId"
              element={<EventDetailsPage />}
            />
            <Route path="/event/:id" element={<EventDetailsPage />} />

            <Route path="/login" element={<Login />} />

            <Route path="/registration" element={<Registration />} />

            <Route path="/admin/login" element={<AdminLogin />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />

                <Route
                  path="event-submissions"
                  element={<AdminEventSubmissions />}
                />

                <Route
                  path="event-submissions/:submissionId"
                  element={<AdminEventSubmissionDetails />}
                />

                <Route path="events" element={<AdminEvents />} />

                <Route path="events/:eventId" element={<AdminEventDetails />} />

                {/* Unified Users Management */}
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:userId" element={<AdminUserDetails />} />

                {/* Backward compatibility aliases */}
                <Route path="exhibitors" element={<AdminUsers />} />
                <Route
                  path="exhibitors/:exhibitorId"
                  element={<AdminUserDetails />}
                />

                <Route path="profile" element={<AdminProfile />} />
              </Route>
            </Route>

            <Route element={<OrganizerRoute />}>
              <Route path="/organizer" element={<OrganizerLayout />}>
                <Route index element={<OrganizerDashboard />} />
                <Route path="events" element={<OrganizerEvents />} />
                <Route
                  path="events/:eventId"
                  element={<OrganizerEventDetails />}
                />
                <Route path="profile" element={<OrganizerProfile />} />
              </Route>
            </Route>

          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
