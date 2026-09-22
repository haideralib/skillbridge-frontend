import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { getReceivedApplicationById, type ApplicationResult } from "../api/services/application.service";

export const ApplicationDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [application, setApplication] = useState<ApplicationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        getReceivedApplicationById(id)
            .then(setApplication)
            .catch((requestError) => {
                const message = axios.isAxiosError<{ message?: string }>(requestError)
                    ? requestError.response?.data?.message
                    : undefined;
                setError(message ?? "This application could not be found.");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="profile-page"><main className="application-details-page"><p>Loading application...</p></main></div>;
    if (error || !application) return <div className="profile-page"><main className="application-details-page"><p className="form-error" role="alert">{error || "This application could not be found."}</p><Link className="job-view-back" to="/profile/recruiter">← Back to applications</Link></main></div>;

    return (
        <div className="profile-page">
            <main className="application-details-page">
                <Link className="job-view-back" to="/profile/recruiter">← Back to applications</Link>
                <header className="application-details-header"><div><p className="eyebrow"><span className="eyebrow-dot" /> Application review</p><h1>{application.candidate.user.name}</h1><p>{application.job.title} · {application.candidate.user.email}</p></div><strong className="status-active">{application.status}</strong></header>
                <section className="application-details-grid">
                    <article className="application-detail-panel"><h2>Candidate profile</h2><div className="application-detail-list"><div><span>Experience</span><strong>{application.candidate.experience} years</strong></div><div><span>Email</span><strong>{application.candidate.user.email}</strong></div><div><span>Skills</span><strong>{application.candidate.skills.join(", ") || "Not provided"}</strong></div></div><h3>About</h3><p>{application.candidate.bio || "No candidate bio provided."}</p></article>
                    <article className="application-detail-panel"><h2>Cover letter</h2><p className="cover-letter-copy">{application.coverLetter}</p></article>
                </section>
            </main>
        </div>
    );
};