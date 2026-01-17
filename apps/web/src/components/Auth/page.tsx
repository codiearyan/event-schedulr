"use client";
import { useState } from "react";

import { motion } from "framer-motion";
import SignInForm from "@/components/Auth/sign-in-form";
import SignUpForm from "@/components/Auth/sign-up-form";
import WelcomeMessage from "@/components/Auth/welcome-message";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* FORM PANEL */}
      <motion.div
        className="absolute inset-y-0 w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-bg-section z-10"
        animate={{
          x: isSignUp ? "0%" : "100%",
        }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <div className="w-full max-w-md">
          {isSignUp ? (
            <SignUpForm onSwitchToSignIn={() => setIsSignUp(false)} />
          ) : (
            <SignInForm onSwitchToSignUp={() => setIsSignUp(true)} />
          )}
        </div>
      </motion.div>

      {/* WELCOME PANEL */}
      <motion.div
        className="absolute inset-y-0 w-full lg:w-1/2 flex items-center justify-center p-12 bg-bg-main"
        animate={{
          x: isSignUp ? "100%" : "0%",
        }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <WelcomeMessage mode={isSignUp ? "signup" : "signin"} />
      </motion.div>
    </div>
  );
}
