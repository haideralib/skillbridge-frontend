import { z } from "zod";

const RegisterBase = {
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    location: z.string().min(2).max(100)
};

export const RegisterValidation = z.discriminatedUnion("role", [
    z.object({
        ...RegisterBase,
        role: z.literal("candidate"),
        skills: z.array(z.string().min(1)).default([]),
        experience: z.number().min(0).default(0),
        bio: z.string().max(1000).default("")
    }),
    z.object({
        ...RegisterBase,
        role: z.literal("employer"),
        company: z.string().min(1).max(100),
        description: z.string().min(1).max(2000),
        company_size: z.string().min(1).max(100),
        founded_year: z.number().int().min(1800).max(new Date().getFullYear()),
        industry: z.string().min(1).max(100)
    })
]);

export const LoginValidation = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100)
});