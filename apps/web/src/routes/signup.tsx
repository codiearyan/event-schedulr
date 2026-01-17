import { api } from "@event-schedulr/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
// import { useState } from "react";
// import SignInForm from "@/components/Auth/sign-in-form";
// import SignUpForm from "@/components/Auth/sign-up-form";
// import UserMenu from "@/components/user-menu";
import AuthPage from "@/components/Auth/page";

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
//   const [showSignIn, setShowSignIn] = useState(false);
  const privateData = useQuery(api.privateData.get);

  return (
    <>
      <Authenticated>
        <div>
          <h1>Dashboard</h1>
          <p>privateData: {privateData?.message}</p>
        </div>
      </Authenticated>
      <Unauthenticated>
        {/* {showSignIn ? (
					<SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
				) : (
					<SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
				)} */}

        <AuthPage />
      </Unauthenticated>
      <AuthLoading>
        <div>Loading...</div>
      </AuthLoading>
    </>
  );
}


