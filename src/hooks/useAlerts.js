import { useState, useCallback } from "react";

const STORAGE_KEY = "crypto-alerts-v1";
const TOPIC_KEY   = "ntfy-topic";

function notify(alert, currentPrice, topic) {
  const dir = alert.condition === "above" ? "▲" : "▼";
  const title = `${alert.coinSymbol.toUpperCase()} Alert`;
  const body  = `${dir} $${alert.price.toLocaleString()} hit — now $${
    currentPrice >= 1
      ? currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : currentPrice.toFixed(5)
  }`;

  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body, icon: alert.coinImage });
  }

  if (topic) {
    fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      body: `${title}: ${body}`,
      headers: { Title: title, Priority: "high", Tags: "bell,chart_with_upwards_trend" },
    }).catch(() => {});
  }
}

export function useAlerts() {
  const [alerts, setAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
    catch { return []; }
  });

  const [topic, setTopicState] = useState(() => localStorage.getItem(TOPIC_KEY) ?? "");

  const setTopic = useCallback((t) => {
    setTopicState(t);
    localStorage.setItem(TOPIC_KEY, t);
  }, []);

  const addAlert = useCallback((coinId, coinName, coinSymbol, coinImage, condition, price) => {
    const entry = { id: Date.now(), coinId, coinName, coinSymbol, coinImage, condition, price: Number(price) };
    setAlerts(prev => {
      const next = [...prev, entry];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => {
      const next = prev.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const checkAlerts = useCallback((markets) => {
    setAlerts(prev => {
      if (!prev.length) return prev;
      const remaining = [];
      let changed = false;
      const t = localStorage.getItem(TOPIC_KEY) ?? "";
      prev.forEach(alert => {
        const coin = markets.find(m => m.id === alert.coinId);
        if (!coin) { remaining.push(alert); return; }
        const hit = alert.condition === "above"
          ? coin.current_price >= alert.price
          : coin.current_price <= alert.price;
        if (hit) {
          changed = true;
          notify(alert, coin.current_price, t);
        } else {
          remaining.push(alert);
        }
      });
      if (!changed) return prev;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      return remaining;
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  return { alerts, topic, setTopic, addAlert, removeAlert, checkAlerts, requestPermission };
}
