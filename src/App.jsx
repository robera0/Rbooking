import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { ServiceProvider } from "./Context/ServiceContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from "./Client/admin/Home";
const queryClient = new QueryClient()
const App = () => {
  return (
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
      <ServiceProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      </ServiceProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
