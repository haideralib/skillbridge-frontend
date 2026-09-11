import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getJobById, type JobResult } from "../api/services/job.service";

const getCompany = (job: JobResult) => typeof job.employer === "string" ? "Company" : job.employer.company ?? "Company";

export const JobViewPage = () => {
    const { id } = useParams<{ id: string }>();
    const [job, setJob] = useState<JobResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        let active = true;
        getJobById(id)
            .then((result) => { if (active) setJob(result); })
            .catch(() => { if (active) setError("This job could not be found."); })
            .finally(() => { if (active) setLoading(false); });

        return () => { active = false; };
    }, [id]);

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
                    <button className="register-submit" type="button">Apply for this job <span>→</span></button>
                </aside>
            </div>
        </div>
    );
};