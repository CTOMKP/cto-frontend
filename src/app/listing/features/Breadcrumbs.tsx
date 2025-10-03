import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const images = [
  "/default-trending-coin-img.png",
  "/default-trending-coin-img.png",
  "/default-trending-coin-img.png",
];

export default function Breadcrumbs() {
  return (
    <div className="bg-gradient-to-r from-pink-500 to-yellow-400 p-[0.7px] !w-full rounded-xl">
      <Card className="!w-full border-none p-3 bg-[#010101]">
        <CardHeader className="px-0">
          <CardTitle className="flex items-center gap-1 text-base font-bold">
            Breadcrumbs{" "}
            <Image
              className="mt-0.5"
              src="/info.svg"
              alt="info"
              width={13}
              height={13}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 -mt-4">
          <Table>
            <TableHeader className="text-[#FFFFFF50] hidden">
              <TableRow className="border-none">
                <TableHead className="!font-bold">Space Title</TableHead>
                <TableHead className="!font-bold">
                  <span className="flex items-center gap-1">
                    Community space
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-none">
                <TableCell className="!py-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <Image
                        className="rounded-full border-[0.3px] border-white"
                        src="/default-trending-coin-img.png"
                        alt="profile picture"
                        width={24}
                        height={24}
                      />
                      <span className="flex gap-1 items-center">
                        <h1 className="font-bold">Bawsbarbie</h1>
                        <Image
                          className="rounded-full"
                          src="/certified.svg"
                          alt="profile picture"
                          width={16}
                          height={16}
                        />
                      </span>
                      <span className="text-xs font-light text-[#6E767D]">
                        is hosting
                      </span>
                    </div>
                    <h2 className="font-bold text-[15px] text-wrap leading-5 w-[190px] my-2">
                  Breadcrumbs EP 10- community vibes
                </h2>
                  </div>
                </TableCell>
                <TableCell className="!py-1">
                  <div className="flex justify-end mt-10">
                    <div className="bg-gradient-to-r from-pink-500 to-yellow-400 p-[1px] rounded-[50px] w-fit">
                  <div className="flex gap-1 items-center bg-[#010101] h-[28px] w-24  rounded-[50px] pr-1">
                    <div className="flex -space-x-3">
                      {images.map((img, index) => (
                        <Image
                          key={index}
                          className={`rounded-full size-[29px] border-[0.3px] border-white relative z-[${
                            images.length - index
                          }]`}
                          src={img}
                          alt="profile picture"
                          width={29}
                          height={29}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold">+802</span>
                  </div>
                </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="border-none">
                <TableCell className="!py-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <Image
                        className="rounded-full border-[0.3px] border-white"
                        src="/default-trending-coin-img.png"
                        alt="profile picture"
                        width={24}
                        height={24}
                      />
                      <span className="flex gap-1 items-center">
                        <h1 className="font-bold">Bawsbarbie</h1>
                        <Image
                          className="rounded-full"
                          src="/certified.svg"
                          alt="profile picture"
                          width={16}
                          height={16}
                        />
                      </span>
                      <span className="text-xs font-light text-[#6E767D]">
                        is hosting
                      </span>
                    </div>
                    <h2 className="font-bold text-[15px] text-wrap leading-5 w-[190px] my-2">
                  Breadcrumbs EP 10- community vibes
                </h2>
                  </div>
                </TableCell>
                <TableCell className="!py-1">
                  <div className="flex justify-end mt-10">
                    <div className="bg-gradient-to-r from-pink-500 to-yellow-400 p-[1px] rounded-[50px] w-fit">
                  <div className="flex gap-1 items-center bg-[#010101] h-[28px] w-24  rounded-[50px] pr-1">
                    <div className="flex -space-x-3">
                      {images.map((img, index) => (
                        <Image
                          key={index}
                          className={`rounded-full size-[29px] border-[0.3px] border-white relative z-[${
                            images.length - index
                          }]`}
                          src={img}
                          alt="profile picture"
                          width={29}
                          height={29}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold">+802</span>
                  </div>
                </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow className="border-none">
                <TableCell className="!py-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <Image
                        className="rounded-full border-[0.3px] border-white"
                        src="/default-trending-coin-img.png"
                        alt="profile picture"
                        width={24}
                        height={24}
                      />
                      <span className="flex gap-1 items-center">
                        <h1 className="font-bold">Bawsbarbie</h1>
                        <Image
                          className="rounded-full"
                          src="/certified.svg"
                          alt="profile picture"
                          width={16}
                          height={16}
                        />
                      </span>
                      <span className="text-xs font-light text-[#6E767D]">
                        is hosting
                      </span>
                    </div>
                    <h2 className="font-bold text-[15px] text-wrap leading-5 w-[190px] my-2">
                  Breadcrumbs EP 10- community vibes
                </h2>
                  </div>
                </TableCell>
                <TableCell className="!py-1">
                  <div className="flex justify-end mt-10">
                    <div className="bg-gradient-to-r from-pink-500 to-yellow-400 p-[1px] rounded-[50px] w-fit">
                  <div className="flex gap-1 items-center bg-[#010101] h-[28px] w-24  rounded-[50px] pr-1">
                    <div className="flex -space-x-3">
                      {images.map((img, index) => (
                        <Image
                          key={index}
                          className={`rounded-full size-[29px] border-[0.3px] border-white relative z-[${
                            images.length - index
                          }]`}
                          src={img}
                          alt="profile picture"
                          width={29}
                          height={29}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold">+802</span>
                  </div>
                </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Link
            href="#"
            className="text-[#FFFFFFB2] text-sm mt-5 flex items-center"
          >
            Show more <ChevronRight size={16} />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
