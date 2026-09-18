"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import AuthCard from "@/components/auth/AuthCard";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import { authKeys } from "@/services/auth.service";
import { createOrganization } from "@/services/organization.service";
import { createOrganizationSchema, type CreateOrganizationInput } from "@/types/organization.type";

const OnboardingOrganizationPage: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });
      router.push("/dashboard");
    },
  });
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CreateOrganizationInput>({ resolver: zodResolver(createOrganizationSchema) });

  return (
    <AuthCard
      description="Your account has no organization yet. Create one to open your dashboard."
      eyebrow="Onboarding"
      title="Create your organization"
    >
      <form
        className="mt-6 space-y-4"
        noValidate
        onSubmit={handleSubmit((values) =>
          create.mutate(values, {
            onError: () => setError("root", { message: "Could not create the organization." }),
          }),
        )}
      >
        <FormField error={errors.name?.message} id="name" label="Organization name" required>
          <Input
            id="name"
            autoComplete="organization"
            placeholder="Acme Industries"
            {...register("name")}
          />
        </FormField>
        {errors.root?.message && (
          <Alert icon={<AlertCircle className="size-4" />} title="Failed" variant="danger">
            {errors.root.message}
          </Alert>
        )}
        <Button block loading={create.isPending} type="submit">
          Create and continue
        </Button>
      </form>
    </AuthCard>
  );
};

export default OnboardingOrganizationPage;
