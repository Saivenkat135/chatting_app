"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function GoogleSignIn() {
  const router = useRouter();

  async function handleGoogleLogin(credential: string) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: credential,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google login failed");
      }

      // This is YOUR application's JWT, not Google's token.
      sessionStorage.setItem("accessToken", data.token);
      sessionStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      router.push("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
    }
  }

  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse.credential) {
          void handleGoogleLogin(credentialResponse.credential);
        }
      }}
      onError={() => {
        console.error("Google sign-in failed");
      }}
    />
  );
}