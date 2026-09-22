

export interface IResume {
    url: string;
    filename: string;
    filesize: number;
    filetype: string;
    analysis?: IResumeAnalysis;
}

export interface IResumeAnalysis {
    summary: string;
    skills: string[];
    experience: string[];
    recommendations: string[];
}
