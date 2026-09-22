import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { KeyboardEvent } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";
import type { ICandidateProfile } from "../interfaces/profile.interface";
import type { IResume } from "../interfaces/resume.interface";
import { useAuthStore } from "../stores/auth.store";
import { analyzeCandidateResume, getCandidateResume, uploadCandidateResume } from "../api/services/candidate.service";
import { EmailVerificationSetting } from "../components/EmailVerificationSetting";

const initialProfile: ICandidateProfile = {
	skills: [],
	experience: 0,
	bio: "",
};

export const CandidateProfilePage = () => {
	const user = useAuthStore((state) => state.user);
	const profile = useAuthStore((state) => state.profile);
	const setProfile = useAuthStore((state) => state.setProfile);
	const [saved, setSaved] = useState(false);
	const [skillInput, setSkillInput] = useState("");
	const [activeView, setActiveView] = useState<"profile" | "resume" | "settings">("profile");
	const [isEditing, setIsEditing] = useState(false);
	const [resumeError, setResumeError] = useState("");
	const [resumeUploaded, setResumeUploaded] = useState(false);
	const [resume, setResume] = useState<IResume | null>(null);
	const [resumeLoading, setResumeLoading] = useState(true);
	const [showResumeAnalysis, setShowResumeAnalysis] = useState(false);
	const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
	const { register, control, setValue, reset, handleSubmit, formState: { errors } } = useForm<ICandidateProfile>({
		defaultValues: initialProfile,
		mode: "onTouched",
	});
	const candidateProfile = profile?.role === "candidate" ? profile.profile : initialProfile;
	const displayName = user?.name ?? "Candidate";
	const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

	useEffect(() => {
		reset(candidateProfile);
	}, [candidateProfile, reset]);

	useEffect(() => {
		const loadResume = async () => {
			try {
				const response = await getCandidateResume();
				setResume(response.data);
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 404) {
					setResume(null);
				} else {
					setResumeError("Unable to load your resume. Please try again.");
				}
			} finally {
				setResumeLoading(false);
			}
		};

		void loadResume();
	}, []);
	const skills = useWatch({ control, name: "skills" }) ?? [];
	const values = useWatch({ control });

	const addSkill = (value: string) => {
		const skill = value.trim().replace(/,$/, "");
		if (!skill || skills.some((currentSkill) => currentSkill.toLowerCase() === skill.toLowerCase())) return;
		setValue("skills", [...skills, skill], { shouldDirty: true, shouldValidate: true });
		setSkillInput("");
	};

	const removeSkill = (skillToRemove: string) => {
		setValue("skills", skills.filter((skill) => skill !== skillToRemove), { shouldDirty: true, shouldValidate: true });
	};

	const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" || event.key === ",") {
			event.preventDefault();
			addSkill(skillInput);
		}
	};

	const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setResumeError("");
		setResumeUploaded(false);
		if (file.size > 5 * 1024 * 1024) {
			setResumeError("Resume must be 5 MB or smaller.");
			return;
		}

		try {
			await uploadCandidateResume(file);
			const response = await getCandidateResume();
			setResume(response.data);
			setResumeUploaded(true);
			setShowResumeAnalysis(Boolean(response.data.analysis));
		} catch {
			setResumeError("Resume upload failed. Please try again.");
		}
		event.target.value = "";
	};

	const saveProfile = (profile: ICandidateProfile) => {
		if (user) {
			setProfile({ name: user.name, email: user.email, role: "candidate", isEmailVerified: user.isEmailVerified, profile });
		}
		setSaved(true);
		window.setTimeout(() => setSaved(false), 3000);
	};

	const handleResumeAnalysis = async () => {
		setResumeError("");
		setResumeAnalyzing(true);
		try {
			const response = await analyzeCandidateResume();
			setResume(response.data);
			setShowResumeAnalysis(true);
		} catch {
			setResumeError("Resume analysis failed. Check your backend Gemini configuration and try again.");
		} finally {
			setResumeAnalyzing(false);
		}
	};

	const downloadAnalysisPdf = async () => {
		const analysis = resume?.analysis;
		if (!analysis || !resume) return;

		const pdf = new jsPDF();
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const left = 18;
		const contentWidth = pageWidth - left * 2;
		let y = 22;

		const addPageIfNeeded = (height: number) => {
			if (y + height <= pageHeight - 18) return;
			pdf.addPage();
			y = 22;
		};
		const addParagraph = (text: string, fontSize = 11, gap = 7) => {
			pdf.setFontSize(fontSize);
			pdf.setTextColor(55, 55, 55);
			const lines = pdf.splitTextToSize(text, contentWidth) as string[];
			const lineHeight = fontSize * 0.48;
			addPageIfNeeded(lines.length * lineHeight + gap);
			pdf.text(lines, left, y);
			y += lines.length * lineHeight + gap;
		};
		const addSection = (title: string, items: string[]) => {
			addPageIfNeeded(18);
			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(13);
			pdf.setTextColor(33, 100, 243);
			pdf.text(title, left, y);
			y += 9;
			pdf.setFont("helvetica", "normal");
			if (items.length === 0) addParagraph("No information detected.", 10);
			items.forEach((item) => addParagraph(`- ${item}`, 10, 5));
			y += 3;
		};

		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(22);
		pdf.setTextColor(33, 100, 243);
		pdf.text("Resume Analysis Report", left, y);
		y += 11;
		pdf.setFont("helvetica", "normal");
		addParagraph(`${displayName} | ${resume.filename}`, 10, 3);
		addParagraph(`Generated ${new Date().toLocaleDateString()}`, 9, 12);
		addSection("Summary", [analysis.summary]);
		addSection("Skills Found", analysis.skills);
		addSection("Experience Highlights", analysis.experience);
		addSection("Recommendations", analysis.recommendations);

		pdf.setFontSize(8);
		pdf.setTextColor(130, 130, 130);
		pdf.text("Generated by SkillBridge AI Resume Review", left, pageHeight - 10);
		const reportBytes = pdf.output("arraybuffer");
		if (resume.filetype === "application/pdf" || resume.filename.toLowerCase().endsWith(".pdf")) {
			try {
				const originalResponse = await fetch(resume.url);
				if (originalResponse.ok) {
					const originalPdf = await PDFDocument.load(await originalResponse.arrayBuffer());
					const reportPdf = await PDFDocument.load(reportBytes);
					const reportPages = await originalPdf.copyPages(reportPdf, reportPdf.getPageIndices());
					reportPages.forEach((page) => originalPdf.addPage(page));
					const mergedBytes = await originalPdf.save();
					const mergedBuffer = new Uint8Array(mergedBytes).buffer as ArrayBuffer;
					const downloadUrl = URL.createObjectURL(new Blob([mergedBuffer], { type: "application/pdf" }));
					const link = document.createElement("a");
					link.href = downloadUrl;
					link.download = `${resume.filename.replace(/\.[^/.]+$/, "")}-with-analysis.pdf`;
					link.click();
					URL.revokeObjectURL(downloadUrl);
					return;
				}
			} catch {
				setResumeError("The original PDF could not be preserved. Downloading the analysis report instead.");
			}
		}

		pdf.save(`${resume.filename.replace(/\.[^/.]+$/, "")}-analysis.pdf`);
	};

	return (
		<div className="profile-page">
			<div className="profile-shell">
				<aside className="profile-sidebar">
					<div className="profile-identity"><div className="profile-avatar">{initials}</div><strong>{displayName}</strong><span>Job seeker</span></div>
					<nav className="profile-nav" aria-label="Profile navigation">
						<button className={activeView === "profile" ? "profile-nav-item active" : "profile-nav-item"} type="button" onClick={() => setActiveView("profile")}><span>◉</span> Profile</button>
						<button className={activeView === "resume" ? "profile-nav-item active" : "profile-nav-item"} type="button" onClick={() => setActiveView("resume")}><span>▤</span> Resume</button>
						<button className={activeView === "settings" ? "profile-nav-item active" : "profile-nav-item"} type="button" onClick={() => setActiveView("settings")}><span>⚙</span> Settings</button>
					</nav>
					<a className="profile-sidebar-link" href="/">← Back to jobs</a>
				</aside>

				<main className="profile-content">
					<header className="profile-header">
						<div><p className="eyebrow"><span className="eyebrow-dot" /> Candidate workspace</p><h1>{activeView === "profile" ? "Your profile" : activeView === "resume" ? "Your resume" : "Account settings"}</h1><p>{activeView === "profile" ? "Keep your experience and skills up to date for better job matches." : activeView === "resume" ? "Manage the resume employers see when you apply." : "Manage your account preferences and privacy."}</p></div>
						<div className="profile-completion"><strong>{skills.length > 0 ? "Profile in progress" : "Get started"}</strong><span>{skills.length > 0 ? "Add a bio to make your profile stronger." : "Add your skills, experience, and bio."}</span></div>
					</header>

					{activeView === "profile" && !isEditing && <section className="profile-dashboard">
						<div className="dashboard-user-card"><div className="dashboard-avatar">{initials}</div><div><h2>{displayName}</h2><p>Job seeker</p><span>Available for opportunities</span></div><button className="dashboard-edit-button" type="button" onClick={() => setIsEditing(true)}>Edit profile</button></div>
						<div className="dashboard-stats"><div><strong>{skills.length}</strong><span>Skills added</span></div><div><strong>{values.experience ?? 0}</strong><span>Years experience</span></div><div><strong>{values.bio ? "Complete" : "Needed"}</strong><span>Professional bio</span></div></div>
						<div className="dashboard-grid"><section className="dashboard-panel dashboard-about"><div className="dashboard-panel-heading"><h3>About</h3><button type="button" onClick={() => setIsEditing(true)}>Edit</button></div><p>{values.bio || "Add a short professional bio to introduce yourself to employers."}</p></section><section className="dashboard-panel"><div className="dashboard-panel-heading"><h3>Skills</h3><button type="button" onClick={() => setIsEditing(true)}>Edit</button></div>{skills.length > 0 ? <div className="skill-chips">{skills.map((skill) => <span className="skill-chip" key={skill}>{skill}</span>)}</div> : <p className="dashboard-muted">No skills added yet.</p>}</section></div>
						<div className="dashboard-details"><div><span>Email</span><strong>{user?.email ?? ""}</strong></div><div><span>Experience</span><strong>{values.experience ?? 0} years</strong></div><div><span>Profile status</span><strong className="status-active">Actively looking</strong></div></div>
					</section>}

					{activeView === "profile" && isEditing && <form className="profile-form" onSubmit={handleSubmit((profile) => { saveProfile(profile); setIsEditing(false); })}>
				<section className="profile-section"><div className="profile-section-heading"><span className="section-number">01</span><div><h2>Skills</h2><p>Add the skills you want employers to find you for.</p></div></div><label htmlFor="profile-skills">Your skills<span className="label-hint">Press Enter or comma after each skill</span><input type="hidden" {...register("skills", { validate: (value) => value.length > 0 || "Add at least one skill" })} /><div className="skills-input profile-skills-input"><div className="skill-chips">{skills.map((skill) => <span className="skill-chip" key={skill}>{skill}<button type="button" aria-label={`Remove ${skill}`} onClick={() => removeSkill(skill)}>×</button></span>)}</div><input id="profile-skills" value={skillInput} placeholder={skills.length ? "Add another skill" : "e.g. React, TypeScript, Figma"} onChange={(event) => setSkillInput(event.target.value)} onKeyDown={handleSkillKeyDown} onBlur={() => addSkill(skillInput)} /></div>{errors.skills && <small className="form-error">{errors.skills.message}</small>}</label></section>

				<section className="profile-section"><div className="profile-section-heading"><span className="section-number">02</span><div><h2>Experience</h2><p>Tell employers how much experience you bring.</p></div></div><label className="profile-field" htmlFor="profile-experience">Years of professional experience<input id="profile-experience" type="number" min={0} {...register("experience", { valueAsNumber: true, min: { value: 0, message: "Enter 0 or more years" } })} />{errors.experience && <small className="form-error">{errors.experience.message}</small>}</label></section>

				<section className="profile-section"><div className="profile-section-heading"><span className="section-number">03</span><div><h2>About you</h2><p>Write a short introduction for your candidate profile.</p></div></div><label className="profile-field" htmlFor="profile-bio">Professional bio<textarea id="profile-bio" rows={7} maxLength={1000} placeholder="Share your strengths, background, and the kind of work you are looking for." {...register("bio", { maxLength: { value: 1000, message: "Keep your bio under 1,000 characters" } })} />{errors.bio && <small className="form-error">{errors.bio.message}</small>}</label></section>

						<div className="profile-actions"><span>{saved ? "Profile saved successfully" : "Your profile is private until you choose to share it."}</span><button className="register-submit" type="submit">Save profile <span>→</span></button></div>
					</form>}

					{activeView === "resume" && <section className="profile-empty-panel">{resumeLoading ? <><h2>Loading your resume...</h2><p>Checking whether you have uploaded a resume.</p></> : resume ? <><div className="empty-panel-icon">✓</div><h2>{resume.filename}</h2><p>{resume.filetype} · {(resume.filesize / (1024 * 1024)).toFixed(2)} MB</p><div className="resume-actions"><a className="register-submit" href={resume.url} target="_blank" rel="noreferrer">View resume <span>→</span></a>{resume.analysis ? <button className="resume-analysis-button" type="button" onClick={() => setShowResumeAnalysis(true)}>View recommendations <span>✦</span></button> : <button className="resume-analysis-button" type="button" disabled={resumeAnalyzing} onClick={() => void handleResumeAnalysis()}>{resumeAnalyzing ? "Analyzing resume..." : "Analyze resume"} <span>✦</span></button>}</div><small role="status">{resume.analysis ? "Your AI resume recommendations are ready." : "Analyze your resume to get skills, summary, and recommendations."}</small>{resumeError && <small className="form-error" role="alert">{resumeError}</small>}</> : <><div className="empty-panel-icon">↑</div><h2>Upload your resume</h2><p>Add a PDF resume so employers can learn more about your experience.</p><input id="resume-upload" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onChange={handleResumeUpload} /><label className="register-submit" htmlFor="resume-upload">Upload resume <span>→</span></label>{resumeUploaded && <small role="status">Resume uploaded successfully.</small>}{resumeError && <small className="form-error" role="alert">{resumeError}</small>}<small>PDF, DOC, or DOCX up to 5 MB</small></>}</section>}
					{showResumeAnalysis && resume?.analysis && <div className="resume-analysis-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowResumeAnalysis(false); }}><section className="resume-analysis-modal" role="dialog" aria-modal="true" aria-labelledby="resume-analysis-title"><header className="resume-analysis-header"><div><p className="eyebrow"><span className="eyebrow-dot" /> AI resume review</p><h2 id="resume-analysis-title">Your resume, sharpened</h2><p>Practical suggestions based on the resume you uploaded.</p></div><div className="resume-analysis-header-actions"><button className="resume-analysis-download" type="button" onClick={() => void downloadAnalysisPdf()}>Download PDF <span>↓</span></button><button className="resume-analysis-close" type="button" aria-label="Close recommendations" onClick={() => setShowResumeAnalysis(false)}>×</button></div></header><div className="resume-analysis-summary"><span>Summary</span><p>{resume.analysis.summary}</p></div><div className="resume-analysis-grid"><div><h3>Skills found</h3>{resume.analysis.skills.length > 0 ? <ul>{resume.analysis.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul> : <p>No specific skills were detected.</p>}</div><div><h3>Experience highlights</h3>{resume.analysis.experience.length > 0 ? <ul>{resume.analysis.experience.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No experience highlights were detected.</p>}</div></div><div className="resume-analysis-recommendations"><h3>Recommendations</h3>{resume.analysis.recommendations.length > 0 ? <ul>{resume.analysis.recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ul> : <p>Upload a clearer resume or try again for recommendations.</p>}</div></section></div>}
					{activeView === "settings" && <section className="settings-panel"><EmailVerificationSetting /><div className="settings-row"><div><strong>Email notifications</strong><span>Get updates about saved jobs and applications.</span></div><input type="checkbox" defaultChecked /></div><div className="settings-row"><div><strong>Profile visibility</strong><span>Allow employers to find your candidate profile.</span></div><select defaultValue="visible"><option value="visible">Visible</option><option value="private">Private</option></select></div><div className="settings-row"><div><strong>Location matching</strong><span>Use your location for nearby job recommendations.</span></div><input type="checkbox" defaultChecked /></div></section>}
				</main>
			</div>
		</div>
	);
};
