import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ChatPage from "../pages/ChatPage";
import ExplorePage from "../pages/ExplorePage";
import ProfilePage from "../pages/ProfilePage";
import DashboardPage from "../pages/DashboardPage";
import ServicesPage from "../pages/ServicesPage";
import Payment from "../components/Payment/Payment";
import PaymentReturn from "../components/Payment/PaymentReturn";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/explore" element={<ExplorePage />} />
        <Route path="/chat/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/return" element={<PaymentReturn />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
