"use client";

import * as React from "react";
import { SectionCards } from "@repo/ui/components/section-cards";
import { ChartAreaInteractive } from "@repo/ui/components/chart-area-interactive";
import { DataTable } from "@repo/ui/components/data-table";
import data from "@/lib/data.json";

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={data} />
    </div>
  );
}

