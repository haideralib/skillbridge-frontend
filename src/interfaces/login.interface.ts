

export interface    IUserResponse {
    name: string;
    email: string;
    role: "candidate" | "employer" | "admin";
    token: string;
}