import { api } from "../client";
import type { IBaseResponse } from "../../interfaces/base.interface";
import type { IRegister, IRegisterResponse } from "../../interfaces/register.interface";
import type { IUserResponse } from "../../interfaces/login.interface";
import type { IProfileResponse } from "../../interfaces/profile.interface";

export const registerUser = async (payload: IRegister) => {
    const response = await api.post<IBaseResponse<IRegisterResponse>>("/auth/register", payload);
    return response.data;
};

export const loginUser = async (payload: { email: string; password: string }): Promise<IBaseResponse<IUserResponse>> => {
    const response = await api.post<IBaseResponse<IUserResponse>>("/auth/login", payload);
    return response.data;
};

export const getProfile = async (): Promise<IBaseResponse<IProfileResponse>> => {
    const response = await api.get<IBaseResponse<IProfileResponse>>("/auth/profile");
    return response.data;
};

export const logoutUser = async (): Promise<void> => {
    await api.post("/auth/logout");
};

export const sendEmailVerification = async (): Promise<IBaseResponse<null>> => {
    const response = await api.post<IBaseResponse<null>>("/auth/email-verification/send");
    return response.data;
};

export const verifyEmail = async (token: string): Promise<IBaseResponse<null>> => {
    const response = await api.get<IBaseResponse<null>>(`/auth/email-verification/${token}`);
    return response.data;
};