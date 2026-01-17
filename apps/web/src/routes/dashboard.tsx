import { api } from "@event-schedulr/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useConvexAuth,
  useQuery,
} from "convex/react";
import { useEffect, useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import UserMenu from "@/components/user-menu";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);
  const privateData = useQuery(api.privateData.get);
  //   const { isAuthenticated } = useConvexAuth();
  const [session, setSession] = useState<null | unknown>(null);

  useEffect(() => {
    const fetchUserStatus = async () => {
      const data = await authClient.getSession();
      console.log(data);
      setSession(data);
    };

    fetchUserStatus();
  }, []);
  //   const auth = authClient.getSession();

  //   console.log(isAuthenticated);

  return (
    <>
      <Authenticated>
        <div>
          <h1>Dashboard</h1>
          <p>privateData: {privateData?.message}</p>
          <UserMenu />
        </div>
      </Authenticated>
      <Unauthenticated>
        {showSignIn ? (
          <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
        )}
      </Unauthenticated>
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading>
    </>
  );
}
