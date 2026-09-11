import { Link } from "react-router-dom";

const resources = [
    { number: "01", category: "For candidates", title: "Build a profile that gets noticed", text: "Turn your experience into a clear story that helps the right employers find you." },
    { number: "02", category: "Job search", title: "Find work that fits your next move", text: "Use your skills, location, and goals to make your search more focused." },
    { number: "03", category: "Career growth", title: "Make your next conversation count", text: "Prepare for interviews and show up with thoughtful questions and confidence." },
    { number: "04", category: "For employers", title: "Write a stronger job post", text: "Give candidates the context they need to understand the role and your team." },
];

export const CareerResourcesPage = () => {
    return (
        <div className="resources-page">
            <section className="resources-hero">
                <div className="resources-hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Career resources</p><h1>Make your next move with <em>clarity.</em></h1><p>Practical ideas for finding the right opportunity, telling your story, and building a career that keeps moving.</p><div className="resources-hero-actions"><a className="register-submit" href="#resources">Explore resources <span>↓</span></a><Link className="resources-text-link" to="/signup">Create your profile <span>↗</span></Link></div></div>
                <div className="resources-feature"><span className="resources-feature-label">Featured guide</span><strong>01</strong><h2>The clearer your story, the easier it is to find the right fit.</h2><p>Start with the experience you have, then shape it around where you want to go next.</p><a href="#resources">Read the guide <span>→</span></a></div>
            </section>

            <section className="resources-list" id="resources"><div className="resources-section-heading"><div><p className="eyebrow muted">Guides for the road ahead</p><h2>Useful, when you need it.</h2></div><p>Small improvements add up. Browse ideas for each part of your career search.</p></div><div className="resource-grid">{resources.map((resource) => <article className="resource-card" key={resource.number}><div className="resource-card-top"><span>{resource.number}</span><small>{resource.category}</small></div><h3>{resource.title}</h3><p>{resource.text}</p><a href="#resources">Explore topic <span>→</span></a></article>)}</div></section>

            <section className="resources-bottom"><div><p className="eyebrow"><span className="eyebrow-dot" /> Keep moving</p><h2>Your next opportunity starts with one useful step.</h2></div><Link className="register-submit" to="/">Browse opportunities <span>→</span></Link></section>
        </div>
    );
};