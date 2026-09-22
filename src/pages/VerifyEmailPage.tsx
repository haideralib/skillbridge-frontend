import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { verifyEmail } from "../api/services/auth.service";
import { useAuthStore } from "../stores/auth.store";

export const VerifyEmailPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const setEmailVerified = useAuthStore((state) => state.setEmailVerified);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        if (!isAuthenticated) {
            setStatus("error");
            setMessage("Please sign in before opening your verification link.");
            return;
        }

        if (!token) {
            setStatus("error");
            setMessage("This verification link is incomplete.");
            return;
        }

        verifyEmail(token)
            .then(() => {
                setEmailVerified();
                setStatus("success");
                setMessage("Your email has been verified successfully.");
            })
            .catch((error) => {
                const errorMessage = axios.isAxiosError<{ message?: string }>(error)
                    ? error.response?.data?.message ?? "This verification link is invalid or expired."
                    : "This verification link is invalid or expired.";
                setStatus("error");
                setMessage(errorMessage);
            });
    }, [isAuthenticated, setEmailVerified, token]);

    const profilePath = user?.role === "employer" ? "/profile/recruiter" : "/profile/candidate";

    return (
        <section className="email-verification-page">
            <div className="email-verification-panel">
                <p className="eyebrow"><span className="eyebrow-dot" /> Account security</p>
                <h1>{status === "loading" ? "Verifying your email" : status === "success" ? "Email verified" : "Verification failed"}</h1>
                <p>{message}</p>
                {status === "success" && <button className="register-submit" type="button" onClick={() => navigate(profilePath)}>Back to your account <span>→</span></button>}
                {status === "error" && !isAuthenticated && <button className="register-submit" type="button" onClick={() => navigate("/login")}>Sign in <span>→</span></button>}
            </div>
        </section>
    );
};