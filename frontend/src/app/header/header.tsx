"use client";

import "../CSS/header.css";
import { useRouter } from "next/navigation";

export default function Header(){

    const router = useRouter();

    function handleSignUp(){
        router.push("/auth/signup")
    }
    function handleSignIn(){
        router.push("/auth/signin")
    }
    function handleAbout(){
        router.push("/about")
    }
    return(
        <>
            <div className="header">
                <div className="left-section" >
                    CA
                </div>
                <div className="middle-section">
                    Chat Application
                </div>
                <div className="right-section">
                    {/* {show && (
                        <>
                            <div>
                                <button onClick={handleSignUp} className="buttons">
                                    SignUp
                                </button>
                            </div>

                            <div>
                                <button onClick={handleSignIn} className="buttons">
                                    SignIn
                                </button>
                            </div>
                        </>
                    ) } */}
                    <div>
                                <button onClick={handleSignUp} className="buttons">
                                    SignUp
                                </button>
                            </div>

                            <div>
                                <button onClick={handleSignIn} className="buttons">
                                    SignIn
                                </button>
                            </div>
                    <div>
                        <button onClick={handleAbout}  className="buttons">About</button>
                    </div>
                </div>
            </div>
        </>
    )
}