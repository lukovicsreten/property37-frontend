import type { PropertyResponse, PropertyType } from "./types";

export function propertyTypeOf(p: PropertyResponse): PropertyType {
  return (p.propertyType ?? p.type) as PropertyType;
}
