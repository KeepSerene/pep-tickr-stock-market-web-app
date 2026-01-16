import TradingViewWidget from "@/components/TradingViewWidget";
import {
  HEATMAP_WIDGET_CONFIG,
  MARKET_DATA_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
} from "@/lib/constants";

function Home() {
  const baseScriptUrl =
    "https://s3.tradingview.com/external-embedding/embed-widget-";

  return (
    <div className="min-h-dvh flex home-wrapper">
      <section className="home-section w-full grid gap-8">
        {/* Market Overview */}
        <div className="md:col-span-1">
          <TradingViewWidget
            title="Market Overview"
            scriptUrl={`${baseScriptUrl}market-overview.js`}
            config={MARKET_OVERVIEW_WIDGET_CONFIG}
            height={600}
            className="custom-chart"
          />
        </div>

        {/* Stock Heatmap */}
        <div className="md:col-span-1 xl:col-span-2">
          <TradingViewWidget
            title="Stock Heatmap"
            scriptUrl={`${baseScriptUrl}stock-heatmap.js`}
            config={HEATMAP_WIDGET_CONFIG}
            height={600}
            className="custom-chart"
          />
        </div>
      </section>

      <section className="home-section w-full grid gap-8">
        {/* Top Stories */}
        <div className="h-full md:col-span-1">
          <TradingViewWidget
            scriptUrl={`${baseScriptUrl}timeline.js`}
            config={TOP_STORIES_WIDGET_CONFIG}
            height={600}
          />
        </div>

        {/* Market Quotes */}
        <div className="h-full md:col-span-1 xl:col-span-2">
          <TradingViewWidget
            scriptUrl={`${baseScriptUrl}market-quotes.js`}
            config={MARKET_DATA_WIDGET_CONFIG}
            height={600}
          />
        </div>
      </section>
    </div>
  );
}

export default Home;
