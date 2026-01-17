"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import GoogleSignIn from "./google-signin";

export default function SignUpForm({
	onSwitchToSignIn,
}: {
	onSwitchToSignIn: () => void;
}) {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						router.push("/events");
						toast.success("Sign up successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(2, "Name must be at least 2 characters"),
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-12 text-light-text-muted">
			<div className="flex w-full max-w-lg flex-col items-center justify-center rounded-2xl border border-border/50 bg-bg-card bg-card p-8 shadow-md backdrop-blur-sm">
				<div className="w-full max-w-md">
					<div className="mb-4 text-center">
						<h1 className="text-balance font-bold text-3xl tracking-tight">
							Create your account
						</h1>
						<p className="mt-2 text-sm">
							Join our community and start your journey today
						</p>
					</div>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
						<div>
							<form.Field name="name">
								{(field) => (
									<div className="space-y-2.5">
										<Label
											htmlFor={field.name}
											className="font-semibold text-sm"
										>
											Full Name
										</Label>
										<Input
											id={field.name}
											name={field.name}
											placeholder="Enter your full name"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-11 rounded-lg bg-secondary/50 transition-all focus:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/50"
										/>
										{field.state.meta.errors.map((error) => (
											<p
												key={error?.message}
												className="flex items-center gap-1.5 font-medium text-destructive text-xs"
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
							<form.Field name="email">
								{(field) => (
									<div className="space-y-2.5">
										<Label
											htmlFor={field.name}
											className="font-semibold text-foreground text-sm"
										>
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
												className="flex items-center gap-1.5 font-medium text-destructive text-xs"
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
											<Label
												htmlFor={field.name}
												className="font-semibold text-foreground text-sm"
											>
												Password
											</Label>
											<span className="font-medium text-muted-foreground text-xs">
												Min. 8 characters
											</span>
										</div>
										<Input
											id={field.name}
											name={field.name}
											type="password"
											placeholder="Create a strong password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="h-11 rounded-lg bg-secondary/50 transition-all focus:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/50"
										/>
										{field.state.meta.errors.map((error) => (
											<p
												key={error?.message}
												className="flex items-center gap-1.5 font-medium text-destructive text-xs"
											>
												<span>⚠</span>
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						{/* <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="h-11 w-full rounded-lg bg-light-bg-card font-semibold text-primary shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              )}
            </form.Subscribe> */}

						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									disabled={!state.canSubmit || state.isSubmitting}
									className={
										"h-11 w-full rounded-lg bg-light-bg-card font-semibold text-primary shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
									}
								>
									{state.isSubmitting ? (
										<div className="flex items-center justify-center gap-2">
											<span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
											<span>Creating account...</span>
										</div>
									) : (
										"Create Account"
									)}
								</Button>
							)}
						</form.Subscribe>
					</form>

					<div className="relative mt-7">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-border/40 border-t" />
						</div>
						<div className="relative flex justify-center font-medium text-xs uppercase tracking-wide">
							<span className="bg-card px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>

					<div className="mt-7">
						<GoogleSignIn label={"Signup with Google"} />
					</div>
					<div className="mt-6 text-center">
						<p className="text-muted-foreground text-sm">
							Already have an account?{" "}
							<button
								onClick={onSwitchToSignIn}
								className="font-semibold text-primary transition-colors duration-200 hover:text-accent"
							>
								Sign in
							</button>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
