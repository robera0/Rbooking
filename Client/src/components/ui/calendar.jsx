"use client";

import React, { useRef, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import { DayPicker, DayButton, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

// =========================
// Calendar Component
// =========================

function CalendarDemo({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      className={cn(
        "bg-[#111111] text-white border border-[#2a2a2a] rounded-2xl shadow-2xl p-4",
        className,
      )}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),

        months: cn("flex flex-col gap-4", defaultClassNames.months),

        month: cn("flex flex-col gap-4", defaultClassNames.month),

        nav: cn(
          "flex items-center justify-between absolute top-4 inset-x-4",
          defaultClassNames.nav,
        ),

        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 p-0 text-gray-400 hover:bg-[#1f1f1f] hover:text-orange-400 rounded-lg",
          defaultClassNames.button_previous,
        ),

        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-8 w-8 p-0 text-gray-400 hover:bg-[#1f1f1f] hover:text-orange-400 rounded-lg",
          defaultClassNames.button_next,
        ),

        month_caption: cn(
          "flex justify-center items-center pt-1 relative",
          defaultClassNames.month_caption,
        ),

        caption_label: cn(
          "text-white font-semibold text-sm",
          defaultClassNames.caption_label,
        ),

        dropdowns: cn("flex justify-center gap-2", defaultClassNames.dropdowns),

        dropdown_root: cn(
          "bg-[#181818] border border-[#2a2a2a] rounded-lg",
          defaultClassNames.dropdown_root,
        ),

        dropdown: cn("bg-transparent", defaultClassNames.dropdown),

        table: "w-full border-collapse mt-4",

        weekdays: cn("flex justify-between", defaultClassNames.weekdays),

        weekday: cn(
          "text-gray-400 text-sm font-medium w-9 text-center",
          defaultClassNames.weekday,
        ),

        week: cn("flex w-full justify-between mt-2", defaultClassNames.week),

        day: cn("relative p-0 text-center", defaultClassNames.day),

        today: cn(
          "border border-orange-500 text-orange-400 rounded-lg",
          defaultClassNames.today,
        ),

        selected: cn(
          "bg-orange-500 text-black hover:bg-orange-500 hover:text-black",
          defaultClassNames.selected,
        ),

        range_start: cn(
          "bg-orange-500 text-black rounded-l-lg",
          defaultClassNames.range_start,
        ),

        range_middle: cn(
          "bg-orange-900/40 text-orange-200 rounded-none",
          defaultClassNames.range_middle,
        ),

        range_end: cn(
          "bg-orange-500 text-black rounded-r-lg",
          defaultClassNames.range_end,
        ),

        outside: cn("text-gray-600 opacity-50", defaultClassNames.outside),

        disabled: cn("text-gray-600 opacity-40", defaultClassNames.disabled),

        hidden: cn("invisible", defaultClassNames.hidden),

        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div
            ref={rootRef}
            data-slot="calendar"
            className={cn(className)}
            {...props}
          />
        ),

        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("h-4 w-4", className)}
                {...props}
              />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("h-4 w-4", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn("h-4 w-4", className)} {...props} />
          );
        },

        DayButton: CalendarDayButton,

        WeekNumber: ({ children, ...props }) => (
          <td {...props}>
            <div className="flex h-9 w-9 items-center justify-center text-sm text-gray-400">
              {children}
            </div>
          </td>
        ),

        ...components,
      }}
      {...props}
    />
  );
}

// =========================
// Custom Day Button
// =========================

function CalendarDayButton({ className, day, modifiers, ...props }) {
  const defaultClassNames = getDefaultClassNames();
  const ref = useRef(null);

  useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus();
    }
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        `
        h-9
        w-9
        rounded-lg
        text-gray-300
        hover:bg-[#1f1f1f]
        hover:text-white
        transition-all
        duration-200

        data-[selected-single=true]:bg-orange-500
        data-[selected-single=true]:text-black

        data-[range-start=true]:bg-orange-500
        data-[range-start=true]:text-black

        data-[range-end=true]:bg-orange-500
        data-[range-end=true]:text-black

        data-[range-middle=true]:bg-orange-900/40
        data-[range-middle=true]:text-orange-200

        focus:ring-2
        focus:ring-orange-500
        `,
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { CalendarDemo, CalendarDayButton };
