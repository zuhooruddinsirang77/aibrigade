import { permanentRedirect } from "next/navigation";
import { LEGACY_ROUTES, useCaseHref } from "@/components/usecases.data";

/* Was the "Meridian Capital" client case study (underwriting for an
   investment bank) — a placeholder client. The route is kept so old links
   still land, on the banking product we have actually built: Axon. */
export default function Page() {
  permanentRedirect(useCaseHref(LEGACY_ROUTES.halyk));
}
