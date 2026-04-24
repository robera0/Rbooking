import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ServiceProvider, useService } from "./Context/ServiceContext";
import { ApiProvider } from "./Context/ApiEvent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

import Home from "../admin/Home";
import Main from "../user/Main";
import UserHome from "../user/UserHome";
import LoginUser from "../user/LoginUser";
import Sport from "../user/Sport";
import AccountPage from "../user/AccountPage";
import SignUp from "../user/SignUp";
import Ticket from "../user/Ticket";
import Account from "../user/Account";
import ViewTicket from "../user/ViewTicket";
import Wishlist from "../user/Wishlist";
import Profile from "../user/Profile";
import Setting from "../user/Setting";
import EventInfo from "../user/EventInfo";
import { ProtectedRoute } from "./components/Reusable";
import Events from "../user/Events";

import EventMang from "../admin/EventMang";
import AddEvent from "../admin/AddEvent";
import TicketOrders from "../admin/TicketOrders";
import Configuration_Setting from "../admin/Configuration_Setting";
import CreateNotification from "../admin/CreateNotification";
import Dashboard from "../admin/Dashboard";
import General from "../admin/General";
import Graphs from "../admin/Graphs";
import Guage from "../admin/Guage";
import LoginPage from "../admin/LoginPage";
import Marketing from "../admin/Marketing";
import Notification_Setting from "../admin/Notification_Setting";
import Payment from "../admin/Payment";
import Performance from "../admin/Performance";
import Portfolio from "../admin/Portfolio";
import Privacy_Setting from "../admin/Privacy_Setting";
import Report from "../admin/Report";
import RevenueGraph from "../admin/RevenueGraph";
import Review from "../admin/Review";
import User_Setting from "../admin/User_Setting";
import User from "../admin/User";
import Verification from "../admin/Verification";

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

// Google OAuth handler page
const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsLoggedIn } = useService();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("access_token", token);
      setIsLoggedIn(true);
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [location, navigate, setIsLoggedIn]);

  return (
    <div className="flex items-center justify-center h-screen">
      <span>Signing you in with Google...</span>
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence>
      <Toaster position="top-right" />
      <Routes key={location.pathname} location={location}>
        {/* Google OAuth Redirect Handler */}
        <Route path="/google-auth" element={<GoogleAuthHandler />} />
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
          path="/admin/users"
          element={
            <Home>
              <PageWrapper>
                <User />
              </PageWrapper>
            </Home>
          }
        />
        <Route
          path="/admin/events"
          element={
            <Home>
              <PageWrapper>
                <EventMang />
              </PageWrapper>
            </Home>
          }
        />
        <Route
          path="/admin/events/add"
          element={
            <Home>
              <PageWrapper>
                <AddEvent />
              </PageWrapper>
            </Home>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <Home>
              <PageWrapper>
                <TicketOrders />
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
          path="/events/:eventId"
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
