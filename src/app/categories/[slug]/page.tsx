import { notFound } from "next/navigation";
import CategoryPageContent from "@/app/categories/features/CategoryPageContent";
import {
  DISCOVERY_CATEGORIES,
  getDiscoveryCategoryBySlug,
} from "@/lib/discoveryCategories";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DISCOVERY_CATEGORIES.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getDiscoveryCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return <CategoryPageContent categoryName={category.name} />;
}
