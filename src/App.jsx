import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ServiceProvider } from "./Context/ServiceContext";
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

const queryClient = new QueryClient();

// Framer Motion variants
const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const pageTransition = {
  duration: 0.3,
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

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        <Route
          path="/"
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
          path="/home"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />

        <Route
          path="/event_home"
          element={
            <PageWrapper>
              <Main>
                <UserHome />
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/tickets_home"
          element={
            <PageWrapper>
              <Main>
                <Ticket />
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/tickets_home/view_ticket"
          element={
            <PageWrapper>
              <Main>
                <ViewTicket />
              </Main>
            </PageWrapper>
          }
        />

        <Route
          path="/account"
          element={
            <PageWrapper>
              <Main>
                <Account />
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
