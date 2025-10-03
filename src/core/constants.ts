// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const LocalStorageKeys = {
  keylessAccounts: "@aptos-connect/keyless-accounts",
};

export const devnetClient = new Aptos(
  new AptosConfig({ network: Network.DEVNET })
);

/// FIXME: Put your client id here
export const GOOGLE_CLIENT_ID = "183078290049-m7t32so1urkgkjoceafkeut6g63q3i48.apps.googleusercontent.com";
