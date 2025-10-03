"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
};

export const signIn = async (email: string, password: string) => {
  await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
};

export const signUp = async (name: string, email: string, password: string) => {
  await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });
};
