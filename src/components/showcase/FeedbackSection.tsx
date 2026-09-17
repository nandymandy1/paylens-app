"use client";

import type { FC } from "react";
import { AlertCircle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { showToast, type ToastTone } from "@/events/toast";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import ShowcaseSection from "./ShowcaseSection";

const toastTones: ToastTone[] = ["success", "error", "warning", "info"];

const FeedbackSection: FC = () => {
  return (
    <ShowcaseSection
      description="Alerts state their meaning in words, while the global event bridge gives every feature one consistent toast path."
      eyebrow="04 / Feedback"
      id="feedback"
      title="Feedback that explains itself"
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Alert
            icon={<Info className="size-4" />}
            title="Information"
            variant="info"
          >
            Salary history is shown in effective-date order.
          </Alert>
          <Alert
            icon={<CheckCircle2 className="size-4" />}
            title="Success"
            variant="success"
          >
            Compensation changes were saved and audited.
          </Alert>
          <Alert
            icon={<AlertCircle className="size-4" />}
            title="Action required"
            variant="danger"
          >
            Resolve the version conflict before saving again.
          </Alert>
          <Alert title="Neutral" variant="neutral">
            No compensation changes are pending.
          </Alert>
          <Alert icon={<ShieldAlert className="size-4" />} variant="dark">
            Sensitive fields remain hidden without permission.
          </Alert>
          <Alert title="Primary" variant="primary">
            The next review cycle opens on October 1.
          </Alert>
        </div>
        <div>
          <h3 className="font-mono text-[11px] font-medium tracking-[0.05em] text-body uppercase">
            Global toasts
          </h3>
          <div className="mt-3 flex flex-wrap gap-3">
            {toastTones.map((tone) => (
              <Button
                key={tone}
                onClick={() =>
                  showToast({
                    tone,
                    title: `${tone[0].toUpperCase()}${tone.slice(1)} feedback`,
                    description:
                      "Dispatched through Mitt and rendered by Sonner.",
                  })
                }
                size="sm"
                variant="outline"
              >
                {tone}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
};

export default FeedbackSection;
