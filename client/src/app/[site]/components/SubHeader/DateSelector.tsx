"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Time, useStore } from "@/lib/store";
import { DateTime } from "luxon";
import { CustomDateRangePicker } from "./CustomDateRangePicker";

const getLabel = (time: Time) => {
  if (time.mode === "range") {
    if (time.wellKnown) {
      return `${time.wellKnown}`;
    }
    return `${time.startDate} - ${time.endDate}`;
  }

  if (time.mode === "day") {
    if (time.day === DateTime.now().toISODate()) {
      return "Today";
    }
    if (time.day === DateTime.now().minus({ days: 1 }).toISODate()) {
      return "Yesterday";
    }
    return time.day;
  }
  if (time.mode === "week") {
    if (time.week === DateTime.now().startOf("week").toISODate()) {
      return "This Week";
    }
    if (
      time.week ===
      DateTime.now().minus({ weeks: 1 }).startOf("week").toISODate()
    ) {
      return "Last Week";
    }
    return `${time.week} - ${DateTime.fromISO(time.week)
      .endOf("week")
      .toISODate()}`;
  }
  if (time.mode === "month") {
    if (time.month === DateTime.now().startOf("month").toISODate()) {
      return "This Month";
    }
    if (
      time.month ===
      DateTime.now().minus({ months: 1 }).startOf("month").toISODate()
    ) {
      return "Last Month";
    }
    return time.month;
  }
  if (time.mode === "year") {
    if (time.year === DateTime.now().startOf("year").toISODate()) {
      return "This Year";
    }
    return time.year;
  }
  if (time.mode === "all-time") {
    return "All Time";
  }
};

export function DateSelector() {
  const { time, setTime } = useStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{getLabel(time)}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            setTime({
              mode: "day",
              day: DateTime.now().toISODate(),
            })
          }
        >
          Today
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            setTime({
              mode: "range",
              startDate: DateTime.now().minus({ days: 2 }).toISODate(),
              endDate: DateTime.now().toISODate(),
              wellKnown: "Last 3 days",
            })
          }
        >
          Last 3 Days
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            setTime({
              mode: "range",
              startDate: DateTime.now().minus({ days: 6 }).toISODate(),
              endDate: DateTime.now().toISODate(),
              wellKnown: "Last 7 days",
            })
          }
        >
          Last 7 Days
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            setTime({
              mode: "range",
              startDate: DateTime.now().minus({ days: 13 }).toISODate(),
              endDate: DateTime.now().toISODate(),
              wellKnown: "Last 14 days",
            })
          }
        >
          Last 14 Days
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            setTime({
              mode: "range",
              startDate: DateTime.now().minus({ days: 29 }).toISODate(),
              endDate: DateTime.now().toISODate(),
              wellKnown: "Last 30 days",
            })
          }
        >
          Last 30 Days
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            setTime({
              mode: "range",
              startDate: DateTime.now().minus({ days: 59 }).toISODate(),
              endDate: DateTime.now().toISODate(),
              wellKnown: "Last 60 days",
            })
          }
        >
          Last 60 Days
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            setTime({
              mode: "week",
              week: DateTime.now().startOf("week").toISODate(),
            })
          }
        >
          This Week
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            setTime({
              mode: "month",
              month: DateTime.now().startOf("month").toISODate(),
            })
          }
        >
          This Month
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            setTime({
              mode: "year",
              year: DateTime.now().startOf("year").toISODate(),
            })
          }
        >
          This Year
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            setTime({
              mode: "all-time",
            })
          }
        >
          All Time
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <CustomDateRangePicker />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
