"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";

interface NotifOrder {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  customer: { firstName: string; lastName: string };
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}

function sendBrowserNotification(order: NotifOrder) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Nouvelle commande !", {
      body: `${order.orderNumber} — ${order.customer.firstName} ${order.customer.lastName} — ${formatCurrency(order.total)}`,
      icon: "/icons/icon-192x192.png",
      tag: `order-${order.id}`,
    });
  }
}

export default function NotificationBell() {
  const [orders, setOrders] = useState<NotifOrder[]>([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initialLoad = useRef(true);

  const checkOrders = useCallback(async () => {
    try {
      const since = lastChecked || localStorage.getItem("notif_last_checked") || "";
      const url = since
        ? `/api/notifications/orders?since=${encodeURIComponent(since)}`
        : "/api/notifications/orders";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setCount(data.count);
      setOrders(data.orders || []);

      // Notify only for truly new orders (not on initial page load)
      if (!initialLoad.current && data.count > 0 && data.orders?.length > 0) {
        playNotificationSound();
        sendBrowserNotification(data.orders[0]);
      }
      initialLoad.current = false;
    } catch {
      // Silent fail
    }
  }, [lastChecked]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    checkOrders();
    const interval = setInterval(checkOrders, 30000);
    return () => clearInterval(interval);
  }, [checkOrders]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem("notif_last_checked", now);
    setLastChecked(now);
    setCount(0);
    setOrders([]);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        title="Notifications"
      >
        <span className="material-symbols-outlined text-white text-[26px]">
          notifications
        </span>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
            <h3 className="font-semibold text-slate-900 text-sm">
              Notifications
            </h3>
            {count > 0 && (
              <button
                onClick={markAsRead}
                className="text-xs text-primary hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Orders list */}
          <div className="max-h-80 overflow-y-auto">
            {orders.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
                  notifications_off
                </span>
                Aucune nouvelle commande
              </div>
            ) : (
              orders.map((order) => (
                <a
                  key={order.id}
                  href="/admin/orders"
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b last:border-b-0"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-primary text-lg">
                      shopping_bag
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      Nouvelle commande {order.orderNumber}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      {order.customer.firstName} {order.customer.lastName} — {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatTime(order.createdAt)}
                    </p>
                  </div>
                </a>
              ))
            )}
          </div>

          {/* Footer */}
          {orders.length > 0 && (
            <a
              href="/admin/orders"
              className="block text-center text-sm text-primary font-medium py-2.5 hover:bg-slate-50 border-t"
            >
              Voir toutes les commandes
            </a>
          )}
        </div>
      )}
    </div>
  );
}
