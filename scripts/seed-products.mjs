#!/usr/bin/env node

import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { categories, products, adminSettings } from "../drizzle/schema.js";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Parse DATABASE_URL
const url = new URL(dbUrl);
const connection = await mysql.createConnection({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: url.hostname.includes("tidb") || url.hostname.includes("amazonaws") ? {} : undefined,
});

const db = drizzle(connection);

// Kategoriler
const categoryNames = [
  "Çorbalar",
  "Döner",
  "Kebaplar",
  "Pideler",
  "Et Yemekleri",
  "Specialler",
  "Salatalar",
  "İçecekler",
  "Tatlılar",
];

// Ürün verilerini yükle
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const productsDataPath = path.join(__dirname, "products-data.json");
const productsData = JSON.parse(fs.readFileSync(productsDataPath, "utf-8"));

// Image mapping'i yükle
const imageMappingPath = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "image-mapping.json"
);
const imageMapping = JSON.parse(fs.readFileSync(imageMappingPath, "utf-8"));

console.log("Kategoriler ekleniyor...");
const categoryMap = {};
for (let i = 0; i < categoryNames.length; i++) {
  const result = await db.insert(categories).values({
    name: categoryNames[i],
    order: i,
  });
  // Get the inserted category ID
  const inserted = await db
    .select()
    .from(categories)
    .where(eq(categories.name, categoryNames[i]))
    .limit(1);
  if (inserted.length > 0) {
    categoryMap[categoryNames[i]] = inserted[0].id;
  }
}

console.log("Kategoriler başarıyla eklendi!");
console.log("Category Map:", categoryMap);

console.log("\nÜrünler ekleniyor...");
let productCount = 0;
for (const [categoryName, productList] of Object.entries(productsData)) {
  const categoryId = categoryMap[categoryName];
  if (!categoryId) {
    console.warn(`Kategori bulunamadı: ${categoryName}`);
    continue;
  }

  for (const product of productList) {
    // ASCII dosya adını oluştur
    let asciiImageName = product.image;
    asciiImageName = asciiImageName
      .replace(/ç/g, "c")
      .replace(/Ç/g, "C")
      .replace(/ğ/g, "g")
      .replace(/Ğ/g, "G")
      .replace(/ı/g, "i")
      .replace(/İ/g, "I")
      .replace(/ö/g, "o")
      .replace(/Ö/g, "O")
      .replace(/ş/g, "s")
      .replace(/Ş/g, "S")
      .replace(/ü/g, "u")
      .replace(/Ü/g, "U");

    const imageUrl = imageMapping[asciiImageName] || "";

    await db.insert(products).values({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: categoryId,
      imageUrl: imageUrl,
    });

    productCount++;
  }
}

console.log(`${productCount} ürün başarıyla eklendi!`);

// Admin ayarlarını başlat
console.log("\nAdmin ayarları oluşturuluyor...");
const existingSettings = await db.select().from(adminSettings).limit(1);

if (existingSettings.length === 0) {
  await db.insert(adminSettings).values({
    adminPassword: "admin123", // TODO: Bu şifreyi değiştir
    logoUrl: imageMapping["logo.png"] || "/manus-storage/logo.png",
    restaurantName: "YILDIZHANPOS",
    restaurantTagline: "İstanbul Şehrinin En İyisi",
  });
  console.log("Admin ayarları başarıyla oluşturuldu!");
} else {
  console.log("Admin ayarları zaten mevcut, güncelleniyor...");
  await db
    .update(adminSettings)
    .set({
      logoUrl: imageMapping["logo.png"] || "/manus-storage/logo.png",
    })
    .where(eq(adminSettings.id, existingSettings[0].id));
}

console.log("\nVeritabanı hazırlanması tamamlandı!");
console.log(`- ${categoryNames.length} kategori`);
console.log(`- ${productCount} ürün`);
console.log("- Admin ayarları");

await connection.end();
