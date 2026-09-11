
export interface ICandidateProfile {
    skills: string[];
    experience: number;
    bio: string;
}

export interface IEmployerProfile {
    description: string;
    company: string;
    company_size: string;
    founded_year: number;
    industry: string;
}

export type IProfileResponse =
    | {
        name: string;
        email: string;
        role: "candidate";
        profile: ICandidateProfile;
    }
    | {
        name: string;
        email: string;
        role: "employer";
        profile: IEmployerProfile;
    }
    | {
        name: string;
        email: string;
        role: "admin";
        profile: null;
    };