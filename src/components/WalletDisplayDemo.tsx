"use client"

import React from "react";
import { useWallet, groupAndSortWallets } from '@aptos-labs/wallet-adapter-react';

const DisplayAllWalletsDemo = () => {
  const { wallets = [], notDetectedWallets = [] } = useWallet();

  const {
    aptosConnectWallets,
    availableWallets,
    installableWallets
  } = groupAndSortWallets([...wallets, ...notDetectedWallets]);

  return (
    <div className="text-white">
      {/* Wallets that support AptosConnect */}
      {aptosConnectWallets.map((wallet) => (
        <p key={wallet.name}>Wallets that support AptosConnect: {wallet.name}</p>
      ))}

      {/* Wallets that are currently installed or loadable */}
      {availableWallets.map((wallet) => (
        <p key={wallet.name}>Wallets that are currently installed or loadable: {wallet.name}</p>
      ))}

      {/* Wallets that are NOT currently installed or loadable */}
      {installableWallets.map((wallet) => (
        <p key={wallet.name}>Wallets that are NOT currently installed or loadable: {wallet.name}</p>
      ))}
    </div>
  );
};

export default DisplayAllWalletsDemo;
