
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";


export const NavBar = () => {
	const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
	const profilePath = user?.role === "candidate" ? "/profile/candidate" : user?.role === "employer" ? "/profile/recruiter" : "/";
	const displayName = user?.name ?? "Account";
	const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const params = new URLSearchParams();
		if (searchTerm.trim()) params.set("q", searchTerm.trim());
		if (location.trim()) params.set("location", location.trim());
    navigate(params.toString() ? `/search?${params.toString()}` : "/search");
	};

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setMenuOpen(false);
      setProfileOpen(false);
      navigate("/login", { replace: true });
    }
	};

  return (
    <nav className="site-nav">
      <div className="nav-top">
        <Link className="brand" to="/">Skill<span>Bridge</span><i>.</i></Link>
        <button className="menu-toggle" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
      </div>
      <form className="nav-search" onSubmit={handleSearch} role="search">
        <label><span aria-hidden="true">⌕</span><input aria-label="Search jobs" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search jobs" /></label>
        <label><span aria-hidden="true">⌖</span><input aria-label="Job location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" /></label>
        <button type="submit">Search</button>
      </form>
      <div className="nav-links">
        <Link className="nav-active" to="/">Browse jobs</Link>
        <Link to="/employers">For employers</Link>
        <Link to="/career-resources">Career resources</Link>
      </div>
      <div className="nav-actions">
        {isAuthenticated && user ? <div className="profile-menu"><button className="profile-trigger" type="button" aria-expanded={profileOpen} aria-haspopup="menu" onClick={() => setProfileOpen((open) => !open)}><span className="profile-icon">{initials}</span><span>{displayName}</span><span className="profile-chevron">⌄</span></button>{profileOpen && <div className="profile-dropdown" role="menu"><Link to={profilePath} role="menuitem" onClick={() => setProfileOpen(false)}>View profile</Link><button type="button" role="menuitem" onClick={() => void handleLogout()}>Log out</button></div>}</div> : <Link className="sign-in" to="/login">Sign in</Link>}
      </div>
      {menuOpen && <div className="mobile-menu"><Link to="/" onClick={() => setMenuOpen(false)}>Browse jobs</Link><Link to="/employers" onClick={() => setMenuOpen(false)}>For employers</Link><Link to="/career-resources" onClick={() => setMenuOpen(false)}>Career resources</Link>{isAuthenticated && user ? <><Link to={profilePath} onClick={() => setMenuOpen(false)}><span className="mobile-profile-icon">{initials}</span>{displayName}</Link><button type="button" onClick={() => void handleLogout()}>Log out</button></> : <Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>}</div>}
    </nav>
  );
}