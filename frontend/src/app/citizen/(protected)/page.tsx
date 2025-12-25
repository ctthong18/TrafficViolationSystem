"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CitizenHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/citizen/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}
