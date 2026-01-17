import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleSignIn from "./google-signin";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const navigate = useNavigate({
    from: "/",
  });

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
            navigate({
              to: "/events",
            });
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
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
    <div className="flex min-h-screen items-center justify-center text-light-text-muted px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm">
            Join our community and start your journey today
          </p>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border/50 bg-card p-8 shadow-md backdrop-blur-sm">
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
                      className="text-sm font-semibold"
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
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2.5">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-foreground"
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
                      <Label
                        htmlFor={field.name}
                        className="text-sm font-semibold text-foreground"
                      >
                        Password
                      </Label>
                      <span className="text-xs font-medium text-muted-foreground">
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
                  className={`
        h-11 w-full rounded-lg font-semibold
        bg-light-bg-card text-primary
        shadow-md transition-all duration-200
        hover:shadow-lg
        disabled:opacity-60
        disabled:cursor-not-allowed
        active:scale-[0.98]
      `}
                >
                  {state.isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2
            border-primary border-t-transparent"
                      />
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
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
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
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={onSwitchToSignIn}
              className="font-semibold text-primary hover:text-accent transition-colors duration-200"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
