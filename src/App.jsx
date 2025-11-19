import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ServiceProvider } from "./Context/ServiceContext";
import { ApiProvider } from "./Context/ApiEvent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./Client/admin/Home";
import Main from "./Client/user/Main";
import LoginUser from "./Client/user/LoginUser";
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
            </Routes>
          </ApiProvider>
        </ServiceProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
