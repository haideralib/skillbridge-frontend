import { Link, Outlet } from "react-router-dom";
import{ NavBar } from "./components/Navbar"
import{ Footer } from "./components/Footer"
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "./stores/auth.store";

export const MainLayout = () => {
  const user = useAuthStore((state) => state.user);
  const showVerificationBanner = Boolean(user && !user.isEmailVerified);
  const profilePath = user?.role === "employer" ? "/profile/recruiter" : "/profile/candidate";

  return (
       <div>
        <ToastContainer/>
        {showVerificationBanner && <div className="email-verification-banner" role="status">
          <span>Please verify your email to keep your account secure.</span>
          <Link to={profilePath}>Go to profile settings and click Verify email <span aria-hidden="true">→</span></Link>
        </div>}
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