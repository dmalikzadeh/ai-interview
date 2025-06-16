"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  onStep: (step: number) => void;
};

export default function StepHandler({ onStep }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const stepParam = searchParams.get("step");
    const parsed = parseInt(stepParam || "0", 10);
    const step = isNaN(parsed) ? 0 : parsed;

    if (!stepParam) {
      router.replace("?step=0");
    }

    onStep(step);
  }, [searchParams, router, onStep]);

  return null;
}