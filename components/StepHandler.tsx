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
    const stepParam = searchParams.get("step");
    const step = stepParam ? parseInt(stepParam, 10) : 0;

    if (!stepParam) {
      router.replace("?step=0");
    }

    onStep(step);
  }, [searchParams, router, onStep]);

  return null;
}