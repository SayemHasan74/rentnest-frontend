"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
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

const buildFilterUrl = (values: FilterValues) => {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    const normalized = value.trim();

    if (normalized) {
      params.set(key, normalized);
    }
  });

  params.set("page", "1");
  return `/properties?${params.toString()}`;
};

export function PropertyFiltersForm({
  categories,
  values,
}: {
  categories: Category[];
  values: FilterValues;
}) {
  const router = useRouter();
  const [filterValues, setFilterValues] = useState(values);
  const initialFilterValues = useRef(JSON.stringify(values));

  useEffect(() => {
    if (JSON.stringify(filterValues) === initialFilterValues.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      router.replace(buildFilterUrl(filterValues));
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [filterValues, router]);

  const updateFilter = (name: keyof FilterValues, value: string) => {
    setFilterValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildFilterUrl(filterValues));
  };

  return (
    <form
      className="border-t border-slate-950 bg-transparent py-5 lg:sticky lg:top-24"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="text-slate-950" size={18} aria-hidden="true" />
        <h2 className="text-base font-semibold text-slate-950">Filters</h2>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            onChange={(event) => updateFilter("location", event.target.value)}
            placeholder="Banani, Uttara, Dhaka"
            value={filterValues.location}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="type">Property type</Label>
          <select
            className="h-10 w-full rounded-md border border-slate-400 bg-surface px-3 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-emerald-100"
            id="type"
            name="type"
            onChange={(event) => updateFilter("type", event.target.value)}
            value={filterValues.type}
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
              id="minPrice"
              min="1"
              name="minPrice"
              onChange={(event) => updateFilter("minPrice", event.target.value)}
              placeholder="30000"
              type="number"
              value={filterValues.minPrice}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxPrice">Max rent</Label>
            <Input
              id="maxPrice"
              min="1"
              name="maxPrice"
              onChange={(event) => updateFilter("maxPrice", event.target.value)}
              placeholder="80000"
              type="number"
              value={filterValues.maxPrice}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="amenities">Amenities</Label>
          <Input
            id="amenities"
            name="amenities"
            onChange={(event) => updateFilter("amenities", event.target.value)}
            placeholder="Parking, Security"
            value={filterValues.amenities}
          />
          <p className="text-xs text-slate-500">Separate multiple amenities with commas.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="limit">Listings per page</Label>
          <select
            className="h-10 w-full rounded-md border border-slate-400 bg-surface px-3 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-emerald-100"
            id="limit"
            name="limit"
            onChange={(event) => updateFilter("limit", event.target.value)}
            value={filterValues.limit || defaultValues.limit}
          >
            <option value="6">6</option>
            <option value="9">9</option>
            <option value="12">12</option>
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <Button type="submit">Update now</Button>
        <Link
          className={buttonClasses({ variant: "outline" })}
          href="/properties"
          onClick={() => setFilterValues(defaultValues)}
        >
          <X size={16} aria-hidden="true" />
          Clear filters
        </Link>
      </div>
    </form>
  );
}

export { defaultValues as defaultPropertyFilterValues };
