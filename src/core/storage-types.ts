// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

/**
 * Shared types for localStorage serialization/deserialization
 */

export interface BigIntEncoded {
  __type: "bigint";
  value: string;
}

export interface Uint8ArrayEncoded {
  __type: "Uint8Array";
  value: number[];
}

export interface EphemeralKeyPairEncoded {
  __type: "EphemeralKeyPair";
  data: Uint8Array;
}

export interface KeylessAccountEncoded {
  __type: "KeylessAccount";
  data: Uint8Array;
}

export type StorageValue = 
  | BigIntEncoded 
  | Uint8ArrayEncoded 
  | EphemeralKeyPairEncoded 
  | KeylessAccountEncoded 
  | unknown;

