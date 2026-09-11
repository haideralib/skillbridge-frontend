import { api } from "../client";

export interface JobResult {
    _id: string;
    title: string;
    description: string;
    employer: string | { company?: string; industry?: string };
    location: { city: string; address: string };
    jobType: string;
    workplace: string;
    salary?: { min?: number; max?: number; currency?: string };
    skills: string[];
    experienceLevel: string;
    vacancies: number;
    createdAt: string;
}

export interface JobSearchResult {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    data: JobResult[];
}

export interface CreateJobPayload {
    title: string;
    description: string;
    location: {
        latitude?: number;
        longitude?: number;
        city: string;
        address: string;
    };
    jobType: string;
    workplace: string;
    salary?: {
        min?: number;
        max?: number;
        currency: string;
    };
    skills: string[];
    experienceLevel: string;
    vacancies: number;
    applicationDeadline?: string;
}

export const createJob = async (payload: CreateJobPayload) => {
    const response = await api.post("/jobs", payload);
    return response.data;
};

export const searchJobs = async (params: { title?: string; location?: string; jobType?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ data: JobSearchResult }>("/jobs/search", { params });
    return response.data.data;
};

export const getJobById = async (id: string) => {
    const response = await api.get<{ data: JobResult }>(`/jobs/${id}`);
    return response.data.data;
};