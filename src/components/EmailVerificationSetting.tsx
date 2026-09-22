import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { sendEmailVerification } from "../api/services/auth.service";
import { useAuthStore } from "../stores/auth.store";

export const EmailVerificationSetting = () => {
    const isEmailVerified = useAuthStore((state) => state.user?.isEmailVerified ?? state.profile?.isEmailVerified ?? false);
    const [isSending, setIsSending] = useState(false);
    const [hasSent, setHasSent] = useState(false);

    const handleSendVerification = async () => {
        setIsSending(true);

        try {
            await sendEmailVerification();
            setHasSent(true);
            toast.success("Verification email sent. Check your inbox.", { position: "top-right", autoClose: 4000, theme: "light" });
        } catch (error) {
            const message = axios.isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message ?? "Unable to send the verification email."
                : "Unable to send the verification email.";
            toast.error(message, { position: "top-right", autoClose: 4000, theme: "light" });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="settings-row">
            <div>
                <strong>Verify your email</strong>
                <span>{isEmailVerified ? "Your email address has been confirmed." : hasSent ? "Verification link sent. Check your inbox." : "Confirm your email address to keep your account secure."}</span>
            </div>
            {isEmailVerified ? <span className="verified-badge">Verified</span> : <button className="settings-action" type="button" onClick={handleSendVerification} disabled={isSending || hasSent}>
                {isSending ? "Sending..." : hasSent ? "Email sent" : "Verify email"}
            </button>}
        </div>
    );
};