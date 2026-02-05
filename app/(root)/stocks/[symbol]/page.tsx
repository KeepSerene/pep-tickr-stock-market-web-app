import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";

async function StockDetailsPage({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const baseScriptUrl =
    "https://s3.tradingview.com/external-embedding/embed-widget-";

  const companyName = symbol.toUpperCase();
  const isInWatchlist = false; // for now

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column */}
      <section className="space-y-8">
        {/* Symbol Info */}
        <TradingViewWidget
          scriptUrl={`${baseScriptUrl}symbol-info.js`}
          config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
          height={170}
        />

        {/* Candle Chart */}
        <TradingViewWidget
          title="Advanced Chart"
          scriptUrl={`${baseScriptUrl}advanced-chart.js`}
          config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
          height={600}
          className="custom-chart"
        />

        {/* Baseline Widget */}
        <TradingViewWidget
          title="Baseline Chart"
          scriptUrl={`${baseScriptUrl}advanced-chart.js`}
          config={BASELINE_WIDGET_CONFIG(symbol)}
          height={600}
          className="custom-chart"
        />
      </section>

      {/* Right Column */}
      <section className="space-y-8">
        {/* Watchlist Button */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
          <WatchlistButton
            type="button"
            symbol={symbol}
            company={companyName}
            isInWatchlist={isInWatchlist}
          />
        </div>

        {/* Technical Analysis */}
        <TradingViewWidget
          title="Technical Analysis"
          scriptUrl={`${baseScriptUrl}technical-analysis.js`}
          config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
          height={400}
        />

        {/* Company Profile */}
        <TradingViewWidget
          title="Company Profile"
          scriptUrl={`${baseScriptUrl}symbol-profile.js`}
          config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
          height={440}
        />

        {/* Company Financials */}
        <TradingViewWidget
          title="Financials"
          scriptUrl={`${baseScriptUrl}financials.js`}
          config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
          height={464}
        />
      </section>
    </div>
  );
}

export default StockDetailsPage;
