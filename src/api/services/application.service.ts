import type { IBaseResponse } from "../../interfaces/base.interface";
import type { Pagination } from "../../interfaces/pagination.interface";
import { api } from "../client";

export interface ApplicationResult {
    _id: string;
    status: "pending" | "reviewed" | "rejected" | "accepted";
    coverLetter: string;
    createdAt: string;
    job: { _id: string; title: string };
    candidate: {
        skills: string[];
        experience: number;
        bio: string;
        user: { name: string; email: string };
    };
}

export const applyForJob = async (jobId: string, coverLetter: string) => {
    const response = await api.post(`/jobs/${jobId}/applications`, { coverLetter });
    return response.data;
};

export const getReceivedApplications = async (params: { page: number; limit: number; sortBy: "createdAt" | "status"; sortOrder: "asc" | "desc" }) => {
    const response = await api.get<IBaseResponse<Pagination<ApplicationResult>>>("/jobs/applications/received", { params });
    return response.data.data;
};

export const getReceivedApplicationById = async (applicationId: string) => {
    const response = await api.get<IBaseResponse<ApplicationResult>>(`/jobs/applications/${applicationId}`);
    return response.data.data;
};