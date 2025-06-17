import HeaderAd from "@/components/HeaderAd";
import Highlights from "@/components/homepage/Highlights";
import MarketTrends from "@/components/MarketTrends";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <div>
      <HeaderAd />
      <NavBar />
      <MarketTrends />
      <Highlights />
    </div>
  );
}
