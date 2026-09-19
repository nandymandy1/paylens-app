"use client";

import BigNumber from "bignumber.js";
import { ChevronDown } from "lucide-react";
import { useState, type FC } from "react";
import Button from "@/components/ui/Button";
import type { CompensationHistoryItem } from "@/types/compensation.type";
import { formatDate } from "@/utils/date";
import { formatMoneyString } from "@/utils/number";
import { formatEnumLabel } from "@/utils/string";

type CompensationTimelineProps = {
  items: CompensationHistoryItem[];
};

const actorLabel = (item: CompensationHistoryItem) =>
  item.changedBy ? `${item.changedBy.firstName} ${item.changedBy.lastName}` : "Unavailable";

const changeSummary = (item: CompensationHistoryItem) => {
  if (!item.previousAnnualBaseSalary) return null;
  if (item.previousCurrency !== item.newCurrency) return "Currency changed";

  const previous = new BigNumber(item.previousAnnualBaseSalary);
  const delta = new BigNumber(item.newAnnualBaseSalary).minus(previous);
  const absolute = formatMoneyString(delta.abs().toFixed(2), item.newCurrency);
  const sign = delta.isNegative() ? "−" : "+";
  const percentage = previous.isZero() ? null : delta.dividedBy(previous).times(100).toFixed(2);

  return `${sign}${absolute}${percentage ? ` (${sign}${percentage}%)` : ""}`;
};

const CompensationTimeline: FC<CompensationTimelineProps> = ({ items }) => {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(items[0] ? [items[0].id] : []),
  );

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  if (!items.length) return <p className="text-sm text-body">No compensation history yet.</p>;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-body">
          {items.length === 20
            ? "Showing latest 20 compensation changes"
            : `Showing ${items.length} compensation changes`}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExpanded(new Set(items.map(({ id }) => id)))}
          >
            Expand all
          </Button>
          <Button size="sm" variant="outline" onClick={() => setExpanded(new Set())}>
            Collapse all
          </Button>
        </div>
      </div>
      <ol className="relative space-y-4 before:absolute before:top-3 before:bottom-3 before:left-[4px] before:w-[2px] before:rounded-full before:timeline-gradient-line before:opacity-40">
        {items.map((item, index) => {
          const isInitial = !item.previousAnnualBaseSalary;
          const isExpanded = expanded.has(item.id);
          const isLatest = index === 0;
          const summary = changeSummary(item);
          const previousCurrency = item.previousCurrency ?? item.newCurrency;
          const deltaInfo =
            !isInitial && item.previousAnnualBaseSalary
              ? (() => {
                  const prev = new BigNumber(item.previousAnnualBaseSalary);
                  const delta = new BigNumber(item.newAnnualBaseSalary).minus(prev);

                  return {
                    isPositive: delta.isPositive(),
                    isNegative: delta.isNegative(),
                    text: summary,
                  };
                })()
              : null;

          return (
            <li key={item.id} className="relative pl-8">
              <span
                className={`absolute top-1.5 left-0 size-[10px] rounded-full border-2 border-surface transition-colors duration-150 ${
                  isLatest ? "timeline-dot-latest" : "bg-body/40"
                }`}
              />
              <div
                className={`rounded-md border p-4 transition-[border-color,box-shadow] duration-150 ${
                  isLatest
                    ? "border-hairline-strong bg-surface shadow-soft"
                    : "border-hairline bg-surface hover:border-hairline-strong"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[10px] font-medium tracking-[0.06em] text-body/60 uppercase">
                        {formatDate(item.effectiveFrom)}
                      </p>
                      <span className="badge-subtle">
                        {isInitial ? "Initial" : formatEnumLabel(item.reason)}
                      </span>
                      {isLatest && (
                        <span
                          className="badge-subtle"
                          style={{
                            background: "rgb(239 44 193 / 10%)",
                            color: "var(--brand-magenta)",
                            borderColor: "rgb(239 44 193 / 20%)",
                          }}
                        >
                          Latest
                        </span>
                      )}
                    </div>
                    {isInitial ? (
                      <p className="mt-2.5 comp-amount text-lg font-semibold tracking-tight text-ink">
                        {formatMoneyString(item.newAnnualBaseSalary, item.newCurrency)} / year
                      </p>
                    ) : (
                      <>
                        <p className="mt-2 comp-amount text-base font-medium text-ink">
                          {formatMoneyString(item.previousAnnualBaseSalary!, previousCurrency)} →{" "}
                          {formatMoneyString(item.newAnnualBaseSalary, item.newCurrency)}
                        </p>
                        {deltaInfo && (
                          <p
                            className={`mt-1 text-sm font-medium ${
                              deltaInfo.isPositive
                                ? "text-success"
                                : deltaInfo.isNegative
                                  ? "text-danger"
                                  : "text-body"
                            }`}
                          >
                            {deltaInfo.text}
                          </p>
                        )}
                      </>
                    )}
                    <p className="mt-2 text-xs text-body">Changed by {actorLabel(item)}</p>
                  </div>
                  <Button
                    aria-expanded={isExpanded}
                    aria-controls={`compensation-history-${item.id}`}
                    size="sm"
                    suffixIcon={
                      <ChevronDown
                        aria-hidden="true"
                        className={`size-4 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    }
                    variant="outline"
                    onClick={() => toggle(item.id)}
                  >
                    {isExpanded ? "Hide" : "Details"}
                  </Button>
                </div>
                {isExpanded && (
                  <dl
                    id={`compensation-history-${item.id}`}
                    className="mt-4 grid gap-x-6 gap-y-3 border-t border-hairline pt-4 text-sm sm:grid-cols-2"
                  >
                    <div>
                      <dt className="text-body">Effective date</dt>
                      <dd>{formatDate(item.effectiveFrom)}</dd>
                    </div>
                    <div>
                      <dt className="text-body">Recorded</dt>
                      <dd>{formatDate(item.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-body">Previous salary</dt>
                      <dd>
                        {item.previousAnnualBaseSalary
                          ? formatMoneyString(item.previousAnnualBaseSalary, previousCurrency)
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-body">New salary</dt>
                      <dd>{formatMoneyString(item.newAnnualBaseSalary, item.newCurrency)}</dd>
                    </div>
                    <div>
                      <dt className="text-body">Reason</dt>
                      <dd>{formatEnumLabel(item.reason)}</dd>
                    </div>
                    <div>
                      <dt className="text-body">Version</dt>
                      <dd>{item.version}</dd>
                    </div>
                    <div>
                      <dt className="text-body">Changed by</dt>
                      <dd>{actorLabel(item)}</dd>
                    </div>
                    {item.note && (
                      <div className="sm:col-span-2">
                        <dt className="text-body">Note</dt>
                        <dd>{item.note}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default CompensationTimeline;
