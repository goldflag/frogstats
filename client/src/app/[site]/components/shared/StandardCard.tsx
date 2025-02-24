"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardLoader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addFilter, FilterParameter, useStore } from "../../../../lib/store";

export function StandardCard<T extends { percentage: number; count: number }>({
  title,
  data,
  getKey,
  getLabel,
  getValue,
  isLoading,
  filterParameter,
}: {
  title: string;
  data:
    | {
        data?: T[];
        error?: string;
      }
    | undefined;
  isLoading?: boolean;
  getKey: (item: T) => string;
  getLabel: (item: T) => ReactNode;
  getValue: (item: T) => string;
  filterParameter: FilterParameter;
}) {
  const { filters, setFilters } = useStore();

  return (
    <Card>
      {isLoading && <CardLoader />}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {data?.data?.slice(0, 10).map((e) => (
          <div
            key={getKey(e)}
            className="relative h-7 flex items-center cursor-pointer hover:bg-neutral-850 "
            onClick={() =>
              addFilter({
                parameter: filterParameter,
                value: getValue(e),
                type: "equals",
              })
            }
          >
            <div
              className="absolute inset-0 bg-fuchsia-400 py-2 opacity-30 rounded-md"
              style={{ width: `${e.percentage}%` }}
            ></div>
            <div className="z-10 ml-1 flex justify-between items-center text-sm w-full">
              <div>{getLabel(e)}</div>
              <div className="text-sm flex">
                <div>{e.count.toLocaleString()}</div>
                <div className="ml-1 text-neutral-500">|</div>
                <div className="ml-1 w-10 text-neutral-500">
                  {e.percentage}%
                </div>
              </div>
            </div>
          </div>
        ))}
        {data?.data?.length && data?.data?.length > 10 ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">View All</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] w-[1000px]">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2 max-h-[90vh] overflow-x-hidden">
                {data?.data?.map((e) => (
                  <div
                    key={getKey(e)}
                    className="relative flex items-center mr-3 cursor-pointer hover:bg-neutral-850 "
                    onClick={() =>
                      addFilter({
                        parameter: filterParameter,
                        value: getValue(e),
                        type: "equals",
                      })
                    }
                  >
                    <div
                      className="absolute inset-0 bg-fuchsia-400 py-2 opacity-30 rounded-md"
                      style={{ width: `${e.percentage}%` }}
                    ></div>
                    <div className="z-10 ml-1 flex justify-between items-center text-sm w-full h-7">
                      <div>{getLabel(e)}</div>
                      <div className="text-sm flex">
                        <div>{e.count.toLocaleString()}</div>
                        <div className="mx-2 bg-neutral-400 w-[1px] rounded-full h-5"></div>
                        <div className="w-10 text-neutral-500">
                          {e.percentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </CardContent>
    </Card>
  );
}
