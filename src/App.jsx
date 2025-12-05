import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ServiceProvider } from "./Context/ServiceContext";
import { ApiProvider } from "./Context/ApiEvent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./Client/admin/Home";
import Main from "./Client/user/Main";
import UserHome from "./Client/user/UserHome";
import LoginUser from "./Client/user/LoginUser";
import Sport from "./Client/user/Sport";
import Concert from "./Client/user/Concert";
import Exhibition from "./Client/user/Exhibition";
import Fest from "./Client/user/Fest";
const queryClient = new QueryClient();
const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ServiceProvider>
          <ApiProvider>
            <Routes>
              <Route path="/" element={<LoginUser />} />
              <Route path="/home" element={<Home />} />

              <Route
                path="/event_home"
                element={
                  <Main>
                    <UserHome />
                  </Main>
                }
              />
              <Route
                path="/event_sports"
                element={
                  <Main>
                    <Sport />
                  </Main>
                }
              />
              <Route
                path="/event_concerts"
                element={
                  <Main>
                    <Concert />
                  </Main>
                }
              />
              <Route
                path="/event_fest"
                element={
                  <Main>
                    <Fest />
                  </Main>
                }
              />
              <Route
                path="/event_exhibition"
                element={
                  <Main>
                    <Exhibition />
                  </Main>
                }
              />
            </Routes>
          </ApiProvider>
        </ServiceProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
