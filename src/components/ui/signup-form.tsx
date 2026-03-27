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
import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAvatarUrl } from "@/lib/avatar";

const signupSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsEmailLoading(true);

    const res = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      image: createAvatarUrl(values.name),
      fetchOptions: {
        onSuccess: () => {
          toast.success("Account created successfully!");
          router.push("/profile");
        },
      },
    });

    if (res?.error) {
      const errorMessage = res.error.message ?? "An error occurred";
      toast.error(`Sign up failed: ${errorMessage}`, {
        description: "Please check your information and try again.",
      });
    }

    setIsEmailLoading(false);
  };

  const onGoogleSignUp = async () => {
    setIsGoogleLoading(true);

    const res = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/profile",
      newUserCallbackURL: "/profile",
      requestSignUp: true,
    });

    if (res?.error) {
      const errorMessage = res.error.message ?? "An error occurred";
      toast.error(`Google sign up failed: ${errorMessage}`, {
        description: "Please try again.",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isEmailLoading || isGoogleLoading}
              onClick={onGoogleSignUp}
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
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
                  {isEmailLoading ? "Creating account..." : "Create account"}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-4"
                  >
                    Sign in
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
