"use client";

import { useEffect, useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    address: "Abidjan, Côte d'Ivoire",
    phone: "+225 00 000 000",
    email: "contact@lalumieresoit.com",
  });

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then((data) => {
      if (data.contact_address) setContactInfo(c => ({ ...c, address: data.contact_address }));
      if (data.contact_phone) setContactInfo(c => ({ ...c, phone: data.contact_phone }));
      if (data.contact_email) setContactInfo(c => ({ ...c, email: data.contact_email }));
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 text-center mb-12">
        Contactez-nous
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Nous contacter
          </h2>
          <p className="text-slate-600 mb-8">
            Une question ou besoin d&apos;aide ? Nous sommes là pour vous. Envoyez-nous un message
            ou contactez-nous via les informations ci-dessous.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">location_on</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Adresse</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {contactInfo.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">phone</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Téléphone</h3>
                <p className="text-sm text-slate-600 mt-1">{contactInfo.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">mail</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Email</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {contactInfo.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          {sent ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-5xl text-green-500 mb-3 block">check_circle</span>
              <h3 className="text-lg font-bold text-green-600">
                Message Sent!
              </h3>
              <p className="text-slate-500 mt-2">
                We&apos;ll get back to you shortly.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setForm({ name: "", email: "", subject: "", message: "" });
                }}
                className="mt-4 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Subject *
                </label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
              >
                Envoyer le message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
