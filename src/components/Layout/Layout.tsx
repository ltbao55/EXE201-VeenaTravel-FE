import type { ReactNode } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const Layout = ({
  children,
  showHeader = true,
  showFooter = true,
}: LayoutProps) => {
  return (
    <div className="layout">
      {showHeader && <Header />}
      <main className={`main-content ${showHeader ? "with-header" : ""}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
