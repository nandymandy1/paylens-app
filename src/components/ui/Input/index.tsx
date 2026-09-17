import { useId, type FC } from "react";
import cn from "@/utils/cn";
import FormField, { getDescribedBy } from "@/components/ui/FormField";
import {
  INPUT_BASE,
  INPUT_ICON_INSET_CLASSES,
  INPUT_ICON_PADDING_CLASSES,
  INPUT_SIZE_CLASSES,
  INPUT_SUFFIX_INSET_CLASSES,
  INPUT_SUFFIX_ACTION_PADDING_CLASSES,
  INPUT_SUFFIX_PADDING_CLASSES,
} from "./constants";
import type { InputProps } from "./types";

const Input: FC<InputProps> = ({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  className,
  error,
  helpText,
  id: providedId,
  inputSize = "md",
  label,
  prefixIcon,
  required,
  suffixAction,
  suffixIcon,
  ...props
}) => {
  const generatedId = useId();
  const id = providedId ?? `input-${generatedId}`;
  const invalid = Boolean(error) || ariaInvalid === true || ariaInvalid === "true";

  return (
    <FormField error={error} helpText={helpText} id={id} label={label} required={required}>
      <div className="relative">
        {prefixIcon && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute flex items-center text-body",
              INPUT_ICON_INSET_CLASSES[inputSize],
            )}
          >
            {prefixIcon}
          </span>
        )}
        <input
          {...props}
          aria-describedby={getDescribedBy(ariaDescribedBy, error, helpText, id)}
          aria-invalid={invalid || undefined}
          className={cn(
            INPUT_BASE,
            INPUT_SIZE_CLASSES[inputSize],
            invalid ? "border-danger" : "border-hairline",
            prefixIcon && INPUT_ICON_PADDING_CLASSES[inputSize],
            suffixIcon && INPUT_SUFFIX_PADDING_CLASSES[inputSize],
            suffixAction && INPUT_SUFFIX_ACTION_PADDING_CLASSES[inputSize],
            className,
          )}
          id={id}
          required={required}
        />
        {suffixIcon && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute flex items-center text-body",
              INPUT_SUFFIX_INSET_CLASSES[inputSize],
            )}
          >
            {suffixIcon}
          </span>
        )}
        {suffixAction && (
          <span className={cn("absolute flex items-center", INPUT_SUFFIX_INSET_CLASSES[inputSize])}>
            {suffixAction}
          </span>
        )}
      </div>
    </FormField>
  );
};

export default Input;
