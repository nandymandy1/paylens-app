"use client";

import { useState, type FC } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import InputEmail from "@/components/ui/InputEmail";
import TextArea from "@/components/ui/TextArea";
import PublicLayout from "@/components/layout/PublicLayout";

const ContactPage: FC = () => {
  const [sent, setSent] = useState(false);

  return (
    <PublicLayout>
      <main className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-8">
        <p className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
          Contact
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-medium tracking-tight">Talk to us</h1>
        <p className="mt-5 max-w-2xl text-lg leading-7 text-body">
          Questions about PayLens, onboarding, or the demo? Send a message.
        </p>
        {sent ? (
          <div className="mt-8 max-w-xl">
            <Alert title="Received" variant="success">
              Thanks — your message is on its way. We reply within two business days.
            </Alert>
          </div>
        ) : (
          <form
            className="mt-8 max-w-xl space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <FormField id="name" label="Name" required>
              <Input autoComplete="name" id="name" required />
            </FormField>
            <FormField id="email" label="Email" required>
              <InputEmail autoComplete="email" id="email" required />
            </FormField>
            <FormField id="message" label="Message" required>
              <TextArea id="message" required rows={5} />
            </FormField>
            <Button type="submit">Send message</Button>
          </form>
        )}
      </main>
    </PublicLayout>
  );
};

export default ContactPage;
