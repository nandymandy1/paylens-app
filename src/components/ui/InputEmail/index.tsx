import type { FC } from "react";
import Input from "@/components/ui/Input";
import type { InputProps } from "@/components/ui/Input/types";

type InputEmailProps = Omit<InputProps, "type">;

const InputEmail: FC<InputEmailProps> = (props) => <Input {...props} type="email" />;

export default InputEmail;
