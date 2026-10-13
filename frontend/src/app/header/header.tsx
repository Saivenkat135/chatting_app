
"use client";

import { useRouter } from "next/navigation";
import "../CSS/header.css";

type HeaderProps = {
    showDashboard?: boolean;
};

export default function Header({ showDashboard = false }: HeaderProps) {
    const router = useRouter();

    function handleSignUp() {
        router.push("/auth/signup");
    }

    function handleSignIn() {
        router.push("/auth/signin");
    }

    function handleAbout() {
        router.push("/about");
    }

    function handleLogout() {
        // Clear the logged-in user's session data
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("user");

        // Navigate to sign-in page
        router.push("/auth/signin");
    }

    return (
        <div className="header">
            <div className="left-section">
                CA
            </div>

            <div className="middle-section">
                Chat Application
            </div> 

            <div className="right-section">
                {showDashboard ? (
                    <>
                        <button
                            onClick={handleAbout}
                            className="buttons"
                        >
                            About
                        </button>

                        <button
                            onClick={handleLogout}
                            className="buttons"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleSignUp}
                            className="buttons"
                        >
                            SignUp
                        </button>

                        <button
                            onClick={handleSignIn}
                            className="buttons"
                        >
                            SignIn
                        </button>

                        <button
                            onClick={handleAbout}
                            className="buttons"
                        >
                            About
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}