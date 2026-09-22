import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./layout";
import { HomePage } from "./pages/HomePage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { CandidateProfilePage } from "./pages/CandidateProfilePage";
import { RecruiterProfilePage } from "./pages/RecruiterProfilePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PostJobPage } from "./pages/PostJobPage";
import { EmployersPage } from "./pages/EmployersPage";
import { CareerResourcesPage } from "./pages/CareerResourcesPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { JobViewPage } from "./pages/JobViewPage";
import { ApplicationDetailsPage } from "./pages/ApplicationDetailsPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";

export const routes = createBrowserRouter([
    {
        path: "/", 
        element: <MainLayout/>,
        children: [
            {path: "/", element: <HomePage/>},
            {path: "/search", element: <SearchResultsPage/>},
            {path: "/jobs/:id", element: <JobViewPage/>},
            {path: "/signup", element: <RegisterPage/>},
            {path: "/login", element: <LoginPage/>},
            {path: "/verify-email/:token", element: <VerifyEmailPage/>},
            {path: "/employers", element: <EmployersPage/>},
            {path: "/career-resources", element: <CareerResourcesPage/>},
            {
                element: <ProtectedRoute allowedRoles={["candidate"]} />,
                children: [{path: "/profile/candidate", element: <CandidateProfilePage/>}]
            },
            {
                element: <ProtectedRoute allowedRoles={["employer"]} />,
                children: [
                    {path: "/profile/recruiter", element: <RecruiterProfilePage/>},
                    {path: "/profile/recruiter/applications/:id", element: <ApplicationDetailsPage/>},
                    {path: "/jobs/new", element: <PostJobPage/>}
                ]
            },
        ]

    },
]);