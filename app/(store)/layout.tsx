import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import CartDrawer from "@/components/cart-drawer/CartDrawer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
