"use client";

import { useState, type FC } from "react";
import { Eye, EyeOff } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import type { InputProps } from "@/components/ui/Input/types";

type InputPasswordProps = Omit<
  InputProps,
  "suffixAction" | "suffixIcon" | "type"
>;

const InputPassword: FC<InputPasswordProps> = ({
  disabled,
  inputSize = "md",
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      disabled={disabled}
      inputSize={inputSize}
      suffixAction={
        <IconButton
          aria-label={visible ? "Hide password" : "Show password"}
          className="border-0 bg-transparent p-0 text-body hover:bg-surface-subtle"
          disabled={disabled}
          icon={
            visible ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )
          }
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setVisible((current) => !current)}
          size={inputSize === "sm" ? "sm" : inputSize === "lg" ? "lg" : "md"}
          variant="outline"
        />
      }
      type={visible ? "text" : "password"}
    />
  );
};

export default InputPassword;
