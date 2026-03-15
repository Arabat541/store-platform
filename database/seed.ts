import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@techstore.com" },
    update: {},
    create: {
      email: "admin@techstore.com",
      password: adminPassword,
      name: "Admin",
      role: "admin",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Create categories
  const categories = await Promise.all(
    [
      { name: "Smartphones", slug: "smartphones", description: "Latest smartphones and mobile phones" },
      { name: "Computers", slug: "computers", description: "Laptops, desktops, and workstations" },
      { name: "Accessories", slug: "accessories", description: "Phone cases, chargers, cables, and more" },
      { name: "Electronics", slug: "electronics", description: "Tablets, headphones, speakers, and other electronic devices" },
    ].map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );
  console.log(`✅ ${categories.length} categories created`);

  // Create suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "TechDistrib Global",
      email: "orders@techdistrib.com",
      phone: "+1-555-0100",
      city: "Shenzhen",
      country: "China",
      contactPerson: "Li Wei",
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "AccessoryWorld",
      email: "supply@accessoryworld.com",
      phone: "+1-555-0200",
      city: "Dubai",
      country: "UAE",
      contactPerson: "Ahmed Hassan",
    },
  });
  console.log(`✅ 2 suppliers created`);

  // Create products
  const smartphonesCategory = categories.find((c) => c.slug === "smartphones")!;
  const computersCategory = categories.find((c) => c.slug === "computers")!;
  const accessoriesCategory = categories.find((c) => c.slug === "accessories")!;
  const electronicsCategory = categories.find((c) => c.slug === "electronics")!;

  const products = [
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description: "Apple iPhone 15 Pro Max with A17 Pro chip, 48MP camera system, and titanium design. Available in Natural Titanium.",
      price: 1199,
      comparePrice: 1299,
      sku: "IP15PM-256",
      stock: 25,
      brand: "Apple",
      featured: true,
      categoryId: smartphonesCategory.id,
      supplierId: supplier1.id,
      images: JSON.stringify(["/icons/placeholder.svg"]),
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description: "Samsung Galaxy S24 Ultra with Galaxy AI, 200MP camera, built-in S Pen, and titanium frame.",
      price: 1299,
      comparePrice: 1419,
      sku: "SGS24U-256",
      stock: 18,
      brand: "Samsung",
      featured: true,
      categoryId: smartphonesCategory.id,
      supplierId: supplier1.id,
      images: JSON.stringify(["/icons/placeholder.svg"]),
    },
    {
      name: 'MacBook Pro 16" M3 Pro',
      slug: "macbook-pro-16-m3-pro",
      description: "Apple MacBook Pro 16-inch with M3 Pro chip, 18GB RAM, 512GB SSD. The ultimate pro laptop.",
      price: 2499,
      sku: "MBP16-M3P",
      stock: 10,
      brand: "Apple",
      featured: true,
      categoryId: computersCategory.id,
      supplierId: supplier1.id,
      images: JSON.stringify(["/icons/placeholder.svg"]),
    },
    {
      name: "Dell XPS 15",
      slug: "dell-xps-15",
      description: "Dell XPS 15 with 13th Gen Intel Core i7, 16GB RAM, 512GB SSD, OLED display.",
      price: 1599,
      comparePrice: 1799,
      sku: "DXPS15-I7",
      stock: 12,
      brand: "Dell",
      featured: true,
      categoryId: computersCategory.id,
      supplierId: supplier1.id,
      images: JSON.stringify(["/icons/placeholder.svg"]),
    },
    {
      name: "AirPods Pro 2",
      slug: "airpods-pro-2",
      description: "Apple AirPods Pro 2nd generation with USB-C, Adaptive Audio, and MagSafe charging case.",
      price: 249,
      sku: "APP2-USBC",
      stock: 50,
      brand: "Apple",
      featured: true,
      categoryId: accessoriesCategory.id,
      supplierId: supplier2.id,
      images: JSON.stringify(["/icons/placeholder.svg"]),
    },
    {
      name: "Samsung 65W Fast Charger",
      slug: "samsung-65w-fast-charger",
      description: "Samsung 65W Power Adapter Trio with USB-C fast charging for phones and laptops.",
      price: 49,
      comparePrice: 59,
      sku: "SFC-65W",
      stock: 100,
      brand: "Samsung",
      categoryId: accessoriesCategory.id,
      supplierId: supplier2.id,
      images: JSON.stringify(["/icons/placeholder.svg"]),
    },
    {
      name: "iPad Air M2",
      slug: "ipad-air-m2",
      description: "Apple iPad Air with M2 chip, 11-inch Liquid Retina display, and Apple Pencil Pro support.",
      price: 599,
      sku: "IPA-M2-11",
      stock: 20,
      brand: "Apple",
      featured: true,
      categoryId: electronicsCategory.id,
      supplierId: supplier1.id,
      images: JSON.stringify(["/icons/placeholder.svg"]),
    },
    {
      name: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      description: "Sony WH-1000XM5 wireless noise cancelling headphones with industry-leading noise cancellation.",
      price: 349,
      comparePrice: 399,
      sku: "SWXM5-BLK",
      stock: 30,
      brand: "Sony",
      featured: true,
      categoryId: electronicsCategory.id,
      supplierId: supplier2.id,
      images: JSON.stringify(["/icons/placeholder.svg"]),
    },
    {
      name: "Google Pixel 8 Pro",
      slug: "google-pixel-8-pro",
      description: "Google Pixel 8 Pro with Tensor G3 chip, 50MP camera with AI features, and 7 years of updates.",
      price: 999,
      sku: "GP8P-128",
      stock: 15,
      brand: "Google",
      categoryId: smartphonesCategory.id,
      supplierId: supplier1.id,
      images: JSON.stringify(["/icons/placeholder.svg"]),
    },
    {
      name: "USB-C Hub 7-in-1",
      slug: "usb-c-hub-7-in-1",
      description: "Universal USB-C hub with HDMI 4K, USB 3.0 ports, SD card reader, and 100W PD charging.",
      price: 39,
      comparePrice: 49,
      sku: "USBC-HUB7",
      stock: 75,
      brand: "Anker",
      categoryId: accessoriesCategory.id,
      supplierId: supplier2.id,
      images: JSON.stringify(["/icons/placeholder.svg"]),
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        images: JSON.parse(product.images as string),
      },
    });

    // Create initial stock movement
    await prisma.stockMovement.create({
      data: {
        productId: created.id,
        type: "purchase",
        quantity: product.stock,
        reference: "Initial stock",
      },
    });
  }
  console.log(`✅ ${products.length} products created`);

  // Create sample customers
  const customers = await Promise.all(
    [
      { firstName: "John", lastName: "Doe", email: "john@example.com", phone: "+243-999-111-111", city: "Lubumbashi" },
      { firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "+243-999-222-222", city: "Kinshasa" },
      { firstName: "Pierre", lastName: "Mukendi", email: "pierre@example.com", phone: "+243-999-333-333", city: "Lubumbashi" },
    ].map((c) =>
      prisma.customer.upsert({
        where: { email: c.email },
        update: {},
        create: c,
      })
    )
  );
  console.log(`✅ ${customers.length} customers created`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
