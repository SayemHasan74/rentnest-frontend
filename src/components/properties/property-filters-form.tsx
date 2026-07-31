"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { Category } from "@/types/rentnest";

type FilterValues = {
  location: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  amenities: string;
  limit: string;
};

const defaultValues: FilterValues = {
  location: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  amenities: "",
  limit: "9",
};

export function PropertyFiltersForm({
  categories,
  values,
}: {
  categories: Category[];
  values: FilterValues;
}) {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      const normalized = String(value).trim();

      if (normalized) {
        params.set(key, normalized);
      }
    }

    params.set("page", "1");
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="text-emerald-700" size={18} aria-hidden="true" />
        <h2 className="text-base font-semibold text-slate-950">Filters</h2>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            defaultValue={values.location}
            id="location"
            name="location"
            placeholder="Banani, Uttara, Dhaka"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="type">Property type</Label>
          <select
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            defaultValue={values.type}
            id="type"
            name="type"
          >
            <option value="">Any type</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="minPrice">Min rent</Label>
            <Input
              defaultValue={values.minPrice}
              id="minPrice"
              min="1"
              name="minPrice"
              placeholder="30000"
              type="number"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxPrice">Max rent</Label>
            <Input
              defaultValue={values.maxPrice}
              id="maxPrice"
              min="1"
              name="maxPrice"
              placeholder="80000"
              type="number"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="amenities">Amenities</Label>
          <Input
            defaultValue={values.amenities}
            id="amenities"
            name="amenities"
            placeholder="Parking, Security"
          />
          <p className="text-xs text-slate-500">Separate multiple amenities with commas.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="limit">Listings per page</Label>
          <select
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
            defaultValue={values.limit || defaultValues.limit}
            id="limit"
            name="limit"
          >
            <option value="6">6</option>
            <option value="9">9</option>
            <option value="12">12</option>
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <Button type="submit">Apply filters</Button>
        <Link
          className={buttonClasses({ variant: "outline" })}
          href="/properties"
        >
          <X size={16} aria-hidden="true" />
          Clear filters
        </Link>
      </div>
    </form>
  );
}

export { defaultValues as defaultPropertyFilterValues };
