"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsEmailLoading(true);

    const res = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      fetchOptions: {
        onSuccess: () => {
          toast.success("Login successful!");
          router.push("/profile");
        },
      },
    });

    console.log("res", res);
    if (res?.error) {
      const errorMessage = res.error.message ?? "An error occurred";
      toast.error(`Login failed: ${errorMessage}`, {
        description: "Please check your credentials and try again.",
      });
    }

    setIsEmailLoading(false);
  };

  const onGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    const res = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/profile",
      newUserCallbackURL: "/profile",
      requestSignUp: true,
    });

    if (res?.error) {
      const errorMessage = res.error.message ?? "An error occurred";
      toast.error(`Google sign in failed: ${errorMessage}`, {
        description: "Please try again.",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isEmailLoading || isGoogleLoading}
              onClick={onGoogleSignIn}
            >
              <GoogleIcon />
              {isGoogleLoading
                ? "Redirecting to Google..."
                : "Continue with Google"}
            </Button>
            <div className="relative text-center text-sm">
              <span className="bg-card text-muted-foreground relative z-10 px-2">
                Or
              </span>
              <div className="absolute inset-x-0 top-1/2 border-t" />
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isEmailLoading || isGoogleLoading}
                >
                  {isEmailLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        d="M21.805 10.023H12.24v3.955h5.49c-.237 1.272-.96 2.35-2.006 3.073v2.548h3.244c1.899-1.748 2.997-4.323 2.997-7.384 0-.72-.064-1.412-.16-2.192Z"
        fill="#4285F4"
      />
      <path
        d="M12.24 22c2.723 0 5.01-.9 6.681-2.43l-3.244-2.548c-.9.604-2.056.966-3.437.966-2.64 0-4.88-1.783-5.68-4.179H3.22v2.628A10.084 10.084 0 0 0 12.24 22Z"
        fill="#34A853"
      />
      <path
        d="M6.56 13.81a6.06 6.06 0 0 1 0-3.62V7.562H3.22a10.084 10.084 0 0 0 0 8.876l3.34-2.628Z"
        fill="#FBBC05"
      />
      <path
        d="M12.24 6.01c1.48 0 2.807.51 3.855 1.51l2.884-2.883C17.246 3.03 14.96 2 12.24 2a10.084 10.084 0 0 0-9.02 5.562l3.34 2.628c.798-2.397 3.038-4.18 5.68-4.18Z"
        fill="#EA4335"
      />
    </svg>
  );
}
