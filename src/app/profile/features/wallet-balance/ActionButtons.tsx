import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoveDown, MoveUp, ArrowUpDown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import QRCode from "qrcode";
import Image from "next/image";
import { toast } from "react-toastify";

export type DepositNetwork = "solana" | "movement";

export default function ActionButtons({
  solanaWalletAddress,
  movementWalletAddress,
}: {
  solanaWalletAddress: string | null;
  movementWalletAddress: string | null;
}) {
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositNetwork, setDepositNetwork] = useState<DepositNetwork | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const generateQRCode = async (address: string) => {
    try {
      return await QRCode.toDataURL(address, {
        width: 200,
        margin: 1,
        color: {
          dark: "#FFFFFF",
          light: "#17171C",
        },
      });
    } catch {
      return null;
    }
  };

  const resetDepositDialog = () => {
    setDepositNetwork(null);
    setQrCodeUrl(null);
    setCopiedAddress(false);
  };

  const openDepositDialog = () => {
    resetDepositDialog();
    setDepositOpen(true);
  };

  const selectDepositNetwork = async (net: DepositNetwork) => {
    const addr =
      net === "solana" ? solanaWalletAddress : movementWalletAddress;
    if (!addr) {
      toast.error(
        net === "solana"
          ? "No Solana wallet linked."
          : "No Movement wallet found.",
      );
      return;
    }
    setDepositNetwork(net);
    const qrUrl = await generateQRCode(addr);
    if (!qrUrl) {
      toast.error("Failed to generate QR code");
      setDepositNetwork(null);
      return;
    }
    setQrCodeUrl(qrUrl);
  };

  const activeDepositAddress =
    depositNetwork === "solana"
      ? solanaWalletAddress
      : depositNetwork === "movement"
        ? movementWalletAddress
        : null;

  const copyAddress = () => {
    if (!activeDepositAddress) return;
    navigator.clipboard.writeText(activeDepositAddress);
    setCopiedAddress(true);
    toast.success("Address copied!");
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDepositOpen(open);
    if (!open) resetDepositDialog();
  };

  return (
    <>
      <div className="mt-5 flex items-center gap-2">
        <Button
          onClick={openDepositDialog}
          className="bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] flex-1 h-12 py-3.5 px-6 rounded-full"
        >
          {" "}
          <MoveDown /> Deposit
        </Button>
        <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-full flex-1">
          <Button className="bg-[#010101] h-12 w-full py-3.5 px-6 rounded-full text-white border-none">
            {" "}
            <MoveUp /> Withdraw
          </Button>
        </div>
        <div className="bg-gradient-to-r from-[rgba(236,72,153,0.3)] to-[rgba(250,204,21,0.3)] p-[1px] rounded-full">
          <Button className="bg-[#010101] size-12 rounded-full text-white border-none">
            {" "}
            <ArrowUpDown />
          </Button>
        </div>
      </div>
      <Dialog open={depositOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="bg-[#010101] text-white w-[300px] border-2 border-[#86868630]">
          <DialogTitle className="text-base font-semibold text-white pr-8">
            {depositNetwork == null
              ? "Deposit"
              : depositNetwork === "solana"
                ? "Solana deposit"
                : "Movement deposit"}
          </DialogTitle>

          {depositNetwork == null ? (
            <div className="space-y-3 pt-1">
              <p className="text-sm text-[#A1A1AA]">
                Choose which network you are sending on. The address is different for each.
              </p>
              <Button
                type="button"
                disabled={!solanaWalletAddress}
                onClick={() => void selectDepositNetwork("solana")}
                className="w-full h-11 rounded-full bg-gradient-to-r from-[#FF0075]/90 via-[#FF4A15]/90 to-[#FFCB45]/90 text-white font-medium disabled:opacity-40"
              >
                Solana
              </Button>
              <Button
                type="button"
                disabled={!movementWalletAddress}
                onClick={() => void selectDepositNetwork("movement")}
                className="w-full h-11 rounded-full border border-white/25 bg-white/5 text-white font-medium hover:bg-white/10 disabled:opacity-40"
              >
                Movement
              </Button>
              {!solanaWalletAddress && (
                <p className="text-xs text-amber-200/80">
                  Link a Solana wallet in your account to deposit on Solana.
                </p>
              )}
              {!movementWalletAddress && (
                <p className="text-xs text-amber-200/80">
                  Movement wallet not available yet.
                </p>
              )}
            </div>
          ) : depositNetwork && !qrCodeUrl ? (
            <p className="text-sm text-white/50 py-8 text-center">Preparing QR…</p>
          ) : qrCodeUrl && activeDepositAddress ? (
            <div>
              <div className="bg-white/6 rounded-lg py-3 px-2.5">
                <div className="flex justify-center mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt="Wallet QR Code"
                    className="w-48 h-41"
                  />
                </div>

                <span className="text-[#A1A1AA] text-sm">
                  {depositNetwork === "solana"
                    ? "Solana address"
                    : "Movement address"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 flex-1 truncate font-mono">
                    {`${activeDepositAddress.slice(0, 10)}...${activeDepositAddress.slice(-8)}`}
                  </span>
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="text-white/70 hover:text-white transition-colors p-1"
                  >
                    {copiedAddress ? (
                      <Check size={14} className="text-[#16C784]" />
                    ) : (
                      <Image src="/copy.svg" alt="copy" width={14} height={14} />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs leading-[100%] text-white my-5">
                {depositNetwork === "solana"
                  ? "This address receives assets on the Solana network only. Sending tokens from other networks can result in permanent loss."
                  : "This address can only receive coins on the Movement network. Sending tokens from another network will result in loss of funds."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setDepositNetwork(null);
                  setQrCodeUrl(null);
                }}
                className="text-sm text-[#FF9631] hover:underline mb-3 w-full text-center"
              >
                Change network
              </button>

              <Button
                onClick={() => handleDialogOpenChange(false)}
                className="w-full cta-gradient rounded-full py-3.5 px-6"
              >
                Done
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
