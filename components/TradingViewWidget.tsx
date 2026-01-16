"use client";

import useTradingViewWidget from "@/hooks/useTradingViewWidget";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface TradingViewWidgetProps {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}

function TradingViewWidget({
  title = "",
  scriptUrl,
  height = 600,
  config,
  className = "",
}: TradingViewWidgetProps) {
  const containerRef = useTradingViewWidget(scriptUrl, config, height);

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-gray-100 text-2xl font-semibold mb-5">{title}</h3>
      )}

      <div
        ref={containerRef}
        className={cn("tradingview-widget-container", className)}
      >
        <div
          style={{ width: "100%", height }}
          className="tradingview-widget-container__widget"
        />
      </div>

      <div className="tradingview-widget-copyright">
        <p className="trademark">
          Provided by{" "}
          <a
            href="https://in.tradingview.com/"
            target="_blank"
            className="blue-text"
          >
            TradingView
          </a>
        </p>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
