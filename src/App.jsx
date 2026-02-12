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
import Concert from "./Client/user/Concert";
import Exhibition from "./Client/user/Exhibition";
import Fest from "./Client/user/Fest";
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

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isLoggedIn } = useService();
  return (
    <AnimatePresence mode="wait">
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
            <PageWrapper>
              <Home />
            </PageWrapper>
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
          path="/tickets_home"
          element={
            <PageWrapper>
              <Main>
                <ProtectedRoute isLoggedIn={isLoggedIn}>
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
                <ProtectedRoute isLoggedIn={isLoggedIn}>
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
                <Account>
                  <Profile />
                </Account>
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
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
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

        <Route
          path="/event_concerts"
          element={
            <PageWrapper>
              <Main>
                <Concert />
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/event_fest"
          element={
            <PageWrapper>
              <Main>
                <Fest />
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/event_exhibition"
          element={
            <PageWrapper>
              <Main>
                <Exhibition />
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
