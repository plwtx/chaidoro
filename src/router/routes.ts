import type { Features } from "@/types";

export const ROUTE_INDEX: Record<string, number> = {
  "/": 0,
  "/statistics": 1,
  "/settings": 2,
};

export const ROUTE_FEATURE: Record<string, keyof Features> = {};
