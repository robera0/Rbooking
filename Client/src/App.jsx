import {
  RouterProvider,
} from "react-router-dom";
import { ServiceProvider } from "./Context/ServiceContext";
import { ApiProvider } from "./Context/ApiEvent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppToaster from "./components/Toaster";
import { router } from "./router";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ServiceProvider>
        <ApiProvider>
          <AppToaster />
          <RouterProvider router={router} />
        </ApiProvider>
      </ServiceProvider>
    </QueryClientProvider>
  );
};

export default App;
