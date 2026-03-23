import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoveDown, MoveUp, ArrowUpDown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import QRCode from "qrcode";
import Image from "next/image";
import { toast } from "react-toastify";

export default function ActionButtons({
  primaryWalletAddress,
}: {
  primaryWalletAddress: string;
}) {
  const [depositOpen, setDepositOpen] = useState(false);
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

  const openDepositDialog = async () => {
    if (!primaryWalletAddress) {
      toast.error("No wallet connected");
      return;
    }
    const qrUrl = await generateQRCode(primaryWalletAddress);
    if (!qrUrl) {
      toast.error("Failed to generate QR code");
      return;
    }
    setQrCodeUrl(qrUrl);
    setDepositOpen(true);
  };

  const copyAddress = () => {
    if (!primaryWalletAddress) return;
    navigator.clipboard.writeText(primaryWalletAddress);
    setCopiedAddress(true);
    toast.success("Address copied!");
    setTimeout(() => setCopiedAddress(false), 2000);
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
    <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
      <DialogContent className="bg-[#010101] text-white w-[300px] border-2 border-[#86868630]">
        <DialogTitle className="sr-only">Deposit</DialogTitle>
        {qrCodeUrl ? (
          <div>
            <div className="bg-white/6 rounded-lg py-3 px-2.5">
              <div className="flex justify-center mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="Wallet QR Code" className="w-48 h-41" />
              </div>

              <span className="text-[#A1A1AA] text-sm">Movement address</span>
              <div className="flex items-center gap-2">
                <span className="text-white/70 flex-1 truncate font-mono">
                  {primaryWalletAddress
                    ? `${primaryWalletAddress.slice(0, 10)}...${primaryWalletAddress.slice(-8)}`
                    : "No wallet connected"}
                </span>
                {primaryWalletAddress ? (
                  <button
                    onClick={copyAddress}
                    className="text-white/70 hover:text-white transition-colors p-1"
                  >
                    {copiedAddress ? (
                      <Check size={14} className="text-[#16C784]" />
                    ) : (
                      <Image src="/copy.svg" alt="copy" width={14} height={14} />
                    )}
                  </button>
                ) : null}
              </div>
            </div>

            <p className="text-xs leading-[100%] text-white my-5">
              This address can only receive Coins from the Movement network. Sending tokens from another network will result in loss of funds.
            </p>
            <Button
              onClick={() => setDepositOpen(false)}
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
