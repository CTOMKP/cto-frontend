import axios from "axios";
import { toast } from "react-toastify";

export function toastMutationError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    const msg =
      typeof data?.message === "string" && data.message.trim()
        ? data.message
        : error.message || fallback;
    toast.error(msg);
    return;
  }
  if (error instanceof Error && error.message) {
    toast.error(error.message);
    return;
  }
  toast.error(fallback);
}
