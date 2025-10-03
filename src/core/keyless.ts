// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { KeylessAccount } from "@aptos-labs/ts-sdk";
import { isValidEphemeralKeyPair } from "./ephemeral";
import { decodeIdToken, isValidIdToken } from "./idToken";
import { KeylessAccountEncoded } from "./storage-types";

/**
 * Encoding for the KeylessAccount class to be stored in localStorage
 */
export const KeylessAccountEncoding = {
  decode: (e: KeylessAccountEncoded) => KeylessAccount.fromBytes(e.data),
  // If the account has a proof, it can be persisted, otherwise,
  // it should not be stored.
  encode: (e: KeylessAccount): KeylessAccountEncoded | undefined =>
    e.proof
      ? {
        __type: "KeylessAccount",
        data: e.bcsToBytes(),
      }
      : undefined,
};

/**
 * If the account has an invalid Ephemeral key pair or idToken, the account needs to be refreshed with either
 * a new nonce or idToken. If the account is valid, it is returned.
 *
 * @param account - The account to validate.
 * @returns The account if it is valid, otherwise undefined.
 */
export const validateKeylessAccount = (
  account: KeylessAccount
): KeylessAccount | undefined => {
  try {
    // Check the Ephemeral key pair expiration
    if (!isValidEphemeralKeyPair(account.ephemeralKeyPair)) return undefined;
    
    // Check the idToken for nonce
    if (!isValidIdToken(account.jwt)) return undefined;
    
    // If the EphemeralAccount nonce algorithm changes, this will need to be updated
    const decodedToken = decodeIdToken(account.jwt);
    if (decodedToken.nonce !== account.ephemeralKeyPair.nonce) return undefined;
    
    return account;
  } catch (error: unknown) {
    console.warn("Error validating keyless account:", error);
    return undefined;
  }
};
