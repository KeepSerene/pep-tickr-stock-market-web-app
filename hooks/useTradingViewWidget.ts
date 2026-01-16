import { useEffect, useRef } from "react";

export default function useTradingViewWidget(
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent multiple script injections
    if (containerRef.current.dataset.loaded) return;

    // Clear container and create widget wrapper
    containerRef.current.innerHTML = `<div style="width: 100%; height: ${height}px" class="tradingview-widget-container__widget"></div>`;

    const scriptEl = document.createElement("script");
    scriptEl.src = scriptUrl;
    scriptEl.type = "text/javascript";
    scriptEl.async = true;
    scriptEl.innerHTML = JSON.stringify(config);

    containerRef.current.appendChild(scriptEl);
    containerRef.current.dataset.loaded = "true";

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        delete containerRef.current.dataset.loaded;
      }
    };
  }, [height, scriptUrl, config]);

  return containerRef;
}
