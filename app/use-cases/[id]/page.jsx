import { notFound } from "next/navigation";
import UseCase from "@/components/UseCase";
import { getUseCase, plainHeadline, useCaseIds } from "@/components/usecases.data";

/* One page per product in the showcase, generated at build time. An id
   that isn't a product is a 404, not an empty template. */
export const dynamicParams = false;

export function generateStaticParams() {
  return useCaseIds.map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const uc = getUseCase(id);
  if (!uc) return {};

  const title = `${uc.name} — ${plainHeadline(uc.headline)} | AI Brigade`;
  const description = uc.overview[0];
  return {
    title,
    description,
    alternates: { canonical: uc.href },
    openGraph: {
      title,
      description,
      type: "website",
      url: uc.href,
      ...(uc.poster ? { images: [{ url: uc.poster }] } : null),
    },
  };
}

export default async function UseCasePage({ params }) {
  const { id } = await params;
  if (!getUseCase(id)) notFound();
  return <UseCase id={id} />;
}
