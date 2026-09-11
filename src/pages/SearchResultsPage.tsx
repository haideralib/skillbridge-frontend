import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { searchJobs, type JobResult } from "../api/services/job.service";

const pageSize = 10;

const getCompany = (job: JobResult) => typeof job.employer === "string" ? "Company" : job.employer.company ?? "Company";

export const SearchResultsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [jobs, setJobs] = useState<JobResult[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const title = searchParams.get("q") ?? "";
    const location = searchParams.get("location") ?? "";
    const jobType = searchParams.get("jobType") ?? "";
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);

    useEffect(() => {
        let active = true;
        searchJobs({ title, location, jobType: jobType || undefined, page, limit: pageSize })
            .then((result) => {
                if (!active) return;
                setJobs(result.data);
                setTotal(result.total);
                setTotalPages(result.totalPages);
            })
            .catch(() => {
                if (active) setError("Unable to load jobs. Check that the backend is running and try again.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [jobType, location, page, title]);

    const updateFilter = (name: string, value: string) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(name, value); else next.delete(name);
        next.delete("page");
        setSearchParams(next);
    };

    return (
        <div className="search-results-page">
            <section className="discovery-section">
                <div className="results-toolbar">
                    <div>
                        <p className="eyebrow muted"><span className="eyebrow-dot" /> Job search</p>
                        <h1>Search results</h1>
                        <p className="results-summary">{total} jobs found{location ? ` near ${location}` : ""}</p>
                    </div>
                    <label className="sort-control">Job type
                        <select value={jobType} onChange={(event) => updateFilter("jobType", event.target.value)}>
                            <option value="">All job types</option>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Internship</option>
                        </select>
                    </label>
                </div>
                {error && <div className="empty-state" role="alert">{error}</div>}
                <div className="search-results-list">
                    {loading && <div className="empty-state">Loading jobs...</div>}
                    {!loading && !error && jobs.length === 0 && <div className="empty-state">No jobs match your search.</div>}
                    {!loading && !error && jobs.map((job) => (
                        <Link className="role-card search-result-card" key={job._id} to={`/jobs/${job._id}`}>
                            <div className="company-mark">{getCompany(job).slice(0, 1).toUpperCase()}</div>
                            <div className="job-main"><p className="company-name">{getCompany(job)}</p><h2>{job.title}</h2><div className="role-meta"><span>⌖ {job.location.city}</span><span>{job.workplace}</span></div></div>
                            <div className="job-skills"><span className="workplace-label">{job.jobType}</span><div className="tag-row">{job.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div></div>
                            <div className="role-footer"><strong>{job.salary?.min || job.salary?.max ? `${job.salary.min ?? "-"} - ${job.salary.max ?? "-"}` : "Salary not specified"}</strong><span>{job.vacancies} {job.vacancies === 1 ? "opening" : "openings"}</span></div>
                        </Link>
                    ))}
                </div>
                {totalPages > 1 && <div className="search-pagination"><button type="button" disabled={page <= 1} onClick={() => { const next = new URLSearchParams(searchParams); next.set("page", String(page - 1)); setSearchParams(next); }}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => { const next = new URLSearchParams(searchParams); next.set("page", String(page + 1)); setSearchParams(next); }}>Next</button></div>}
            </section>
        </div>
    );
};