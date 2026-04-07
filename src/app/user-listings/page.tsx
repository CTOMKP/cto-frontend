"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserListingsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user-listings/mine");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#010101] text-white flex items-center justify-center">
      Redirecting...
    </div>
  );
}

