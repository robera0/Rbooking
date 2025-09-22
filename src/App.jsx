import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ServiceProvider } from "./Context/ServiceContext";
import Home from "./Client/admin/Home";
const App = () => {
  return (
    <BrowserRouter>
      <ServiceProvider>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      </ServiceProvider>
    </BrowserRouter>
  );
};

export default App;
