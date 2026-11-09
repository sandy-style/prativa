import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const ManchLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#191919]">
      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default ManchLayout;
