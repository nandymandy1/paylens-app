"use client";

import { useState, type FC } from "react";
import { BriefcaseBusiness, ChevronUp, Mail, Search, ShieldCheck, Users } from "lucide-react";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";
import InputEmail from "@/components/ui/InputEmail";
import InputOTP from "@/components/ui/InputOTP";
import InputPassword from "@/components/ui/InputPassword";
import Select from "@/components/ui/Select";
import { Radio, RadioGroup } from "@/components/ui/Radio";
import Switch from "@/components/ui/Switch";
import TextArea from "@/components/ui/TextArea";
import ShowcaseSection from "./ShowcaseSection";

const FormControlsSection: FC = () => {
  const [otp, setOtp] = useState("24");
  const [plan, setPlan] = useState("manager");
  const [enabled, setEnabled] = useState(false);
  const [selectedRole, setSelectedRole] = useState("manager");
  const roleOptions = [
    { value: "manager", title: "HR Manager" },
    { value: "employee", title: "Employee" },
  ] as const;

  return (
    <ShowcaseSection
      description="Shared form controls use consistent labels, validation, focus treatment, sizing, and light/dark surfaces while remaining easy to compose with application form state."
      eyebrow="06 / Form controls"
      id="form-controls"
      title="Forms that stay out of your way"
    >
      <div className="grid gap-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input inputSize="sm" label="Small input" placeholder="Small" />
          <Input label="Default input" placeholder="Medium" />
          <Input inputSize="lg" label="Large input" placeholder="Large" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            helpText="Searches are scoped by the feature that uses this control."
            label="With icons"
            placeholder="Find an employee"
            prefixIcon={<Search className="size-4" />}
            suffixIcon={<Mail aria-hidden="true" className="size-4" />}
          />
          <Input disabled label="Disabled" placeholder="Unavailable" />
          <Input error="Use a unique field name." label="Invalid" placeholder="Field name" />
          <InputEmail
            error="Enter a valid email address."
            label="Work email"
            placeholder="name@company.com"
          />
          <InputPassword
            helpText="Use your account password."
            label="Password"
            placeholder="Enter password"
          />
          <InputPassword
            disabled
            error="Password resets are unavailable."
            label="Disabled password"
            value="hidden"
            readOnly
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select aria-label="Basic role" options={roleOptions} placeholder="Select role" />
          <Select
            aria-label="Controlled role"
            onChange={(value) => setSelectedRole(value)}
            options={roleOptions}
            prefixIcon={<Users className="size-4" />}
            suffixIcon={<ChevronUp className="size-4" />}
            value={selectedRole}
          />
          <Select aria-label="Small select" options={roleOptions} size="sm" value="manager" />
          <Select aria-label="Medium select" options={roleOptions} size="md" value="manager" />
          <Select aria-label="Large select" options={roleOptions} size="lg" value="manager" />
          <Select
            aria-label="Invalid select"
            invalid
            options={roleOptions}
            placeholder="Select a role"
          />
          <Select aria-label="Disabled select" disabled options={roleOptions} value="manager" />
          <Select
            aria-label="Role permissions"
            options={[
              {
                value: "admin",
                title: "HR Administrator",
                subtitle: "Manage members and organization settings",
                icon: <ShieldCheck className="size-4" />,
              },
              {
                value: "manager",
                title: "HR Manager",
                subtitle: "Manage employees and compensation",
                icon: <BriefcaseBusiness className="size-4" />,
              },
            ]}
            placeholder="Select permission"
          />
          <Select
            aria-label="Member assignment"
            options={[
              {
                value: "jane",
                title: "Jane Cooper",
                subtitle: "jane@paylens.example",
                avatar: { alt: "Jane Cooper", fallback: "JC" },
              },
              {
                value: "devon",
                title: "Devon Lane",
                subtitle: "devon@paylens.example",
                avatar: { alt: "Devon Lane", fallback: "DL" },
              },
            ]}
            placeholder="Assign member"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputOTP label="Verification code" onChange={setOtp} value={otp} />
          <InputOTP disabled error="The code expired." label="Disabled code" value="8124" />
          <TextArea
            helpText="This preserves native textarea resize behavior."
            label="Notes"
            placeholder="Add a concise note"
          />
          <TextArea
            disabled
            error="Notes are locked."
            label="Locked notes"
            value="Archived note"
            readOnly
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-3">
            <Checkbox label="Receive review reminders" />
            <Checkbox defaultChecked label="Include completed reviews" />
            <Checkbox disabled label="Archived setting" />
            <Checkbox indeterminate label="Select all visible records" />
          </div>
          <RadioGroup label="Default access" name="access" onValueChange={setPlan} value={plan}>
            <Radio label="Manager" value="manager" />
            <Radio label="Viewer" value="viewer" />
            <Radio disabled label="System administrator" value="admin" />
          </RadioGroup>
        </div>
        <div className="grid gap-3">
          <Switch
            checked={enabled}
            label="Enable review notifications"
            onChange={(event) => setEnabled(event.target.checked)}
          />
          <Switch defaultChecked label="Show compensation history" size="sm" />
          <Switch disabled label="Locked organization setting" />
        </div>
      </div>
    </ShowcaseSection>
  );
};

export default FormControlsSection;
