import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ChatPage from "../pages/ChatPage";
import ExplorePage from "../pages/ExplorePage";
import DashboardPage from "../pages/DashboardPage";
import ServicesPage from "../pages/ServicesPage";
import Payment from "../components/Payment/Payment.jsx";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/explore" element={<ExplorePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
