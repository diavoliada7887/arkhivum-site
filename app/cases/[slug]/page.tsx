import { StaticRedirect } from "../../StaticRedirect";
import { cases } from "../../content";

export const dynamicParams = false;
export function generateStaticParams() {
  return cases.map((item) => ({ slug: item.slug }));
}

export default async function LegacyCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StaticRedirect to={`/experience/${slug}`} />;
}
