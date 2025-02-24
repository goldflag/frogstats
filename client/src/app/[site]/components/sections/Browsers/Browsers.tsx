"use client";

import { Compass } from "lucide-react";
import Image from "next/image";
import { StandardCard } from "../../shared/StandardCard";
import { useGetBrowsers } from "@/hooks/api";

const BROWSER_TO_LOGO: Record<string, string> = {
  Chrome: "Chrome.svg",
  "Mobile Chrome": "Chrome.svg",
  "Chrome WebView": "Chrome.svg",
  "Chrome Headless": "Chromium.svg",
  Chromium: "Chromium.svg",
  GSA: "Chromium.svg",
  Firefox: "Firefox.svg",
  "Mobile Firefox": "Firefox.svg",
  Safari: "Safari.svg",
  "Mobile Safari": "Safari.svg",
  Edge: "Edge.svg",
  Opera: "Opera.svg",
  "Opera Touch": "Opera.svg",
  "Opera GX": "OperaGX.svg",
  "Samsung Internet": "SamsungInternet.svg",
  Yandex: "Yandex.svg",
  QQBrowser: "QQ.webp",
  Whale: "Whale.svg",
  Baidu: "Baidu.svg",
  WebKit: "WebKit.svg",
  DuckDuckGo: "DuckDuckGo.svg",
  Facebook: "Facebook.svg",
  "Sogou Explorer": "Sogou.png",
  "Avast Secure Browser": "Avast.png",
  NAVER: "Naver.webp",
  UCBrowser: "UCBrowser.svg",
  "Android Browser": "Android.svg",
  "AVG Secure Browser": "AVG.svg",
  "Smart Lenovo Browser": "Lenovo.png",
  "Vivo Browser": "Vivo.webp",
  Instagram: "Instagram.svg",
  Silk: "Silk.png",
  KAKAOTALK: "KAKAOTALK.svg",
  Iron: "Iron.png",
  Sleipnir: "Sleipnir.webp",
  HeyTap: "HeyTap.png",
  Line: "Line.svg",
  "Oculus Browser": "Oculus.svg",
  Wolvic: "Wolvic.png",
  "360": "360.png",
  PaleMoon: "PaleMoon.png",
  WeChat: "WeChat.svg",
  "Coc Coc": "CocCoc.svg",
  "Huawei Browser": "Huawei.svg",
  IE: "IE.svg",
};

export function Browsers() {
  const { data, isLoading } = useGetBrowsers();

  return (
    <StandardCard
      title="Browsers"
      data={data}
      isLoading={isLoading}
      getKey={(e) => e.browser}
      getLabel={(e) => (
        <div className="flex gap-2 items-center">
          {BROWSER_TO_LOGO[e.browser] ? (
            <Image
              src={`/browsers/${BROWSER_TO_LOGO[e.browser]}`}
              alt={e.browser || "Other"}
              className="w-4 h-4"
              width={16}
              height={16}
            />
          ) : (
            <Compass width={16} />
          )}
          {e.browser || "Other"}
        </div>
      )}
      getValue={(e) => e.browser}
      filterParameter="browser"
    />
  );
}
