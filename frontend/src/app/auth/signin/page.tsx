
"use client";

import "../../CSS/signin.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../header/header";

export default function Signin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/user/login`,
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

// Read the response as text first.
const responseText = await response.text();

let data: any = {};

if (responseText.trim() !== "") {
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Backend returned invalid JSON. HTTP status: ${response.status}. Response: ${responseText}`
    );
  }
}

// Handle unsuccessful responses.
if (!response.ok) {
  throw new Error(
    data.message ||
    data.error ||
    `Login failed. HTTP status: ${response.status}`
  );
}

// Validate successful login response.
if (!data.accessToken || !data.user?.userId) {
  throw new Error(
    "Login response must contain accessToken and user.userId"
  );
}

// Save JWT.
sessionStorage.setItem("accessToken", data.accessToken);

// Save user details.
sessionStorage.setItem(
  "user",
  JSON.stringify({
    userId: data.user.userId,
    username: data.user.username,
    email: data.user.email,
  })
);

// Navigate to dashboard.
router.push(
  `/dashboard?userId=${encodeURIComponent(data.user.userId)}`
);

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
                <div role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
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
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/user/login`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             email,
//             password,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Login failed"
//         );
//       }

//       if (!data.accessToken || !data.user?.userId) {
//         throw new Error(
//           "Login response must contain accessToken and user.userId"
//         );
//       }

//       // Save the JWT separately.
//       sessionStorage.setItem(
//         "accessToken",
//         data.accessToken
//       );

//       // Save only safe user details, never the password hash.
//       sessionStorage.setItem(
//         "user",
//         JSON.stringify({
//           userId: data.user.userId,
//           username: data.user.username,
//           email: data.user.email,
//         })
//       );

//       router.push(`/dashboard?userId=${data.user.userId}`);
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
//     <main
//       style={{
//         maxWidth: 400,
//         margin: "80px auto",
//         padding: 24,
//         fontFamily: "Arial, sans-serif",
//       }}
//     >
//       <h1>Chat Application Login</h1>

//       <form
//         onSubmit={handleLogin}
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           gap: 14,
//         }}
//       >
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           style={{ padding: 12 }}
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           style={{ padding: 12 }}
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           style={{ padding: 12, cursor: "pointer" }}
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>

//         {error && (
//           <p style={{ color: "red" }}>{error}</p>
//         )}
//       </form>
//     </main>
//   );
// }
