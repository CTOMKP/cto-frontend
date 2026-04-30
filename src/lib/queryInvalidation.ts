import type { QueryClient } from "@tanstack/react-query";
import { listingKeys, marketplaceKeys } from "@/lib/queryKeys";

/** Token/MEME listings domain: table, highlights, mine, detail, etc. */
export async function invalidateListingQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: listingKeys.all });
}

/** Marketplace ads grid + ad detail. */
export async function invalidateMarketplaceQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
}

/** Post-ad flows touch both product surfaces until split by backend. */
export async function invalidateListingAndMarketplaceQueries(queryClient: QueryClient) {
  await invalidateListingQueries(queryClient);
  await invalidateMarketplaceQueries(queryClient);
}
