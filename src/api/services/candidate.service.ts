import type { IBaseResponse } from "../../interfaces/base.interface";
import type { IResume } from "../../interfaces/resume.interface";
import { api } from "../client";

export const uploadCandidateResume = async (file: File): Promise<IBaseResponse<undefined>> => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await api.post("/candidate/upload-resume", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};


export const getCandidateResume = async (): Promise<IBaseResponse<IResume>> => {
    const response = await api.get("/candidate/get-resume");
    return response.data;
};

export const analyzeCandidateResume = async (): Promise<IBaseResponse<IResume>> => {
    const response = await api.post("/candidate/analyze-resume");
    return response.data;
};