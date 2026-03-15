"use client";

import { useEffect, useState } from "react";
import { DataTable, StatusBadge } from "@/components/dashboard-widgets/Widgets";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Order {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
  items: Array<{ quantity: number; price: number; product: { name: string } }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = () => {
    fetch("/api/orders?limit=100")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
    setSelectedOrder(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">shopping_bag</span>
          Orders
        </h1>
      </div>

      <DataTable
        columns={[
          { key: "orderNumber", header: "Commande #" },
          {
            key: "customer",
            header: "Customer",
            render: (item) => {
              const o = item as unknown as Order;
              return `${o.customer.firstName} ${o.customer.lastName}`;
            },
          },
          {
            key: "total",
            header: "Total",
            render: (item) => {
              const o = item as unknown as Order;
              return formatCurrency(Number(o.total));
            },
          },
          {
            key: "status",
            header: "Status",
            render: (item) => {
              const o = item as unknown as Order;
              return <StatusBadge status={o.status} />;
            },
          },
          {
            key: "paymentStatus",
            header: "Payment",
            render: (item) => {
              const o = item as unknown as Order;
              return <StatusBadge status={o.paymentStatus} />;
            },
          },
          {
            key: "createdAt",
            header: "Date",
            render: (item) => {
              const o = item as unknown as Order;
              return formatDate(o.createdAt);
            },
          },
        ]}
        data={orders as unknown as Record<string, unknown>[]}
        onRowClick={(item) => setSelectedOrder(item as unknown as Order)}
      />

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 m-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Order {selectedOrder.orderNumber}
            </h2>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Client</p>
                <p className="font-semibold text-slate-900">
                  {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                </p>
                <p className="text-sm text-slate-500">{selectedOrder.customer.email}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Items</p>
                <div className="bg-slate-50 rounded-xl p-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1.5">
                      <span className="text-slate-700">{item.product.name} × {item.quantity}</span>
                      <span className="font-medium">{formatCurrency(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(Number(selectedOrder.total))}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {["pending", "confirmed", "shipped", "completed", "cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className={`px-3 py-1.5 text-xs rounded-lg border capitalize font-medium transition-all ${
                        selectedOrder.status === s
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                          : "border-slate-200 hover:bg-slate-50 hover:border-primary/30 hover:text-primary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full text-center py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
