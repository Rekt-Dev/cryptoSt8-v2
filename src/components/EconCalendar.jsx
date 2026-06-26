import { useEffect, useRef } from "react";

export default function EconCalendar() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme:       "dark",
      isTransparent:    true,
      width:            "100%",
      height:           400,
      locale:           "en",
      importanceFilter: "-1,0,1",
      countryFilter:    "us,eu,gb,jp,cn",
    });
    ref.current.appendChild(script);
    return () => { if (ref.current) ref.current.innerHTML = ""; };
  }, []);

  return (
    <div style={S.wrap}>
      <div style={S.label}>Economic Calendar</div>
      <div ref={ref} className="tradingview-widget-container" />
    </div>
  );
}

const S = {
  wrap:  { padding:"12px 20px 0" },
  label: { fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 },
};
