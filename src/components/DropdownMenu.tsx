"use client";

import React, { type ReactNode, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronDown, MoveUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  APP_CURRENCIES,
  APP_LANGUAGES,
  getCurrencyMeta,
  getLanguageMeta,
  usePreferencesStore,
  type AppCurrency,
  type AppLanguage,
} from "@/lib/preferencesStore";

function MenuHover({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-lg group p-[1px] transition-all duration-300"
      style={{ background: "transparent", borderRadius: "8px" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background =
          "linear-gradient(100.86deg, rgba(255, 0, 117, 0.3) 4.13%, rgba(255, 74, 21, 0.3) 55.91%, rgba(255, 203, 69, 0.3) 100%)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        className="rounded-lg flex w-full h-full p-2"
        style={{
          background: "#010101",
          borderRadius: "8px",
          transition: "all 0.3s ease-in-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function NavDropdownMenu() {
  const { t, i18n } = useTranslation();
  const language = usePreferencesStore((s) => s.language);
  const currency = usePreferencesStore((s) => s.currency);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const setCurrency = usePreferencesStore((s) => s.setCurrency);
  const languageMeta = getLanguageMeta(language);
  const currencyMeta = getCurrencyMeta(currency);
  const [panel, setPanel] = useState<"language" | "currency" | null>(null);

  const handleLanguage = (code: AppLanguage) => {
    setLanguage(code);
    void i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(open) => {
        if (!open) setPanel(null);
      }}
    >
      <DropdownMenuTrigger className="mx-12 size-6 min-w-fit p-0">
        <Image loading="lazy" src="/nav-bar/menu.svg" alt="menu" width={24} height={24} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="bg-[#010101] text-sm font-normal text-[#FFFFFFB2] w-76 !border-2 !border-[#86868630] p-4"
      >
        <MenuHover>
          <Link href="#" className="!block flex-1 items-center justify-between !w-full">
            <div className="w-full flex justify-between items-center">
              <span>{t("menu.ads")}</span>
              <span className="text-[#FFDD0FB2] text-[10px] bg-[#FFDD0F0D] rounded-[3px] px-[7px] py-1.5">
                {t("menu.new")}
              </span>
            </div>
          </Link>
        </MenuHover>

        <MenuHover>
          <Link href="#" className="!block flex-1 items-center justify-between !w-full">
            <div className="w-full flex justify-between items-center">
              <span>{t("menu.contactSupport")}</span>
              <MoveUpRight size={10} color="#FFFFFFB2" />
            </div>
          </Link>
        </MenuHover>

        <MenuHover>
          <Link href="#" className="!block flex-1 items-center justify-between !w-full">
            {t("menu.settings")}
          </Link>
        </MenuHover>

        <div className="bg-[#FFFFFF33] h-[1px] my-4"></div>

        <MenuHover>
          <DropdownMenuItem
            className="flex w-full flex-1 cursor-pointer items-center justify-between p-0 text-[#FFFFFFB2] focus:bg-transparent focus:text-white"
            onSelect={(e) => {
              e.preventDefault();
              setPanel(panel === "language" ? null : "language");
            }}
          >
            <span>{t("menu.language")}</span>
            <span className="flex items-center gap-1">
              {languageMeta.native}
              <ChevronDown
                size={12}
                className={`transition-transform ${panel === "language" ? "rotate-180" : ""}`}
              />
            </span>
          </DropdownMenuItem>
        </MenuHover>
        {panel === "language" && (
          <div className="mt-1 mb-2 max-h-52 overflow-y-auto rounded-lg border border-white/10 p-1 hover-scrollbar">
            {APP_LANGUAGES.map((item) => (
              <DropdownMenuItem
                key={item.code}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-[#FFFFFFB2] focus:bg-white/10 focus:text-white"
                onSelect={(e) => {
                  e.preventDefault();
                  handleLanguage(item.code as AppLanguage);
                }}
              >
                <span>
                  {item.native}
                  <span className="ml-2 text-xs text-white/40">{item.label}</span>
                </span>
                {language === item.code ? <Check size={14} className="text-white" /> : null}
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <MenuHover>
          <DropdownMenuItem
            className="flex w-full flex-1 cursor-pointer items-center justify-between p-0 text-[#FFFFFFB2] focus:bg-transparent focus:text-white"
            onSelect={(e) => {
              e.preventDefault();
              setPanel(panel === "currency" ? null : "currency");
            }}
          >
            <span>{t("menu.currency")}</span>
            <span className="flex items-center gap-1">
              {currencyMeta.code}
              <ChevronDown
                size={12}
                className={`transition-transform ${panel === "currency" ? "rotate-180" : ""}`}
              />
            </span>
          </DropdownMenuItem>
        </MenuHover>
        {panel === "currency" && (
          <div className="mt-1 mb-2 max-h-52 overflow-y-auto rounded-lg border border-white/10 p-1 hover-scrollbar">
            {APP_CURRENCIES.map((item) => (
              <DropdownMenuItem
                key={item.code}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-[#FFFFFFB2] focus:bg-white/10 focus:text-white"
                onSelect={(e) => {
                  e.preventDefault();
                  setCurrency(item.code as AppCurrency);
                }}
              >
                <span>
                  {item.code}
                  <span className="ml-2 text-xs text-white/40">{item.name}</span>
                </span>
                {currency === item.code ? <Check size={14} className="text-white" /> : null}
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <Button className="w-full rounded-lg border-[0.2px] border-[#FFFFFF20] h-8.5 mt-4 mb-6">
          {t("menu.api")}
        </Button>

        <div className="p-3 rounded-lg bg-[#FFFFFF0A]">
          <h1 className="font-bold text-base text-white">{t("menu.headline")}</h1>
          <p className="text-xs mt-2 mb-4">{t("menu.subhead")}</p>
          <Link href="/list-asset" className="w-full flex justify-center items-center rounded-lg h-8.5 cta-gradient text-white">
            {t("menu.applyListing")}
          </Link>
        </div>

        <div className="flex justify-center items-center gap-4 mt-6">
          <a
            href="https://www.ctomarketplace.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center size-9.5 bg-[#1A1A1A] rounded-full"
            aria-label="CTO Marketplace website"
          >
            <Image loading="lazy" src="/globe2.svg" alt="globe" className="size-5.5" width={22} height={22} />
          </a>
          <a
            href="https://x.com/CTOMarketplace?s=20"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center size-9.5 bg-[#1A1A1A] rounded-full"
            aria-label="CTO Marketplace on X"
          >
            <Image loading="lazy" src="/x-white.svg" alt="x" className="size-3.5" width={14} height={14} />
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
