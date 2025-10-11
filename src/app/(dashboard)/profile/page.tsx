"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/trpc/react";
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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const profileSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If user is trying to change password, validate all password fields
      if (data.newPassword || data.currentPassword || data.confirmPassword) {
        if (!data.currentPassword) {
          return false;
        }
        if (!data.newPassword) {
          return false;
        }
        if (data.newPassword.length < 8) {
          return false;
        }
        if (data.newPassword !== data.confirmPassword) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Please fill all password fields correctly",
      path: ["newPassword"],
    },
  );

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const { data: profile, isLoading, refetch } = api.profile.get.useQuery();

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: async ({ shouldRedirectToSignIn }) => {
      toast.success("Profile updated successfully!");

      if (shouldRedirectToSignIn) {
        router.push("/sign-in");
      }

      await refetch();
      setIsUpdating(false);
      // Reset password fields
      form.reset({
        name: profile?.name ?? "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update profile");
      setIsUpdating(false);
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form values when profile data loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);

    const updateData: {
      name: string;
      currentPassword?: string;
      newPassword?: string;
    } = {
      name: data.name,
    };

    // Only include password fields if user is actually changing password
    if (data.newPassword && data.newPassword.trim() !== "") {
      updateData.currentPassword = data.currentPassword;
      updateData.newPassword = data.newPassword;
    }

    updateProfile.mutate(updateData);
  };

  if (isLoading) {
    return <LoadingUi />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your account settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={profile?.image ?? ""}
                  alt={profile?.name ?? ""}
                />
                <AvatarFallback className="text-lg">
                  {profile?.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{profile?.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {profile?.email}
                </p>
              </div>
            </div>

            <Separator />

            {/* Profile Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Enter your display name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-muted-foreground text-xs">
                  Email address cannot be changed
                </p>
              </div>

              <Separator />

              {/* Password Change Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <PasswordInput
                    id="currentPassword"
                    {...form.register("currentPassword")}
                    placeholder="Enter current password"
                  />
                  {form.formState.errors.currentPassword && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <PasswordInput
                    id="newPassword"
                    {...form.register("newPassword")}
                    placeholder="Enter new password"
                  />
                  {form.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    {...form.register("confirmPassword")}
                    placeholder="Confirm new password"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </form>

            <ApiKeyField
              isLoading={isLoading}
              haveKey={!!profile?.hasApiKey}
              onApiKeySet={refetch}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const LoadingUi = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="bg-background">
          <CardHeader className="bg-background">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6 bg-background">
            {/* Profile Picture and Basic Info Skeleton */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <Separator />

            {/* Form Fields Skeleton */}
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-48" />
              </div>

              <Separator />

              {/* Password Change Section */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-64" />
                </div>

                {/* Password Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ApiKeyField = ({
  isLoading,
  haveKey,
  onApiKeySet,
}: {
  isLoading: boolean;
  haveKey: boolean;
  onApiKeySet?: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: currentApiKey, isLoading: isLoadingApiKey } =
    api.profile.getApiKey.useQuery(undefined, {
      enabled: isVisible,
    });

  const toggleVisibility = () => {
    if (!isVisible) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setApiKey("");
    }
  };

  // Update apiKey when data loads
  React.useEffect(() => {
    if (isVisible && currentApiKey?.api_key && !apiKey) {
      setApiKey(currentApiKey.api_key);
    }
  }, [isVisible, currentApiKey?.api_key, apiKey]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleUpdateApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    setIsUpdating(true);
    updateApiKey.mutate({ api_key: apiKey });
  };

  const updateApiKey = api.profile.updateApiKey.useMutation({
    onSuccess: async () => {
      toast.success("API key updated successfully!");
      setIsUpdating(false);
      setIsVisible(false);
      setApiKey("");
      // Trigger a refetch of the main profile to update haveKey state
      onApiKeySet?.();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update API key");
      setIsUpdating(false);
    },
  });

  const handleSetApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    setIsUpdating(true);
    setApiKeyMutation.mutate({ api_key: apiKey });
  };

  const setApiKeyMutation = api.profile.updateApiKey.useMutation({
    onSuccess: async () => {
      toast.success("API key set successfully!");
      setIsUpdating(false);
      setApiKey("");
      // Trigger a refetch of the main profile to update haveKey state
      onApiKeySet?.();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to set API key");
      setIsUpdating(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-3 w-64" />
      </div>
    );
  }

  if (haveKey) {
    const hasChanged = isVisible && apiKey !== (currentApiKey?.api_key ?? "");

    return (
      <div className="space-y-2">
        <Label htmlFor="apiKey">Current API Key</Label>
        <div className="flex space-x-2">
          <Input
            id="apiKey"
            type={isVisible ? "text" : "password"}
            value={
              isLoadingApiKey
                ? "Loading..."
                : isVisible
                  ? apiKey
                  : "••••••••••••••••••••••••••••••••"
            }
            onChange={handleApiKeyChange}
            disabled={!isVisible || isLoadingApiKey}
            className="bg-muted font-mono"
          />
          <Button
            type="button"
            variant="outline"
            onClick={toggleVisibility}
            disabled={isLoadingApiKey}
          >
            {isVisible ? "Hide" : "Show"} API Key
          </Button>
          {hasChanged && isVisible && (
            <Button
              type="button"
              onClick={handleUpdateApiKey}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Key"}
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          {isVisible
            ? "You can edit your API key above. Click 'Update Key' to save changes."
            : "Your API key is securely stored. Click 'Show' to reveal it."}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <Label htmlFor="newApiKey">Set API Key</Label>
      <div className="flex space-x-2">
        <Input
          id="newApiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="font-mono"
        />
        <Button
          type="button"
          onClick={handleSetApiKey}
          disabled={isUpdating || setApiKeyMutation.isPending}
        >
          {isUpdating || setApiKeyMutation.isPending
            ? "Setting..."
            : "Set API Key"}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        Enter your API key to enable access to the interview service.
      </p>
    </div>
  );
};
