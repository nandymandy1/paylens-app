"use client";

import { useState, type FC } from "react";
import { CalendarDays, ListFilter, TableProperties } from "lucide-react";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import Modal from "@/components/ui/Modal";
import Paginator from "@/components/ui/Paginator";
import Segment from "@/components/ui/Segment";
import Tabs from "@/components/ui/Tabs";
import ShowcaseSection from "./ShowcaseSection";

const accordionItems = [
  {
    content:
      "Use concise, durable labels so people can scan review decisions without opening every detail.",
    title: "Clear disclosure labels",
    value: "labels",
  },
  {
    content:
      "This item demonstrates the shared disabled treatment without changing surrounding layout.",
    disabled: true,
    title: "Locked by policy",
    value: "locked",
  },
  {
    content:
      "Longer information remains contained within the disclosure panel and wraps naturally on small screens.",
    title: "Long content handling",
    value: "content",
  },
];
const InteractionSection: FC = () => {
  const [page, setPage] = useState(50);
  const [segment, setSegment] = useState("table");

  return (
    <>
      <ShowcaseSection
        description="Disclosures use Radix keyboard semantics and a restrained chevron treatment for dense HR guidance."
        eyebrow="07 / Disclosure"
        id="disclosure"
        title="Details when they matter"
      >
        <div className="grid gap-6">
          <Accordion defaultValue="labels" items={accordionItems} />
          <Accordion
            defaultValue={["labels", "content"]}
            items={accordionItems.filter((item) => !item.disabled)}
            type="multiple"
          />
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        description="Tabs switch related panels, segments select a compact mode, and pagination remains entirely API- and URL-agnostic."
        eyebrow="08 / Navigation"
        id="navigation"
        title="Navigate without losing context"
      >
        <div className="grid gap-8">
          <Tabs
            defaultValue="summary"
            items={[
              {
                content:
                  "Review the information that needs an HR decision before expanding into supporting records.",
                label: "Summary",
                value: "summary",
              },
              {
                content:
                  "Supporting changes remain grouped in a dedicated panel with familiar tab semantics.",
                label: "Changes",
                prefixIcon: <CalendarDays aria-hidden="true" className="size-4" />,
                value: "changes",
              },
              {
                content: "",
                disabled: true,
                label: "Archive",
                value: "archive",
              },
            ]}
          />
          <div className="grid gap-3">
            <Segment
              aria-label="Record view"
              onValueChange={setSegment}
              options={[
                {
                  label: "Table",
                  prefixIcon: <TableProperties aria-hidden="true" className="size-3.5" />,
                  value: "table",
                },
                {
                  label: "Review",
                  prefixIcon: <ListFilter aria-hidden="true" className="size-3.5" />,
                  value: "review",
                },
                { disabled: true, label: "Timeline", value: "timeline" },
              ]}
              value={segment}
            />
            <p className="text-sm text-body">Selected view: {segment}</p>
          </div>
          <div className="grid gap-3">
            <Paginator onPageChange={setPage} page={page} totalPages={100} />
            <p className="text-sm text-body">Page {page} of 100</p>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        description="Modal and drawer surfaces share a coherent layer scale while preserving their distinct decision and contextual-workflow roles."
        eyebrow="09 / Overlays"
        id="overlays"
        title="Keep tasks focused"
      >
        <div className="flex flex-wrap gap-3">
          <Modal
            description="Confirm a neutral demonstration action without leaving the current screen."
            footer={
              <>
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
              </>
            }
            size="md"
            title="Review changes"
            trigger={<Button>Open modal</Button>}
          >
            This dialog contains a header, a safe content region, and actions. Escape and the close
            control return focus to its trigger.
          </Modal>
          <Modal
            size="lg"
            title="Longer review notes"
            trigger={<Button variant="outline">Open large modal</Button>}
          >
            <div className="grid gap-4">
              {Array.from({ length: 4 }, (_, index) => (
                <p key={index}>
                  A larger surface accommodates detailed review guidance while keeping the current
                  workflow visually present behind the overlay.
                </p>
              ))}
            </div>
          </Modal>
          <Drawer
            description="Contextual details stay adjacent to the current screen."
            footer={<Button>Save review</Button>}
            title="Review details"
            trigger={<Button variant="outline">Open drawer</Button>}
          >
            <p>
              Drawers preserve the page context for workflows that need supporting details rather
              than a fully focused decision.
            </p>
          </Drawer>
        </div>
      </ShowcaseSection>
    </>
  );
};

export default InteractionSection;
