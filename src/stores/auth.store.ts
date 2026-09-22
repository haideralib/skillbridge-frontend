import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IUserResponse } from "../interfaces/login.interface";
import type { IProfileResponse } from "../interfaces/profile.interface";
import { getProfile, loginUser, logoutUser } from "../api/services/auth.service";

interface LoginPayload {
    email: string;
    password: string;
}

export type UserRole = IUserResponse["role"];

export interface AuthState {
    user: IUserResponse | null;
    profile: IProfileResponse | null;
    role: UserRole | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isCandidate: boolean;
    isEmployer: boolean;
    isAdmin: boolean;
    hasRole: (roles: UserRole | UserRole[]) => boolean;
    setEmailVerified: () => void;
    setProfile: (profile: IProfileResponse) => void;
    login: (payload: LoginPayload) => Promise<void>;
    loadProfile: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            role: null,
            isLoading: false,
            isAuthenticated: false,
            isCandidate: false,
            isEmployer: false,
            isAdmin: false,

            hasRole: (roles) => {
                const role = get().role;
                return role !== null && (Array.isArray(roles) ? roles : [roles]).includes(role);
            },

            setEmailVerified: () => set((state) => state.user ? {
                user: { ...state.user, isEmailVerified: true },
                profile: state.profile ? { ...state.profile, isEmailVerified: true } : state.profile
            } : {}),
            
            setProfile: (profile) => set({ profile }),

            login: async (payload) => {
                set({ isLoading: true });
                try {
                    const response = await loginUser(payload);
                    const role = response.data.role;
                    set({
                        user: response.data,
                        role,
                        isAuthenticated: true,
                        isCandidate: role === "candidate",
                        isEmployer: role === "employer",
                        isAdmin: role === "admin"
                    });
                    await get().loadProfile();
                } finally {
                    set({ isLoading: false });
                }
            },

            loadProfile: async () => {
                const response = await getProfile();
                set({ profile: response.data });
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    if (get().isAuthenticated) await logoutUser();
                } finally {
                    set({
                        user: null,
                        profile: null,
                        role: null,
                        isAuthenticated: false,
                        isCandidate: false,
                        isEmployer: false,
                        isAdmin: false,
                        isLoading: false
                    });
                }
            }
        }),
        {
            name: "skillbridge-auth",
            onRehydrateStorage: () => (state) => {
                if (!state?.user) return;

                const role = state.user.role;
                useAuthStore.setState({
                    role,
                    isAuthenticated: true,
                    isCandidate: role === "candidate",
                    isEmployer: role === "employer",
                    isAdmin: role === "admin"
                });
            },
            partialize: (state) => ({
                user: state.user,
                profile: state.profile,
                role: state.role,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);