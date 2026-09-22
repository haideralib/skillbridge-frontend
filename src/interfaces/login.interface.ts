

export interface    IUserResponse {
    name: string;
    email: string;
    role: "candidate" | "employer" | "admin";
    isEmailVerified: boolean;
    token: string;
}