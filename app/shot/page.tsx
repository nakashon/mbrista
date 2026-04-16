"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ShotRedirectContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  useEffect(() => {
    router.replace(id ? `/shots?shot=${id}` : "/shots");
  }, [router, id]);
  return null;
}

export default function ShotRedirect() {
  return <Suspense><ShotRedirectContent /></Suspense>;
}
