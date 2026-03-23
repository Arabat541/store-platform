import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getSettings() {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: ["contact_email", "contact_phone", "contact_whatsapp", "contact_address"] } },
    });
    const settings: Record<string, string> = {};
    for (const r of rows) settings[r.key] = r.value;
    return settings;
  } catch {
    return {};
  }
}

export default async function Footer() {
  const settings = await getSettings();

  const email = settings.contact_email || "contact@lalumieresoit.com";
  const phone = settings.contact_phone || "+225 00 000 000";  const whatsapp = settings.contact_whatsapp || "+225 00 000 000";  const address = settings.contact_address || "Abidjan, Côte d'Ivoire";

  return (
    <footer className="bg-white border-t border-primary/10 mt-12 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <span className="material-symbols-outlined block">devices</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-primary">La Lumière Soit</h2>
            </div>
            <p className="text-slate-500 text-sm max-w-xs mb-6">
              Leader de l'électronique avec des produits premium et un support expert. Découvrez la technologie comme jamais auparavant.
            </p>
            <div className="flex gap-4">
              <span className="text-slate-400 hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">public</span>
              </span>
              <span className="text-slate-400 hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">alternate_email</span>
              </span>
              <span className="text-slate-400 hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">chat</span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Boutique</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link className="hover:text-primary" href="/products">En vedette</Link></li>
              <li><Link className="hover:text-primary" href="/products">Catégories</Link></li>
              <li><Link className="hover:text-primary" href="/products">Promotions</Link></li>
              <li><Link className="hover:text-primary" href="/products">Nouveautés</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Assistance</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link className="hover:text-primary" href="/contact">Centre d'aide</Link></li>
              <li><Link className="hover:text-primary" href="/contact">Suivre commande</Link></li>
              <li><Link className="hover:text-primary" href="/contact">Retours</Link></li>
              <li><Link className="hover:text-primary" href="/contact">Nous contacter</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Entreprise</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link className="hover:text-primary" href="#">À propos</Link></li>
              <li><Link className="hover:text-primary" href="#">Carrières</Link></li>
              <li><Link className="hover:text-primary" href="#">Développement durable</Link></li>
              <li><Link className="hover:text-primary" href="#">Blog</Link></li>
            </ul>
          </div>

          <div className="space-y-4 col-span-2 lg:col-span-1">
            <h4 className="font-bold text-slate-900">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">mail</span>
                {email}
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">call</span>
                {phone}
              </li>
              <li className="flex items-center gap-2">
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-600">
                  <span className="material-symbols-outlined text-base">chat</span>
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">location_on</span>
                {address}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} La Lumière Soit. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link className="text-xs text-slate-400 hover:text-primary" href="#">Politique de confidentialité</Link>
            <Link className="text-xs text-slate-400 hover:text-primary" href="#">Conditions d'utilisation</Link>
            <Link className="text-xs text-slate-400 hover:text-primary" href="#">Paramètres cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
