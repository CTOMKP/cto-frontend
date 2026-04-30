import { toast } from "react-toastify";
import { isApiError } from "@/lib/apiError";

export function toastMutationError(error: unknown, fallback: string) {
  if (isApiError(error)) {
    toast.error(error.message || fallback);
    return;
  }
  if (error instanceof Error && error.message) {
    toast.error(error.message);
    return;
  }
  toast.error(fallback);
}
