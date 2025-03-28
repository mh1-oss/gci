
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => (
  <div className="container-custom py-8">
    <Skeleton className="h-[50vh] w-full rounded-lg" />
  </div>
);

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
