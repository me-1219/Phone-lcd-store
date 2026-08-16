import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SupportWidget from "../components/layout/SupportWidget";

const CustomerLayout = () => (
  <div className="flex min-h-screen flex-col bg-muted">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
    <SupportWidget />
  </div>
);

export default CustomerLayout;
