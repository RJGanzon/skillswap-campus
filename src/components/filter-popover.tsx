"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

const TYPE_OPTIONS = [
  { value: ALL, label: "All types" },
  { value: "OFFER", label: "Offers" },
  { value: "REQUEST", label: "Requests" },
];

const CATEGORY_OPTIONS = [
  { value: ALL, label: "All categories" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "TECH", label: "Tech" },
  { value: "CREATIVE", label: "Creative" },
  { value: "SPORTS", label: "Sports" },
  { value: "LANGUAGE", label: "Language" },
  { value: "OTHER", label: "Other" },
];

export function FilterPopover({
  formId,
  activeCount,
  defaultType,
  defaultCategory,
  defaultAvailability,
}: {
  formId: string;
  activeCount: number;
  defaultType?: string;
  defaultCategory?: string;
  defaultAvailability?: string;
}) {
  const [type, setType] = useState(defaultType || ALL);
  const [category, setCategory] = useState(defaultCategory || ALL);

  const submitType = type === ALL ? "" : type;
  const submitCategory = category === ALL ? "" : category;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" className="gap-2">
            <FilterIcon className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className="inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {activeCount}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <p className="text-sm font-semibold">Filters</p>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(String(v))}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) => TYPE_OPTIONS.find((o) => o.value === v)?.label ?? "All types"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" sideOffset={6} alignItemWithTrigger={false}>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="type" form={formId} value={submitType} />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(String(v))}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v) => CATEGORY_OPTIONS.find((o) => o.value === v)?.label ?? "All categories"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="start" sideOffset={6} alignItemWithTrigger={false}>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="category" form={formId} value={submitCategory} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-availability">Availability</Label>
            <Input
              id="filter-availability"
              name="availability"
              form={formId}
              placeholder="e.g. weekends, evenings"
              defaultValue={defaultAvailability ?? ""}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" form={formId} className="flex-1" size="sm">
              Apply
            </Button>
            {activeCount > 0 && (
              <Button asChild variant="outline" size="sm">
                <a href="/skills">Clear</a>
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
