import { Link } from "react-router-dom";

const employerBenefits = [
    { number: "01", title: "Reach the right people", text: "Put your opportunities in front of candidates actively looking for their next move." },
    { number: "02", title: "Showcase your company", text: "Give candidates a clear view of your team, culture, and the work they could do with you." },
    { number: "03", title: "Move from interest to hire", text: "Keep your open roles organized and make every candidate conversation easier to manage." },
];

export const EmployersPage = () => {
    return (
        <div className="employers-page">
            <section className="employers-hero">
                <div className="employers-hero-copy">
                    <p className="eyebrow"><span className="eyebrow-dot" /> For employers</p>
                    <h1>Build the team that moves your business <em>forward.</em></h1>
                    <p>Share your opportunities with thoughtful candidates and make your company easier to discover.</p>
                    <div className="employers-actions"><Link className="register-submit" to="/jobs/new">Post a new job <span>→</span></Link><Link className="employers-text-link" to="/signup">Create an employer account <span>↗</span></Link></div>
                </div>
                <div className="employers-hero-panel"><span className="employers-panel-label">Your hiring workspace</span><div className="employers-panel-stat"><strong>01</strong><span>Clear roles, better matches</span></div><div className="employers-panel-lines"><span /><span /><span /><span /></div><div className="employers-panel-footer"><span>SkillBridge</span><strong>Ready when you are.</strong></div></div>
            </section>

            <section className="employers-benefits"><div className="employers-section-heading"><div><p className="eyebrow muted">A better way to hire</p><h2>Make every opening count.</h2></div><p>Everything you need to tell a stronger story about the work, the team, and the opportunity.</p></div><div className="employer-benefit-grid">{employerBenefits.map((benefit) => <article className="employer-benefit" key={benefit.number}><span>{benefit.number}</span><h3>{benefit.title}</h3><p>{benefit.text}</p></article>)}</div></section>

            <section className="employers-cta"><div><p className="eyebrow"><span className="eyebrow-dot" /> Start hiring</p><h2>Your next great hire is looking for the right signal.</h2></div><Link className="register-submit" to="/jobs/new">Post a job <span>→</span></Link></section>
        </div>
    );
};