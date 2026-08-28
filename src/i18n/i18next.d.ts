import "i18next";
import type { i18nResources } from "@/i18n/resources";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: (typeof i18nResources)["en"];
  }
}
