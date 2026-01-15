// import { useForm } from "@tanstack/react-form";
// import { useNavigate } from "@tanstack/react-router";
// import { toast } from "sonner";
// import z from "zod";

// import { authClient } from "@/lib/auth-client";

// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import GoogleSignIn from "./google-signin";

// export default function SignInForm({
// 	onSwitchToSignUp,
// }: {
// 	onSwitchToSignUp: () => void;
// }) {
// 	const navigate = useNavigate({
// 		from: "/",
// 	});

// 	const form = useForm({
// 		defaultValues: {
// 			email: "",
// 			password: "",
// 		},
// 		onSubmit: async ({ value }) => {
// 			await authClient.signIn.email(
// 				{
// 					email: value.email,
// 					password: value.password,
// 				},
// 				{
// 					onSuccess: () => {
// 						navigate({
// 							to: "/dashboard",
// 						});
// 						toast.success("Sign in successful");
// 					},
// 					onError: (error) => {
// 						toast.error(error.error.message || error.error.statusText);
// 					},
// 				},
// 			);
// 		},
// 		validators: {
// 			onSubmit: z.object({
// 				email: z.email("Invalid email address"),
// 				password: z.string().min(8, "Password must be at least 8 characters"),
// 			}),
// 		},
// 	});

// 	return (
// 		<div className="mx-auto mt-10 w-full max-w-md p-6">
// 			<h1 className="mb-6 text-center font-bold text-3xl">Welcome Back</h1>

// 			<form
// 				onSubmit={(e) => {
// 					e.preventDefault();
// 					e.stopPropagation();
// 					form.handleSubmit();
// 				}}
// 				className="space-y-4"
// 			>
// 				<div>
// 					<form.Field name="email">
// 						{(field) => (
// 							<div className="space-y-2">
// 								<Label htmlFor={field.name}>Email</Label>
// 								<Input
// 									id={field.name}
// 									name={field.name}
// 									type="email"
// 									value={field.state.value}
// 									onBlur={field.handleBlur}
// 									onChange={(e) => field.handleChange(e.target.value)}
// 								/>
// 								{field.state.meta.errors.map((error) => (
// 									<p key={error?.message} className="text-red-500">
// 										{error?.message}
// 									</p>
// 								))}
// 							</div>
// 						)}
// 					</form.Field>
// 				</div>

// 				<div>
// 					<form.Field name="password">
// 						{(field) => (
// 							<div className="space-y-2">
// 								<Label htmlFor={field.name}>Password</Label>
// 								<Input
// 									id={field.name}
// 									name={field.name}
// 									type="password"
// 									value={field.state.value}
// 									onBlur={field.handleBlur}
// 									onChange={(e) => field.handleChange(e.target.value)}
// 								/>
// 								{field.state.meta.errors.map((error) => (
// 									<p key={error?.message} className="text-red-500">
// 										{error?.message}
// 									</p>
// 								))}
// 							</div>
// 						)}
// 					</form.Field>
// 				</div>

// 				<form.Subscribe>
// 					{(state) => (
// 						<Button
// 							type="submit"
// 							className="w-full"
// 							disabled={!state.canSubmit || state.isSubmitting}
// 						>
// 							{state.isSubmitting ? "Submitting..." : "Sign In"}
// 						</Button>
// 					)}
// 				</form.Subscribe>
// 			</form>

// 			<div className="mt-4 text-center">
// 				<GoogleSignIn />
// 				<Button
// 					variant="link"
// 					onClick={onSwitchToSignUp}
// 					className="text-indigo-600 hover:text-indigo-800"
// 				>
// 					Need an account? Sign Up
// 				</Button>
// 			</div>
// 		</div>
// 	);
// }


import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import z from "zod"

import { authClient } from "@/lib/auth-client"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import GoogleSignIn from "./google-signin"

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void
}) {
  const navigate = useNavigate({
    from: "/",
  })

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            })
            toast.success("Sign in successful")
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText)
          },
        },
      )
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-secondary/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent/80">
            <span className="text-lg font-bold text-primary-foreground">👋</span>
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-md backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            <div>
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2.5">
                    <Label htmlFor={field.name} className="text-sm font-semibold text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="you@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-11 rounded-lg bg-secondary/50 transition-all focus:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                    {field.state.meta.errors.map((error) => (
                      <p
                        key={error?.message}
                        className="flex items-center gap-1.5 text-xs font-medium text-destructive"
                      >
                        <span>⚠</span>
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <div>
              <form.Field name="password">
                {(field) => (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.name} className="text-sm font-semibold text-foreground">
                        Password
                      </Label>
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:text-accent transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      placeholder="Enter your password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-11 rounded-lg bg-secondary/50 transition-all focus:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/50"
                    />
                    {field.state.meta.errors.map((error) => (
                      <p
                        key={error?.message}
                        className="flex items-center gap-1.5 text-xs font-medium text-destructive"
                      >
                        <span>⚠</span>
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>
            </div>

            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="h-11 w-full rounded-lg bg-linear-to-r from-primary to-accent font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <div className="relative mt-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="mt-7">
            <GoogleSignIn />
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignUp}
              className="font-semibold text-primary hover:text-accent transition-colors duration-200"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

