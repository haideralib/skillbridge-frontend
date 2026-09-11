import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import type { IRegister, IRegisterForm } from "../interfaces/register.interface";
import { RegisterValidation } from "../validations/auth.validation";
import { registerUser } from "../api/services/auth.service";
import { toast } from "react-toastify";
import axios from "axios";

const steps = ["Account", "Profile", "Review"];

export const RegisterPage = () => {
	const [step, setStep] = useState(1);
	const [submitted, setSubmitted] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const [skillInput, setSkillInput] = useState("");
	const { register, handleSubmit, setValue, control, trigger, getFieldState, formState: { errors } } = useForm<IRegisterForm>({
		resolver: zodResolver(RegisterValidation) as unknown as Resolver<IRegisterForm>,
		mode: "onTouched",
		defaultValues: { role: "candidate", skills: [], experience: 0, bio: "", company: "", description: "", company_size: "", founded_year: new Date().getFullYear(), industry: "" },
	});

	const role = useWatch({ control, name: "role" });
	const skills = useWatch({ control, name: "skills" }) ?? [];
	const values = useWatch({ control });

	const addSkill = (value: string) => {
		const skill = value.trim().replace(/,$/, "");
		if (!skill || skills.some((currentSkill) => currentSkill.toLowerCase() === skill.toLowerCase())) return;
		setValue("skills", [...skills, skill], { shouldValidate: true, shouldDirty: true });
		setSkillInput("");
	};

	const removeSkill = (skillToRemove: string) => {
		setValue("skills", skills.filter((skill) => skill !== skillToRemove), { shouldValidate: true, shouldDirty: true });
	};

	const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" || event.key === ",") {
			event.preventDefault();
			addSkill(skillInput);
		}
	};

	const continueToNextStep = async () => {
		const fields = step === 1
			? (["name", "email", "password", "location", "role"] as (keyof IRegisterForm)[])
			: role === "candidate"
				? (["skills", "experience", "bio"] as (keyof IRegisterForm)[])
				: (["company", "description"] as (keyof IRegisterForm)[]);
		await trigger();
		if (fields.every((field) => !getFieldState(field).invalid)) setStep((current) => current + 1);
	};

	const submitRegistration = async (data: IRegisterForm) => {
		const payload: IRegister = data.role === "candidate"
			? { name: data.name, email: data.email, password: data.password, location: data.location, role: "candidate", skills: data.skills, experience: data.experience, bio: data.bio }
			: { name: data.name, email: data.email, password: data.password, location: data.location, role: "employer", company: data.company, description: data.description, company_size: data.company_size, founded_year: data.founded_year, industry: data.industry };

		setSubmitError("");
		try {
			await registerUser(payload);
			setSubmitted(true);
			toast.success("Your SkillBridge account has been created.", { position: "top-right", autoClose: 4000, theme: "light" });
		} catch (error) {
			const message = axios.isAxiosError<{ message?: string }>(error)
				? error.response?.data?.message ?? "Registration failed. Please try again."
				: "Registration failed. Please try again.";
			setSubmitError(message);
		}
	};

	const errorMessage = (field: keyof IRegisterForm) => errors[field]?.message;

	return (
		<div className="register-page">
			<section className="register-intro">
				<p className="eyebrow"><span className="eyebrow-dot" /> Join SkillBridge</p>
				<h1>Make your next<br /><span>move count.</span></h1>
				<p>Connect with the right opportunities, people, and companies in your area.</p>
				<div className="register-benefits"><div><strong>01</strong><span>Find relevant jobs near you</span></div><div><strong>02</strong><span>Build a profile employers notice</span></div><div><strong>03</strong><span>Keep your search in one place</span></div></div>
			</section>

			<section className="register-card" aria-labelledby="register-heading">
				<div className="register-card-heading"><p className="eyebrow muted">Create your account</p><h2 id="register-heading">Get started for free</h2><p>Already have an account? <a href="/login">Sign in</a></p></div>
				<div className="register-steps" aria-label="Registration progress">{steps.map((label, index) => <div className={step >= index + 1 ? "register-step active" : "register-step"} key={label}><span>{index + 1}</span>{label}</div>)}</div>

				{submitted ? <div className="register-success" role="status"><strong>You’re all set to begin.</strong><span>We’ll use your location to show more relevant opportunities.</span></div> : <form className="register-form" onSubmit={handleSubmit(submitRegistration)}>
					{step === 1 && <div className="register-step-panel">
						<div className="account-switcher" role="tablist" aria-label="Account type"><input type="hidden" {...register("role")} /><button className={role === "candidate" ? "account-option active" : "account-option"} type="button" onClick={() => setValue("role", "candidate")}>I’m looking for a job</button><button className={role === "employer" ? "account-option active" : "account-option"} type="button" onClick={() => setValue("role", "employer")}>I’m hiring</button></div>
						<div className="form-row"><label htmlFor="name">Full name<input id="name" {...register("name")} />{errorMessage("name") && <small className="form-error">{errorMessage("name")}</small>}</label><label htmlFor="email">Email address<input id="email" type="email" {...register("email")} />{errorMessage("email") && <small className="form-error">{errorMessage("email")}</small>}</label></div>
						<label htmlFor="location">Your location<span className="label-hint">Used to find opportunities near you</span><div className="location-input"><span aria-hidden="true">⌖</span><input id="location" placeholder="City, state, or ZIP code" {...register("location")} /></div>{errorMessage("location") && <small className="form-error">{errorMessage("location")}</small>}</label>
						<label htmlFor="password">Create a password<input id="password" type="password" {...register("password")} />{errorMessage("password") && <small className="form-error">{errorMessage("password")}</small>}</label>
					</div>}

					{step === 2 && role === "candidate" && <div className="register-step-panel"><div className="step-heading"><span>Candidate profile</span><h3>Tell employers what you do.</h3></div><label htmlFor="skills">Skills<span className="label-hint">Add multiple skills</span><input type="hidden" {...register("skills")} /><div className="skills-input"><div className="skill-chips">{skills.map((skill) => <span className="skill-chip" key={skill}>{skill}<button type="button" aria-label={`Remove ${skill}`} onClick={() => removeSkill(skill)}>×</button></span>)}</div><input id="skills" value={skillInput} placeholder={skills.length ? "Add another skill" : "Type a skill and press Enter"} onChange={(event) => setSkillInput(event.target.value)} onKeyDown={handleSkillKeyDown} onBlur={() => addSkill(skillInput)} /></div>{errorMessage("skills") && <small className="form-error">{errorMessage("skills")}</small>}</label><label htmlFor="experience">Years of experience<input id="experience" type="number" min={0} {...register("experience", { valueAsNumber: true })} />{errorMessage("experience") && <small className="form-error">{errorMessage("experience")}</small>}</label><label htmlFor="bio">Professional summary<textarea id="bio" rows={4} placeholder="Briefly describe your experience and strengths" {...register("bio")} />{errorMessage("bio") && <small className="form-error">{errorMessage("bio")}</small>}</label></div>}

					{step === 2 && role === "employer" && <div className="register-step-panel"><div className="step-heading"><span>Employer profile</span><h3>Help candidates understand your company.</h3></div><label htmlFor="company">Company name<input id="company" {...register("company")} />{errorMessage("company") && <small className="form-error">{errorMessage("company")}</small>}</label><label htmlFor="industry">Industry<input id="industry" {...register("industry")} />{errorMessage("industry") && <small className="form-error">{errorMessage("industry")}</small>}</label><label htmlFor="company_size">Company size<input id="company_size" {...register("company_size")} />{errorMessage("company_size") && <small className="form-error">{errorMessage("company_size")}</small>}</label><label htmlFor="founded_year">Founded year<input id="founded_year" type="number" min={1800} max={new Date().getFullYear()} {...register("founded_year", { valueAsNumber: true })} />{errorMessage("founded_year") && <small className="form-error">{errorMessage("founded_year")}</small>}</label><label htmlFor="description">Company description<textarea id="description" rows={6} placeholder="What does your company do?" {...register("description")} />{errorMessage("description") && <small className="form-error">{errorMessage("description")}</small>}</label></div>}

					{submitError && <p className="form-error" role="alert">{submitError}</p>}
					{step === 3 && <div className="register-step-panel"><div className="step-heading"><span>Review details</span><h3>Ready to create your account?</h3></div><dl className="review-list"><div><dt>Account type</dt><dd>{role === "candidate" ? "Job seeker" : "Employer"}</dd></div><div><dt>Name</dt><dd>{values.name}</dd></div><div><dt>Email</dt><dd>{values.email}</dd></div><div><dt>Location</dt><dd>{values.location}</dd></div></dl></div>}

					<div className="step-actions">{step > 1 && <button className="back-button" type="button" onClick={() => setStep((current) => current - 1)}>Back</button>}{step < 3 ? <button className="register-submit" type="button" onClick={continueToNextStep}>Continue <span>→</span></button> : <button className="register-submit" type="submit">Create my account <span>→</span></button>}</div>
					{step === 1 && <p className="terms-copy">By creating an account, you agree to SkillBridge’s <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>}
				</form>}
			</section>
		</div>
	);
};
