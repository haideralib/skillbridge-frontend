import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { IEmployerProfile } from "../interfaces/profile.interface";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate } from "react-router-dom";

const initialProfile: IEmployerProfile = {
	company: "",
	description: "",
	company_size: "",
	founded_year: 0,
	industry: "",
};

export const RecruiterProfilePage = () => {
	const navigate = useNavigate();
	const user = useAuthStore((state) => state.user);
	const storedProfile = useAuthStore((state) => state.profile);
	const setProfile = useAuthStore((state) => state.setProfile);
	const [activeView, setActiveView] = useState<"profile" | "jobs" | "settings">("profile");
	const [isEditing, setIsEditing] = useState(false);
	const [saved, setSaved] = useState(false);
	const { register, control, reset, handleSubmit } = useForm<IEmployerProfile>({ defaultValues: initialProfile });
	const employerProfile = storedProfile?.role === "employer" ? storedProfile.profile : initialProfile;
	const displayName = employerProfile.company || user?.name || "Employer";
	const initials = displayName.slice(0, 2).toUpperCase();

	useEffect(() => {
		reset(employerProfile);
	}, [employerProfile, reset]);

	const profile = useWatch({ control });

	const saveProfile = (data: IEmployerProfile) => {
		if (user) {
			setProfile({ name: user.name, email: user.email, role: "employer", profile: data });
		}
		setIsEditing(false);
		setSaved(true);
		window.setTimeout(() => setSaved(false), 3000);
	};

	const handlePostJob = () => {
		navigate("/jobs/new");
	};

	return (
		<div className="profile-page">
			<div className="profile-shell">
				<aside className="profile-sidebar">
					<div className="profile-identity"><div className="profile-avatar recruiter-avatar">{initials}</div><strong>{displayName}</strong><span>Employer account</span></div>
					<nav className="profile-nav" aria-label="Recruiter navigation">
						<button className={activeView === "profile" ? "profile-nav-item active" : "profile-nav-item"} type="button" onClick={() => setActiveView("profile")}><span>◉</span> Company profile</button>
						<button className={activeView === "jobs" ? "profile-nav-item active" : "profile-nav-item"} type="button" onClick={() => setActiveView("jobs")}><span>▤</span> Job postings</button>
						<button className={activeView === "settings" ? "profile-nav-item active" : "profile-nav-item"} type="button" onClick={() => setActiveView("settings")}><span>⚙</span> Settings</button>
					</nav>
					<a className="profile-sidebar-link" href="/">← Back to jobs</a>
				</aside>

				<main className="profile-content">
					<header className="profile-header"><div><p className="eyebrow"><span className="eyebrow-dot" /> Employer workspace</p><h1>{activeView === "profile" ? "Company profile" : activeView === "jobs" ? "Job postings" : "Account settings"}</h1><p>{activeView === "profile" ? "Give candidates a clear view of your company and mission." : activeView === "jobs" ? "Manage the roles your team is hiring for." : "Manage your recruiter account and preferences."}</p></div><div className="profile-completion"><strong>{saved ? "Changes saved" : "Verified employer"}</strong><span>{saved ? "Your company profile is up to date." : "Your company is visible to candidates."}</span></div></header>

					{activeView === "profile" && !isEditing && <section className="profile-dashboard"><div className="dashboard-user-card"><div className="dashboard-avatar recruiter-avatar">{initials}</div><div><h2>{profile.company || displayName}</h2><p>{profile.industry || "Industry not provided"}</p><span>Verified employer</span></div><button className="dashboard-edit-button" type="button" onClick={() => setIsEditing(true)}>Edit profile</button></div><div className="dashboard-stats"><div><strong>2</strong><span>Open positions</span></div><div><strong>{profile.company_size || "Not provided"}</strong><span>Company size</span></div><div><strong>{profile.founded_year || "Not provided"}</strong><span>Founded</span></div></div><div className="dashboard-grid"><section className="dashboard-panel dashboard-about"><div className="dashboard-panel-heading"><h3>About the company</h3><button type="button" onClick={() => setIsEditing(true)}>Edit</button></div><p>{profile.description || "Add a company description to introduce your organization to candidates."}</p></section><section className="dashboard-panel"><div className="dashboard-panel-heading"><h3>Recruiter details</h3></div><div className="recruiter-details"><span>Contact</span><strong>{user?.name || "Not provided"}</strong><span>Email</span><strong>{user?.email || "Not provided"}</strong></div></section></div><div className="dashboard-details"><div><span>Industry</span><strong>{profile.industry || "Not provided"}</strong></div><div><span>Location</span><strong>Not provided</strong></div><div><span>Hiring status</span><strong className="status-active">Actively hiring</strong></div></div></section>}

					{activeView === "profile" && isEditing && <form className="profile-form" onSubmit={handleSubmit(saveProfile)}><section className="profile-section"><div className="profile-section-heading"><span className="section-number">01</span><div><h2>Company details</h2><p>Keep your public company information current.</p></div></div><label className="profile-field" htmlFor="company-name">Company name<input id="company-name" {...register("company")} /></label><label className="profile-field" htmlFor="company-description">Company description<textarea id="company-description" rows={7} {...register("description")} /></label></section><div className="profile-actions"><span>Only verified details are shown to candidates.</span><button className="register-submit" type="submit">Save profile <span>→</span></button></div></form>}

					{activeView === "jobs" && <section className="settings-panel"><div className="settings-row"><div><strong>Senior Frontend Engineer</strong><span>Remote · Engineering · 2 applicants</span></div><strong className="status-active">Active</strong></div><div className="settings-row"><div><strong>Product Designer</strong><span>Remote · Design · 5 applicants</span></div><strong className="status-active">Active</strong></div><button className="register-submit recruiter-post-button" type="button" onClick={handlePostJob}>Post a new job <span>→</span></button></section>}
					{activeView === "settings" && <section className="settings-panel"><div className="settings-row"><div><strong>Candidate alerts</strong><span>Receive updates when candidates apply.</span></div><input type="checkbox" defaultChecked /></div><div className="settings-row"><div><strong>Company visibility</strong><span>Allow candidates to discover your company.</span></div><input type="checkbox" defaultChecked /></div></section>}
				</main>
			</div>
		</div>
	);
};
