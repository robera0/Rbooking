import {
  createBrowserRouter,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "../admin/Home";
import Main from "../user/Main";
import UserHome from "../user/UserHome";

import Sport from "../user/Sport";
import AccountPage from "../user/AccountPage";

import Ticket from "../user/Ticket";
import Account from "../user/Account";
import ViewTicket from "../user/ViewTicket";
import Wishlist from "../user/Wishlist";
import Profile from "../user/Profile";
import Setting from "../user/Setting";
import EventInfo from "../user/EventInfo";
import Events from "../user/Events";
import Venue from "../user/Venue";
import EventMang from "../admin/EventMang";
import AddEvent from "../admin/AddEvent";
import EditEvent from "../admin/EditEvent";
import TicketOrders from "../admin/TicketOrders";
import Dashboard from "../admin/Dashboard";
import User from "../admin/User";
import LoginPage from "../admin/LoginPage";
import Marketing from "../admin/Marketing";
import Report from "../admin/Report";
import Payment from "../admin/Payment";
import AdminAccount from "../admin/AdminAccount";
import CreateNotification from "../admin/CreateNotification";
import AdminViewTicket from "../admin/AdminViewTicket";
import { ProtectedRoute } from "./components/Reusable";
import { GoogleAuthHandler } from "./components/GoogleAuthHandler";
import RegistrationPage from "../admin/RegistrationPage";

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -15, scale: 0.99 },
};

const pageTransition = {
  type: "spring",
  damping: 25,
  stiffness: 150,
  mass: 1,
};

const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
    className="h-full w-full origin-top"
  >
    {children}
  </motion.div>
);

const Root = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Outlet key={location.pathname} />
    </AnimatePresence>
  );
};

const API_URL = import.meta.env.VITE_API_URL;

export const editEventLoader = async ({ params }) => {
  const res = await fetch(`${API_URL}/api/events/${params.eventId}`);
  if (!res.ok) throw new Error("Failed to fetch event data");
  return res.json();
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "google-auth",
        element: <GoogleAuthHandler />,
      },
      {
        path: "admin/register",
        element: (
          <PageWrapper>
            <RegistrationPage />
          </PageWrapper>
        ),
      },
      {
        path: "login",
        element: (
          <PageWrapper>
            <AccountPage pa="Login in to see the best of Events and Exhibitions " mode="login" />
          </PageWrapper>
        ),
      },
      {
        path: "sign_up",
        element: (
          <PageWrapper>
            <AccountPage pa="Create your account and see the best events " mode="signup" />
          </PageWrapper>
        ),
      },
      {
        path: "admin",
        element: <Home />,
        children: [
          { index: true, element: <Navigate to="home" replace /> },
          {
            path: "home",
            element: (
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            ),
          },
          {
            path: "events",
            element: (
              <PageWrapper>
                <EventMang />
              </PageWrapper>
            ),
          },
          {
            path: "events/add",
            element: (
              <PageWrapper>
                <AddEvent />
              </PageWrapper>
            ),
          },

          {
            path: "events/:eventId",
            element: (
              <PageWrapper>
                <EditEvent />
              </PageWrapper>
            ),
            loader: editEventLoader,
          },
          {
            path: "orders",
            element: (
              <PageWrapper>
                <TicketOrders />
              </PageWrapper>
            ),
          },
          {
            path: "orders/:orderId",
            element: (
              <PageWrapper>
                <AdminViewTicket />
              </PageWrapper>
            ),
          },
          {
            path: "users",
            element: (
              <PageWrapper>
                <User />
              </PageWrapper>
            ),
          },
          {
            path: "login",
            element: (
              <PageWrapper>
                <LoginPage />
              </PageWrapper>
            ),
          },
          {
            path: "marketing",
            element: (
              <PageWrapper>
                <Marketing />
              </PageWrapper>
            ),
          },
          {
            path: "reports",
            element: (
              <PageWrapper>
                <Report />
              </PageWrapper>
            ),
          },
          {
            path: "payment",
            element: (
              <PageWrapper>
                <Payment />
              </PageWrapper>
            ),
          },
          {
            path: "profile",
            element: (
              <PageWrapper>
                <AdminAccount />
              </PageWrapper>
            ),
          },
          {
            path: "setting",
            element: (
              <PageWrapper>
                <Setting />
              </PageWrapper>
            ),
          },
        ],
      },
      {
        path: "",
        element: <Main />,
        children: [
          {
            index: true,
            element: (
              <PageWrapper>
                <UserHome />
              </PageWrapper>
            ),
          },
          {
            path: "events/:eventId",
            element: (
              <PageWrapper>
                <EventInfo />
              </PageWrapper>
            ),
          },
          {
            path: "events/:eventId/tickets/:ticketId",
            element: (
              <PageWrapper>
                <EventInfo />
              </PageWrapper>
            ),
          },
          {
            path: "event",
            element: (
              <PageWrapper>
                <Events />
              </PageWrapper>
            ),
          },
          {
            path: "venues",
            element: (
              <PageWrapper>
                <Venue />
              </PageWrapper>
            ),
          },
          {
            path: "event_sports",
            element: (
              <PageWrapper>
                <Sport />
              </PageWrapper>
            ),
          },
          {
            path: "tickets_home",
            element: (
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            ),
            children: [
              {
                index: true,
                element: (
                  <PageWrapper>
                    <Ticket />
                  </PageWrapper>
                ),
              },
              {
                path: ":ticketId",
                element: (
                  <PageWrapper>
                    <ViewTicket />
                  </PageWrapper>
                ),
              },
            ],
          },
          {
            path: "account",
            element: (
              <ProtectedRoute>
                <Account>
                  <Outlet />
                </Account>
              </ProtectedRoute>
            ),
            children: [
              {
                index: true,
                element: (
                  <PageWrapper>
                    <Profile />
                  </PageWrapper>
                ),
              },
              {
                path: "favorites",
                element: (
                  <PageWrapper>
                    <Wishlist />
                  </PageWrapper>
                ),
              },
              {
                path: "setting",
                element: (
                  <PageWrapper>
                    <Setting />
                  </PageWrapper>
                ),
              },
            ],
          },
        ],
      },
      // Redirects
      { path: "dashboard", element: <Navigate to="/admin/home" replace /> },
      { path: "admin/login", element: <Navigate to="/admin/login" replace /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
