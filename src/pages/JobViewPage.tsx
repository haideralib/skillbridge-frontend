import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getJobById, type JobResult } from "../api/services/job.service";
import { applyForJob } from "../api/services/application.service";
import { useAuthStore } from "../stores/auth.store";

const getCompany = (job: JobResult) => typeof job.employer === "string" ? "Company" : job.employer.company ?? "Company";

export const JobViewPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [job, setJob] = useState<JobResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [applicationError, setApplicationError] = useState("");
    const [applied, setApplied] = useState(false);
    const [applying, setApplying] = useState(false);
    const [applicationModalOpen, setApplicationModalOpen] = useState(false);
    const [coverLetter, setCoverLetter] = useState("");

    useEffect(() => {
        if (!id) return;

        let active = true;
        getJobById(id)
            .then((result) => { if (active) setJob(result); })
            .catch(() => { if (active) setError("This job could not be found."); })
            .finally(() => { if (active) setLoading(false); });

        return () => { active = false; };
    }, [id]);

    const openApplicationModal = () => {
        if (!id) return;
        if (!user) {
            navigate("/login");
            return;
        }
        if (user.role !== "candidate") {
            setApplicationError("Only candidates can apply for jobs.");
            return;
        }

        setApplicationError("");
        setApplicationModalOpen(true);
    };

    const handleApplicationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!id) return;

        const trimmedCoverLetter = coverLetter.trim();
        if (trimmedCoverLetter.length < 20) {
            setApplicationError("Please write at least 20 characters in your cover letter.");
            return;
        }

        setApplying(true);
        setApplicationError("");
        try {
            await applyForJob(id, trimmedCoverLetter);
            setApplied(true);
            setApplicationModalOpen(false);
            toast.success("Your application was submitted successfully.", { position: "top-right", autoClose: 4000, theme: "light" });
        } catch (requestError) {
            const message = axios.isAxiosError<{ message?: string }>(requestError)
                ? requestError.response?.data?.message
                : undefined;
            setApplicationError(message ?? "Application could not be submitted.");
        } finally {
            setApplying(false);
        }
    };

    if (!id) return <div className="job-view-page"><div className="empty-state" role="alert">This job could not be found.<Link className="job-view-back" to="/search">Back to search</Link></div></div>;
    if (loading) return <div className="job-view-page"><div className="empty-state">Loading job...</div></div>;
    if (error || !job) return <div className="job-view-page"><div className="empty-state" role="alert">{error || "This job could not be found."}<Link className="job-view-back" to="/search">Back to search</Link></div></div>;

    const company = getCompany(job);
    const salary = job.salary?.min || job.salary?.max
        ? `${job.salary.min ?? "-"} - ${job.salary.max ?? "-"} ${job.salary.currency ?? ""}`
        : "Salary not specified";

    return (
        <div className="job-view-page">
            <Link className="job-view-back" to="/search">← Back to search</Link>
            <section className="job-view-header">
                <div className="company-mark job-view-mark">{company.slice(0, 1).toUpperCase()}</div>
                <div><p className="company-name">{company}</p><h1>{job.title}</h1><div className="job-view-meta"><span>⌖ {job.location.city}</span><span>{job.workplace}</span><span>{job.jobType}</span></div></div>
            </section>
            <div className="job-view-layout">
                <main className="job-view-content">
                    <section><h2>About the role</h2><p>{job.description}</p></section>
                    {job.skills.length > 0 && <section><h2>Skills</h2><div className="job-view-tags">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
                </main>
                <aside className="job-view-sidebar">
                    <div><span>Location</span><strong>{job.location.address || job.location.city}</strong></div>
                    <div><span>Experience</span><strong>{job.experienceLevel}</strong></div>
                    <div><span>Salary</span><strong>{salary}</strong></div>
                    <div><span>Openings</span><strong>{job.vacancies}</strong></div>
                    <button className="register-submit" type="button" onClick={openApplicationModal} disabled={applying || applied}>{applied ? "Application submitted" : "Apply for this job"} {!applied && <span>→</span>}</button>
                    {applicationError && <small className="form-error" role="alert">{applicationError}</small>}
                </aside>
            </div>
            {applicationModalOpen && <div className="application-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setApplicationModalOpen(false); }}><section className="application-modal" role="dialog" aria-modal="true" aria-labelledby="application-modal-title"><div className="application-modal-header"><div><p className="eyebrow muted">Application</p><h2 id="application-modal-title">Make a thoughtful introduction.</h2><p>Share why you are a strong fit for {job.title} at {company}.</p></div><button className="application-modal-close" type="button" aria-label="Close application dialog" onClick={() => setApplicationModalOpen(false)}>×</button></div><form onSubmit={handleApplicationSubmit}><label className="application-cover-letter" htmlFor="cover-letter">Cover letter<span>Typed text only · 20 to 5,000 characters</span><textarea id="cover-letter" rows={9} value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} placeholder="Tell the hiring team what interests you about this role and the experience you would bring." autoFocus /></label>{applicationError && <small className="form-error" role="alert">{applicationError}</small>}<div className="application-modal-actions"><button className="back-button" type="button" onClick={() => setApplicationModalOpen(false)}>Cancel</button><button className="register-submit" type="submit" disabled={applying}>{applying ? "Submitting..." : "Submit application"}<span>→</span></button></div></form></section></div>}
        </div>
    );
};