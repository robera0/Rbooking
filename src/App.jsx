import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ServiceProvider, useService } from "./Context/ServiceContext";
import { ApiProvider } from "./Context/ApiEvent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

import Home from "./Client/admin/Home";
import Main from "./Client/user/Main";
import UserHome from "./Client/user/UserHome";
import LoginUser from "./Client/user/LoginUser";
import Sport from "./Client/user/Sport";
import AccountPage from "./Client/user/AccountPage";
import SignUp from "./Client/user/SignUp";
import Ticket from "./Client/user/Ticket";
import Account from "./Client/user/Account";
import ViewTicket from "./Client/user/ViewTicket";
import Wishlist from "./Client/user/Wishlist";
import Profile from "./Client/user/Profile";
import Setting from "./Client/user/Setting";
import EventInfo from "./Client/user/EventInfo";
import { ProtectedRoute } from "./components/Reusable";
import { Toaster } from "react-hot-toast";
import Events from "./Client/user/Events";
import AddSalon from "./Client/admin/AddSalon";
import Book_Setting from "./Client/admin/Book_Setting";
import Booking from "./Client/admin/Booking";
import BookingDetail from "./Client/admin/BookingDetail";
import Configuration_Setting from "./Client/admin/Configuration_Setting";
import CreateBooking from "./Client/admin/CreateBooking";
import CreateNotification from "./Client/admin/CreateNotification";
import Dashboard from "./Client/admin/Dashboard";
import General from "./Client/admin/General";
import Graphs from "./Client/admin/Graphs";
import Guage from "./Client/admin/Guage";
import LoginPage from "./Client/admin/LoginPage";
import Marketing from "./Client/admin/Marketing";
import Notification_Setting from "./Client/admin/Notification_Setting";
import Payment from "./Client/admin/Payment";
import Performance from "./Client/admin/Performance";
import Portfolio from "./Client/admin/Portfolio";
import Privacy_Setting from "./Client/admin/Privacy_Setting";
import Report from "./Client/admin/Report";
import RevenueGraph from "./Client/admin/RevenueGraph";
import Review from "./Client/admin/Review";
import Salon_Setting from "./Client/admin/Salon_Setting";
import SalonDetail from "./Client/admin/SalonDetail";
import SalonMang from "./Client/admin/SalonMang";
import Service from "./Client/admin/Service";
import User_Setting from "./Client/admin/User_Setting";
import User from "./Client/admin/User";
import Verification from "./Client/admin/Verification";
const queryClient = new QueryClient();

// Framer Motion variants
const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const pageTransition = {
  duration: 0.2,
  ease: "easeInOut",
};

// Page wrapper using variants
const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);
<Toaster
  position="top-center"
  toastOptions={{
    style: {
      background: "#2A2C31",
      color: "#fff",
    },
    success: {
      style: {
        border: "1px solid #FF7800",
      },
    },
    error: {
      style: {
        border: "1px solid red",
      },
    },
  }}
/>;

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence>
      <Toaster position="top-right" />
      <Routes key={location.pathname} location={location}>
        <Route
          path="/login"
          element={
            <PageWrapper>
              <AccountPage
                pa={"Login in to see the best of Events and Exhibitions "}
                h={"h-100"}
              >
                <LoginUser />
              </AccountPage>
            </PageWrapper>
          }
        />

        <Route
          path="/sign_up"
          element={
            <PageWrapper>
              <AccountPage
                pa={"Create your account and see the best events "}
                h={"h-120"}
              >
                <SignUp />
              </AccountPage>
            </PageWrapper>
          }
        />

        <Route
          path="/admin/home"
          element={
            <Home>
              <PageWrapper>
                <Home />
              </PageWrapper>
            </Home>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/login"
          element={
            <PageWrapper>
              <LoginPage />
            </PageWrapper>
          }
        />

        <Route
          path="/dashboard"
          element={
            <Home>
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/user"
          element={
            <Home>
              <PageWrapper>
                <User />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/salon"
          element={
            <Home>
              <PageWrapper>
                <SalonMang />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/salon/salonMang"
          element={
            <Home>
              <PageWrapper>
                <SalonDetail />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/salon/addSalon"
          element={
            <Home>
              <PageWrapper>
                <AddSalon />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/booking"
          element={
            <Home>
              <PageWrapper>
                <Booking />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/booking/bookingdetail"
          element={
            <Home>
              <PageWrapper>
                <BookingDetail />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/booking/createbooking"
          element={
            <Home>
              <PageWrapper>
                <CreateBooking />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/payment"
          element={
            <Home>
              <PageWrapper>
                <Payment />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/marketing"
          element={
            <Home>
              <PageWrapper>
                <Marketing />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/marketing/create_notification"
          element={
            <Home>
              <PageWrapper>
                <CreateNotification />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/reports"
          element={
            <Home>
              <PageWrapper>
                <Report />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/setting"
          element={
            <Home>
              <PageWrapper>
                <Setting />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/"
          element={
            <PageWrapper>
              <Main>
                <UserHome />
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/events/:eventId/tickets/:ticketId"
          element={
            <PageWrapper>
              <Main>
                <EventInfo />
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/event"
          element={
            <PageWrapper>
              <Main>
                <Events />
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/tickets_home"
          element={
            <PageWrapper>
              <Main>
                <ProtectedRoute>
                  <Ticket />
                </ProtectedRoute>
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/tickets_home/:ticketId"
          element={
            <PageWrapper>
              <Main>
                <ProtectedRoute>
                  <ViewTicket />
                </ProtectedRoute>
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/account"
          element={
            <PageWrapper>
              <Main>
                <ProtectedRoute>
                  <Account>
                    <Profile />
                  </Account>
                </ProtectedRoute>
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/account/favorites"
          element={
            <PageWrapper>
              <Main>
                <Account>
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                </Account>
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/account/setting"
          element={
            <PageWrapper>
              <Main>
                <Account>
                  <Setting />
                </Account>
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/event_sports"
          element={
            <PageWrapper>
              <Main>
                <Sport />
              </Main>
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ServiceProvider>
          <ApiProvider>
            <AnimatedRoutes />
          </ApiProvider>
        </ServiceProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
