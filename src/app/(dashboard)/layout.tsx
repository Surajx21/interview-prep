import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import React from "react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default Layout;
