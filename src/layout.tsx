import { Outlet } from "react-router-dom";
import{ NavBar } from "./components/Navbar"
import{ Footer } from "./components/Footer"
import { ToastContainer } from "react-toastify";

export const MainLayout = () => {
  return (
       <div>
        <ToastContainer/>
         <header>
            <NavBar/> 
        </header>

        <main>
         <Outlet/>
        </main>
       
       <Footer/>
       </div>
  );
};