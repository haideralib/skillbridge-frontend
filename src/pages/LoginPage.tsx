import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoginValidation } from "../validations/auth.validation";
import { useAuthStore } from "../stores/auth.store";

interface LoginForm {
	email: string;
	password: string;
}

export const LoginPage = () => {
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);
	const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
		resolver: zodResolver(LoginValidation) as unknown as Resolver<LoginForm>,
		mode: "onTouched",
	});

	const submitLogin = async (data: LoginForm) => {
		try {
			await login(data);
			toast.success("Welcome back to SkillBridge.", { position: "top-right", autoClose: 4000, theme: "light" });
			navigate("/");
		} catch (error) {
			const message = axios.isAxiosError<{ message?: string }>(error)
				? error.response?.data?.message ?? "Unable to sign in. Please try again."
				: "Unable to sign in. Please try again.";
			toast.error(message, { position: "top-right", autoClose: 4000, theme: "light" });
		}
	};

	return (
		<div className="auth-page">
			<section className="auth-intro">
				<p className="eyebrow"><span className="eyebrow-dot" /> Welcome back</p>
				<h1>Pick up where<br /><span>you left off.</span></h1>
				<p>Sign in to manage your applications, saved jobs, and career profile.</p>
				<div className="auth-location-note"><span>⌖</span><div><strong>Jobs matched to your location</strong><small>Keep your profile current to see more relevant opportunities.</small></div></div>
			</section>

			<section className="auth-card" aria-labelledby="login-heading">
				<div className="auth-card-heading"><p className="eyebrow muted">Your account</p><h2 id="login-heading">Sign in to SkillBridge</h2><p>New to SkillBridge? <a href="/signup">Create an account</a></p></div>
				<form className="auth-form" onSubmit={handleSubmit(submitLogin)}>
					<label htmlFor="login-email">Email address<input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />{errors.email && <small className="form-error">{errors.email.message}</small>}</label>
					<label htmlFor="login-password">Password<span className="auth-label-action"><a href="/forgot-password">Forgot password?</a></span><div className="password-input"><input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" {...register("password")} /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button></div>{errors.password && <small className="form-error">{errors.password.message}</small>}</label>
					<label className="remember-option"><input type="checkbox" /> <span>Keep me signed in</span></label>
					<button className="register-submit auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}<span>→</span></button>
				</form>
				<div className="auth-divider"><span>or</span></div>
				<button className="social-login" type="button">Continue with Google</button>
				<p className="terms-copy">By continuing, you agree to SkillBridge’s <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>
			</section>
		</div>
	);
};
