import { useId, type FC } from "react";
import type { ComponentPropsWithRef } from "react";
import cn from "@/utils/cn";
import FormField, { getDescribedBy } from "@/components/ui/FormField";
import { INPUT_BASE } from "@/components/ui/Input/constants";

type TextAreaProps = ComponentPropsWithRef<"textarea"> & {
  error?: string;
  helpText?: string;
  label?: string;
};

const TextArea: FC<TextAreaProps> = ({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  className,
  error,
  helpText,
  id: providedId,
  label,
  required,
  ...props
}) => {
  const generatedId = useId();
  const id = providedId ?? `textarea-${generatedId}`;
  const invalid =
    Boolean(error) || ariaInvalid === true || ariaInvalid === "true";

  return (
    <FormField
      error={error}
      helpText={helpText}
      id={id}
      label={label}
      required={required}
    >
      <textarea
        {...props}
        aria-describedby={getDescribedBy(ariaDescribedBy, error, helpText, id)}
        aria-invalid={invalid || undefined}
        className={cn(
          INPUT_BASE,
          "min-h-28 resize-y px-3 py-2 text-sm",
          invalid ? "border-danger" : "border-hairline",
          className,
        )}
        id={id}
        required={required}
      />
    </FormField>
  );
};

export default TextArea;
