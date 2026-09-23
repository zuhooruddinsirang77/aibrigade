import { permanentRedirect } from "next/navigation";
import { LEGACY_ROUTES, useCaseHref } from "@/components/usecases.data";

/* Was the "ICU Capital" client case study — a placeholder client with a
   placeholder metric. The route is kept so old links still land: it opens
   the product that page was about, real-time fraud detection. */
export default function Page() {
  permanentRedirect(useCaseHref(LEGACY_ROUTES.icu));
}
