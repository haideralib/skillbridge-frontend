import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [location, setLocation] = useState("");

	const goToSearch = () => {
		const params = new URLSearchParams();
		if (query.trim()) params.set("q", query.trim());
		if (location.trim()) params.set("location", location.trim());
		navigate(params.toString() ? `/search?${params.toString()}` : "/search");
	};

	return (
		<div className="home-page">
			<section className="hero-section">
				<div className="hero-copy">
					<p className="eyebrow"><span className="eyebrow-dot" /> Find your next opportunity</p>
					<h1>Find your next<br /><em>great job.</em></h1>
					<p className="hero-description">Search open roles from companies hiring for the skills you bring to the table.</p>
				</div>

				<form className="search-panel" onSubmit={(event) => { event.preventDefault(); goToSearch(); }}>
					<div className="search-field search-keyword">
						<span className="field-icon">⌕</span>
							<label htmlFor="keyword">Job title, skills, or company</label>
							<input id="keyword" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Frontend Developer" />
					</div>
					<div className="search-divider" />
					<div className="search-field">
						<span className="field-icon">⌖</span>
							<label htmlFor="location">Location</label>
							<input id="location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, state, or remote" />
					</div>
					<button className="search-button" type="submit">Search jobs <span>↗</span></button>
				</form>

				<div className="popular-searches">
					<span>Popular searches</span>
					{["Frontend Developer", "Product Designer", "Remote only"].map((term) => (
						<button key={term} type="button" onClick={() => term === "Remote only" ? setLocation("remote") : setQuery(term)}>{term}</button>
					))}
				</div>
			</section>

			<section className="discovery-section">
				<div className="results-toolbar">
					<div>
						<p className="eyebrow muted"><span className="eyebrow-dot" /> Job search</p>
						<h2>Find the right opportunity</h2>
						<p className="results-summary">Search live roles from the backend.</p>
					</div>
					<button className="browse-button" type="button" onClick={goToSearch}>Browse live jobs <span>→</span></button>
				</div>

				<div className="empty-state">Use the search above to browse live job postings.</div>
				<button className="browse-button" type="button" onClick={goToSearch}>View all jobs <span>→</span></button>
			</section>

		</div>
	);
};

