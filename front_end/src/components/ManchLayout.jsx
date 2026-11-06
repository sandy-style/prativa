import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ManchNavbar from "./ManchNavbar";

const ManchLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#191919]">
      <ManchNavbar />

      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default ManchLayout;
