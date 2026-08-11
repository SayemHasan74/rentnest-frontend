import type { Metadata } from "next";
import { HomeExplorer } from "@/components/home/home-explorer";
import { api } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Browse homes | RentNest",
  description: "Search live RentNest listings and continue your rental activity.",
};

const areas = ["Gulshan", "Banani", "Dhanmondi", "Uttara", "Baridhara", "Mirpur"];

const getHomeData = async () => {
  const [propertiesResult, categoriesResult] = await Promise.allSettled([
    api.properties.list({ limit: 50, sort: "newest" }),
    api.categories.list(),
  ]);
  const propertyData = propertiesResult.status === "fulfilled"
    ? propertiesResult.value
    : { meta: { total: 0 }, properties: [] };

  return {
    categories: categoriesResult.status === "fulfilled" ? categoriesResult.value : [],
    properties: propertyData.properties,
    total: propertyData.meta.total,
  };
};

export default async function HomePage() {
  const { categories, properties, total } = await getHomeData();
  const areaCounts = areas.map((area) => ({
    area,
    count: properties.filter((property) =>
      `${property.location} ${property.address ?? ""}`.toLowerCase().includes(area.toLowerCase()),
    ).length,
  }));

  return <HomeExplorer areaCounts={areaCounts} categories={categories} properties={properties} total={total} />;
}
