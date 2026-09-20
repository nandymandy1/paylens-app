"use client";

import type { FC } from "react";
import Button from "@/components/ui/Button";
import { REVIEWER_DEMO } from "@/components/auth/constants";

type DemoAccountButtonProps = {
  onFill: (credentials: typeof REVIEWER_DEMO) => void;
};

const DemoAccountButton: FC<DemoAccountButtonProps> = ({ onFill }) => {
  return (
    <div className="mt-4">
      <div aria-hidden="true" className="flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="font-mono text-[10px] tracking-[0.12em] text-body uppercase">or</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>
      <div className="mt-4">
        <Button block onClick={() => onFill(REVIEWER_DEMO)} type="button" variant="outline">
          Use Demo Account
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-body">
        Populate the public reviewer demo credentials.
      </p>
    </div>
  );
};

export default DemoAccountButton;
