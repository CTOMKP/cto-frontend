"use client";

import { TableRow, TableCell } from "@/components/ui/table";

export default function UserListingsTableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <TableRow key={index} className="border-none bg-[#FFFFFF]/5 h-13">
          <TableCell>
            <div className="flex justify-center">
              <div className="size-6 rounded-full bg-white/10 animate-pulse" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="size-7 rounded-full bg-white/10 animate-pulse" />
                <div className="absolute bottom-0 left-0 size-[14px] rounded-full border border-[#010101] bg-white/10 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-3 w-24 rounded bg-white/20 animate-pulse" />
                <div className="flex items-center gap-1">
                  <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                  <div className="size-4 rounded bg-white/10 animate-pulse" />
                  <div className="size-[10px] rounded-full bg-white/10 animate-pulse" />
                  <div className="size-[10px] rounded-full bg-white/10 animate-pulse" />
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex justify-center">
              <div className="h-5 w-14 rounded bg-white/10 animate-pulse" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col items-center gap-1">
              <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-14 rounded bg-white/10 animate-pulse" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex justify-center">
              <div className="h-3 w-12 rounded bg-white/10 animate-pulse" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex justify-center">
              <div className="h-3 w-10 rounded bg-white/10 animate-pulse" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col items-center gap-1">
              <div className="h-3 w-14 rounded bg-white/10 animate-pulse" />
              <div className="flex items-center gap-1">
                <div className="size-3 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-10 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex justify-center items-center gap-2">
              <div className="size-4 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-10 rounded bg-white/10 animate-pulse" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex justify-center items-center gap-2">
              <div className="h-3 w-8 rounded bg-white/10 animate-pulse" />
              <div className="size-3 rounded-full bg-white/10 animate-pulse" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
