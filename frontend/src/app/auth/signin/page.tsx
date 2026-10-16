
// "use client";

// import "../../CSS/signin.css";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Header from "../../header/header";

// export default function Signin() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function handleLogin(
//     event: React.FormEvent<HTMLFormElement>
//   ) {
//     event.preventDefault();

//     setError("");
//     setLoading(true);

//     try {
// const response = await fetch(
//   `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/user/login`,
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       email,
//       password,
//     }),
//   }
// );

// // Read the response as text first.
// const responseText = await response.text();

// let data: any = {};

// if (responseText.trim() !== "") {
//   try {
//     data = JSON.parse(responseText);
//   } catch {
//     throw new Error(
//       `Backend returned invalid JSON. HTTP status: ${response.status}. Response: ${responseText}`
//     );
//   }
// }

// // Handle unsuccessful responses.
// if (!response.ok) {
//   throw new Error(
//     data.message ||
//     data.error ||
//     `Login failed. HTTP status: ${response.status}`
//   );
// }

// // Validate successful login response.
// if (!data.accessToken || !data.user?.userId) {
//   throw new Error(
//     "Login response must contain accessToken and user.userId"
//   );
// }

// // Save JWT.
// sessionStorage.setItem("accessToken", data.accessToken);

// // Save user details.
// sessionStorage.setItem(
//   "user",
//   JSON.stringify({
//     userId: data.user.userId,
//     username: data.user.username,
//     email: data.user.email,
//   })
// );

// // Navigate to dashboard.
// router.push(
//   `/dashboard?userId=${encodeURIComponent(data.user.userId)}`
// );

//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Something went wrong"
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <>
//     <Header />
//       <div className="full-page">
//         <div className="sign-left-section">
//           image
//         </div>

//         <div className="sign-right-section">
//           <div className="form">
//             <div className="title">Sign In</div>

//             <form onSubmit={handleLogin}>
//               <div className="text">
//                 Enter the Email
//               </div>

//               <input
//                 className="input"
//                 type="email"
//                 placeholder="Enter the email"
//                 value={email}
//                 onChange={(event) =>
//                   setEmail(event.target.value)
//                 }
//                 required
//                 autoComplete="email"
//               />

//               <div className="text">
//                 Enter the password
//               </div>

//               <input
//                 className="input"
//                 type="password"
//                 placeholder="Enter the password"
//                 value={password}
//                 onChange={(event) =>
//                   setPassword(event.target.value)
//                 }
//                 required
//                 autoComplete="current-password"
//               />

//               {error && (
//                 <div role="alert">
//                   {error}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 className="submit-button"
//                 disabled={loading}
//               >
//                 {loading ? "Signing in..." : "Submit"}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


"use client";

import "../../CSS/signin.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import Header from "../../header/header";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type LoginUser = {
  userId: string;
  username: string;
  email: string;
};

type LoginResponse = {
  accessToken: string;
  user: LoginUser;
  message?: string;
  error?: string;
};

export default function Signin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Shared function for saving your application's login.
  function completeLogin(data: LoginResponse) {
    if (!data.accessToken || !data.user?.userId) {
      throw new Error(
        "Login response must contain accessToken and user.userId"
      );
    }

    sessionStorage.setItem(
      "accessToken",
      data.accessToken
    );

    sessionStorage.setItem(
      "user",
      JSON.stringify({
        userId: data.user.userId,
        username: data.user.username,
        email: data.user.email,
      })
    );

    router.push(
      `/dashboard?userId=${encodeURIComponent(
        data.user.userId
      )}`
    );
  }

  async function readResponse(response: Response) {
    const responseText = await response.text();

    let data: any = {};

    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Backend returned invalid JSON. HTTP status: ${response.status}`
        );
      }
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Login failed. HTTP status: ${response.status}`
      );
    }

    return data;
  }

  // Existing email/password login.
  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data: LoginResponse =
        await readResponse(response);

      completeLogin(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  // New Google login.
  async function handleGoogleLogin(
    googleIdToken: string
  ) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: googleIdToken,
          }),
        }
      );

      const data: LoginResponse =
        await readResponse(response);

      // Save the JWT generated by Spring Boot,
      // NOT the Google ID token.
      completeLogin(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <div className="full-page">
        <div className="sign-left-section">
          image
        </div>

        <div className="sign-right-section">
          <div className="form">
            <div className="title">Sign In</div>

            <form onSubmit={handleLogin}>
              <div className="text">
                Enter the Email
              </div>

              <input
                className="input"
                type="email"
                placeholder="Enter the email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                autoComplete="email"
              />

              <div className="text">
                Enter the password
              </div>

              <input
                className="input"
                type="password"
                placeholder="Enter the password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                autoComplete="current-password"
              />

              {error && (
                <div role="alert" className="login-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Submit"}
              </button>
            </form>

            <div className="google-divider">
              <span>OR</span>
            </div>

            <div className="google-login">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    void handleGoogleLogin(
                      credentialResponse.credential
                    );
                  } else {
                    setError(
                      "Google did not return an ID token."
                    );
                  }
                }}
                onError={() => {
                  setError(
                    "Google sign-in failed. Please try again."
                  );
                }}
                text="continue_with"
                shape="rectangular"
                width="300"
              />
            </div>

            {loading && (
              <p aria-live="polite">
                Authenticating...
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

