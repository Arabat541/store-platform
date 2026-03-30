const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER;

interface OrderNotification {
  orderNumber: string;
  customerName: string;
  total: number;
  itemCount: number;
  paymentMethod?: string;
}

function formatXOF(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function sendOrderWhatsApp(order: OrderNotification): Promise<boolean> {
  if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN || !ADMIN_WHATSAPP_NUMBER) {
    console.log("[WhatsApp] Configuration manquante, notification ignorée");
    return false;
  }

  const message =
    `🛒 *Nouvelle commande !*\n\n` +
    `📋 *N°:* ${order.orderNumber}\n` +
    `👤 *Client:* ${order.customerName}\n` +
    `📦 *Articles:* ${order.itemCount}\n` +
    `💰 *Total:* ${formatXOF(order.total)}\n` +
    `💳 *Paiement:* ${order.paymentMethod || "Non spécifié"}\n\n` +
    `Connectez-vous au panneau admin pour gérer cette commande.`;

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: ADMIN_WHATSAPP_NUMBER,
        type: "text",
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[WhatsApp] Erreur envoi:", err);
      return false;
    }

    console.log("[WhatsApp] Notification envoyée pour", order.orderNumber);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Erreur:", error);
    return false;
  }
}
