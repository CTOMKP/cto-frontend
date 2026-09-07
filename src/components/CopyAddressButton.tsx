"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { copyToClipboard } from "@/utils/helper/copyToClipboard";

type CopyAddressButtonProps = {
  address?: string | null;
  className?: string;
  iconSize?: number;
};

export default function CopyAddressButton({
  address,
  className = "p-0 size-3 min-w-3 h-3 shrink-0 bg-transparent hover:bg-transparent shadow-none",
  iconSize = 12,
}: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (!address) return;
    const ok = await copyToClipboard(address);
    if (!ok) return;
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      className={`${className} inline-flex items-center justify-center`}
      onClick={handleClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={copied ? "Address copied" : "Copy address"}
      title={copied ? "Copied" : "Copy address"}
    >
      {copied ? (
        <Check
          className="shrink-0 text-[#15FF00] animate-in zoom-in-75 fade-in duration-200"
          style={{ width: iconSize, height: iconSize }}
          strokeWidth={3}
        />
      ) : (
        <Image
          src="/copy.svg"
          alt="copy"
          className="shrink-0"
          width={iconSize}
          height={iconSize}
        />
      )}
    </button>
  );
}
