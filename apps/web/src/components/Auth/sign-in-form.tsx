"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import GoogleSignIn from "./google-signin";

export default function SignInForm({
	onSwitchToSignUp,
}: {
	onSwitchToSignUp: () => void;
}) {
	const router = useRouter();

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
						router.push("/events");
						toast.success("Sign in successful");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-12 text-light-text-muted">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<h1 className="text-balance font-bold text-3xl text-foreground tracking-tight">
						Welcome back
					</h1>
					<p className="mt-2 text-muted-foreground text-sm">
						Sign in to your account to continue
					</p>
				</div>

				<div className="rounded-2xl border border-border/50 bg-bg-card p-8 shadow-md backdrop-blur-sm">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
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

						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="h-11 w-full rounded-lg bg-light-bg-card font-semibold text-primary shadow-md transition-all hover:shadow-lg disabled:opacity-50"
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
							<div className="w-full border-border/40 border-t" />
						</div>
						<div className="relative flex justify-center font-medium text-xs uppercase tracking-wide">
							<span className="bg-card px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>

					<div className="mt-7">
						<GoogleSignIn />
					</div>
				</div>

				<div className="mt-6 text-center">
					<p className="text-muted-foreground text-sm">
						Don't have an account?{" "}
						<button
							onClick={onSwitchToSignUp}
							className="font-semibold text-primary transition-colors duration-200 hover:text-accent"
						>
							Sign up
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}
