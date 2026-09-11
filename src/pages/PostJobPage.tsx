import { useState } from "react";
import { Link } from "react-router-dom";
import { createJob } from "../api/services/job.service";

const steps = ["Basics", "Workplace", "Details", "Review"];

interface JobDraft {
    title: string;
    description: string;
    jobType: string;
    experienceLevel: string;
    workplace: string;
    city: string;
    address: string;
    salaryMin: string;
    salaryMax: string;
    skills: string;
    deadline: string;
    vacancies: string;
}

const initialDraft: JobDraft = {
    title: "",
    description: "",
    jobType: "Full-time",
    experienceLevel: "Mid-level",
    workplace: "Remote",
    city: "",
    address: "",
    salaryMin: "",
    salaryMax: "",
    skills: "",
    deadline: "",
    vacancies: "1",
};

export const PostJobPage = () => {
    const [step, setStep] = useState(1);
    const [draft, setDraft] = useState<JobDraft>(initialDraft);
    const [published, setPublished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const updateDraft = (field: keyof JobDraft, value: string) => {
        setDraft((current) => ({ ...current, [field]: value }));
    };

    const publishJob = async () => {
        setSubmitError("");

        setIsSubmitting(true);
        try {
            const salaryMin = draft.salaryMin ? Number(draft.salaryMin) : undefined;
            const salaryMax = draft.salaryMax ? Number(draft.salaryMax) : undefined;
            await createJob({
                title: draft.title.trim(),
                description: draft.description.trim(),
                location: {
                    city: draft.city.trim(),
                    address: draft.address.trim(),
                },
                jobType: draft.jobType,
                workplace: draft.workplace,
                ...(salaryMin !== undefined || salaryMax !== undefined ? { salary: { min: salaryMin, max: salaryMax, currency: "PKR" } } : {}),
                skills: draft.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
                experienceLevel: draft.experienceLevel,
                vacancies: Number(draft.vacancies),
                ...(draft.deadline ? { applicationDeadline: draft.deadline } : {}),
            });
            setPublished(true);
        } catch (error) {
            const message = error && typeof error === "object" && "response" in error
                ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "The job could not be published.")
                : "The job could not be published. Check your connection and try again.";
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const continueStep = () => setStep((current) => Math.min(current + 1, steps.length));
    const previousStep = () => setStep((current) => Math.max(current - 1, 1));

    if (published) {
        return (
            <div className="post-job-page">
                <section className="post-job-card post-job-success" aria-live="polite">
                    <span className="post-job-success-icon">✓</span>
                    <p className="eyebrow muted">Preview complete</p>
                    <h1>Your job has been published.</h1>
                    <p>Your listing was published successfully and is now available to candidates.</p>
                    <div className="post-job-actions"><Link className="post-job-secondary" to="/profile/recruiter">Back to dashboard</Link><button className="register-submit" type="button" onClick={() => { setPublished(false); setStep(1); }}>Create another job <span>→</span></button></div>
                </section>
            </div>
        );
    }

    return (
        <div className="post-job-page">
            <section className="post-job-card" aria-labelledby="post-job-heading">
                <div className="post-job-heading"><div><Link className="post-job-back" to="/profile/recruiter">← Employer dashboard</Link><p className="eyebrow muted">Create a listing</p><h1 id="post-job-heading">Post a new job</h1><p>Give the right candidates a clear reason to join your team.</p></div><span className="post-job-ui-note">UI preview</span></div>
                <div className="post-job-progress" aria-label="Job post progress">{steps.map((label, index) => <div className={step >= index + 1 ? "post-job-step active" : "post-job-step"} key={label}><span>{index + 1}</span><small>{label}</small></div>)}</div>

                {step === 1 && <div className="post-job-section"><div className="post-job-section-heading"><span className="section-number">01</span><div><h2>Start with the role</h2><p>Help candidates understand what they would be doing.</p></div></div><div className="post-job-fields"><label>Job title<input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="e.g. Senior Frontend Engineer" /></label><label>Job type<select value={draft.jobType} onChange={(event) => updateDraft("jobType", event.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></label><label>Experience level<select value={draft.experienceLevel} onChange={(event) => updateDraft("experienceLevel", event.target.value)}><option>Entry-level</option><option>Mid-level</option><option>Senior-level</option></select></label><label className="post-job-wide">Role description<textarea rows={7} value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} placeholder="Describe the role, team, and impact this person will have." /></label></div></div>}

                {step === 2 && <div className="post-job-section"><div className="post-job-section-heading"><span className="section-number">02</span><div><h2>Set the workplace</h2><p>Share where and how the team works.</p></div></div><div className="post-job-fields"><label>Workplace<select value={draft.workplace} onChange={(event) => updateDraft("workplace", event.target.value)}><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label><label>City<input value={draft.city} onChange={(event) => updateDraft("city", event.target.value)} placeholder="e.g. Austin" /></label><label className="post-job-wide">Office address<span className="label-hint">Optional for remote roles</span><input value={draft.address} onChange={(event) => updateDraft("address", event.target.value)} placeholder="Street address or neighborhood" /></label></div></div>}

                {step === 3 && <div className="post-job-section"><div className="post-job-section-heading"><span className="section-number">03</span><div><h2>Add the details</h2><p>Make the opportunity easier to compare and discover.</p></div></div><div className="post-job-fields"><label>Minimum salary<input type="number" min="0" value={draft.salaryMin} onChange={(event) => updateDraft("salaryMin", event.target.value)} placeholder="e.g. 120000" /></label><label>Maximum salary<input type="number" min="0" value={draft.salaryMax} onChange={(event) => updateDraft("salaryMax", event.target.value)} placeholder="e.g. 160000" /></label><label>Number of vacancies<input type="number" min="1" step="1" value={draft.vacancies} onChange={(event) => updateDraft("vacancies", event.target.value)} /></label><label className="post-job-wide">Skills<span className="label-hint">Separate skills with commas</span><input value={draft.skills} onChange={(event) => updateDraft("skills", event.target.value)} placeholder="React, TypeScript, accessibility" /></label><label>Application deadline<input type="date" value={draft.deadline} onChange={(event) => updateDraft("deadline", event.target.value)} /></label></div></div>}

                {step === 4 && <div className="post-job-section"><div className="post-job-section-heading"><span className="section-number">04</span><div><h2>Review your listing</h2><p>Check the details before this listing is published.</p></div></div><dl className="post-job-review"><div><dt>Role</dt><dd>{draft.title || "Untitled role"}</dd></div><div><dt>Type</dt><dd>{draft.jobType} · {draft.experienceLevel}</dd></div><div><dt>Workplace</dt><dd>{draft.workplace}{draft.city ? ` · ${draft.city}` : ""}</dd></div><div><dt>Vacancies</dt><dd>{draft.vacancies || "1"}</dd></div><div><dt>Salary</dt><dd>{draft.salaryMin || draft.salaryMax ? `${draft.salaryMin || "-"} - ${draft.salaryMax || "-"}` : "Not specified"}</dd></div><div className="post-job-review-wide"><dt>Description</dt><dd>{draft.description || "No description added yet."}</dd></div></dl></div>}

                {submitError && <p className="form-error" role="alert">{submitError}</p>}
                <div className="post-job-footer"><Link className="post-job-secondary" to="/profile/recruiter">Cancel</Link><div>{step > 1 && <button className="post-job-secondary" type="button" onClick={previousStep}>Back</button>}{step < steps.length ? <button className="register-submit" type="button" onClick={continueStep}>Continue <span>→</span></button> : <button className="register-submit" type="button" disabled={isSubmitting} onClick={() => void publishJob()}>{isSubmitting ? "Publishing..." : "Publish job"} <span>→</span></button>}</div></div>
            </section>
        </div>
    );
};