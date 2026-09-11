export interface IRegisterBase {
    name: string;
    email: string;
    password: string;
    location: string;
}

export interface ICandidateRegister extends IRegisterBase {
    role: "candidate";
    skills: string[];
    experience: number;
    bio: string;
}

export interface IEmployerRegister extends IRegisterBase {
    role: "employer";
    company: string;
    description: string;
    company_size: string;
    founded_year: number;
    industry: string;
}

export type IRegister = ICandidateRegister | IEmployerRegister;

export interface IRegisterResponse {
    name: string;
    email: string;
    role: IRegister["role"];
    createdAt: Date;
}

export interface IRegisterForm extends IRegisterBase {
    role: IRegister["role"];
    skills: string[];
    experience: number;
    bio: string;
    company: string;
    description: string;
    company_size: string;
    founded_year: number;
    industry: string;
}