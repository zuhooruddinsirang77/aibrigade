import { permanentRedirect } from "next/navigation";
import { LEGACY_ROUTES, useCaseHref } from "@/components/usecases.data";

/* Was the "UUB Health" client case study — a placeholder client. The
   route is kept so old links still land, on InCall, the third of the
   flagship builds the home page's Cases section now tells. */
export default function Page() {
  permanentRedirect(useCaseHref(LEGACY_ROUTES.uub));
}
