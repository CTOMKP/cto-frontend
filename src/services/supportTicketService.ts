import { apiGet, apiPost } from "@/lib/apiClient";
import { unwrapApiJsonBody } from "@/lib/apiResponse";

export interface SupportTicketPayload {
  subject: string;
  message: string;
  category?: "GENERAL" | "SWAP" | "WALLET" | "PAYMENT" | "LISTING" | "ADS" | "ACCOUNT" | "OTHER";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const supportTicketService = {
  async submit(payload: SupportTicketPayload): Promise<SupportTicket> {
    const res = await apiPost<unknown>("/api/v1/support/tickets", payload);
    return unwrapApiJsonBody<SupportTicket>(res);
  },

  async getMine(limit = 10): Promise<SupportTicket[]> {
    const res = await apiGet<unknown>(`/api/v1/support/tickets/mine?limit=${limit}`);
    return unwrapApiJsonBody<SupportTicket[]>(res) || [];
  },
};

export default supportTicketService;
