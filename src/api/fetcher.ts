import { Fetcher } from "openapi-typescript-fetch";
import { paths } from "./portals-schema";

const fetcher = Fetcher.for<paths>();

fetcher.configure({
  baseUrl: "https://api.portals.fi",
});
// Exporting fetcher here so can be used in future for some necessary edge case
export default fetcher;

// Add all necessary api endpoint requests here:

export const getNetworksList = fetcher
  .path("/v1/networks")
  .method("get")
  .create();
export const getPlatformsList = fetcher
  .path("/v2/platforms")
  .method("get")
  .create();
export const getTokensList = fetcher.path("/v2/tokens").method("get").create();
export const getAccountBalances = fetcher
  .path("/v2/account")
  .method("get")
  .create();
export const estimateTransaction = fetcher
  .path("/v1/portal/{network}/estimate")
  .method("get")
  .create();
export const fetchFromPortal = fetcher
  .path("/v1/portal/{network}")
  .method("get")
  .create();
