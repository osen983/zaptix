/**
 * ============================================================
 * ZAPTIX — products.js
 * ============================================================
 * PURPOSE: Central data store for all products and store settings.
 *          Both index.html (storefront) and admin.html read from here.
 *          All data is saved in the browser's localStorage so changes
 *          survive page refreshes.
 *
 * HOW IT WORKS:
 *  1. Default product data is defined below (INITIAL_PRODUCTS).
 *  2. On first visit, this data is written to localStorage.
 *  3. The admin panel writes changes back to localStorage.
 *  4. The storefront always reads from localStorage.
 *
 * HOW TO ADD A PRODUCT (manually in this file):
 *  Copy an object from INITIAL_PRODUCTS, give it a new unique id,
 *  change name/price/etc., then clear localStorage to reset.
 * ============================================================
 */

/* ── DEFAULT PRODUCTS ───────────────────────────────────────
   These are the factory defaults.
   Once the store runs once, data lives in localStorage.
   To reset to these defaults: open browser console and type:
     localStorage.removeItem('zaptix_products'); location.reload();
──────────────────────────────────────────────────────────── */
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "AirPods Pro 2 — High Copy Premium",
    nameShort: "AirPods Pro 2",
    category: "modern-tech",
    price: 1299,
    oldPrice: 1799,
    stock: 15,
    emoji: "🎧",
    image: "",                    // Leave empty to use emoji, or paste a URL/base64
    badge: "الأكثر مبيعاً",
    badgeColor: "blue",
    featured: true,
    bestseller: true,
    isNew: false,
    desc: "نويز كانسيلينج نشط حقيقي، صوت HiFi نقي، شحن لاسلكي، مقاومة ماء IPX4. متوافقة مع iOS وAndroid.",
    features: [
      "نويز كانسيلينج نشط (ANC)",
      "صوت HiFi — 9.9mm driver",
      "شحن لاسلكي (Wireless Charging)",
      "بطارية 30 ساعة مع الكيس",
      "مقاومة ماء IPX4",
      "بلوتوث 5.3"
    ],
    rating: 4.9,
    reviews: 1247,
    enabled: true
  },
  {
    id: 2,
    name: "باور بانك Turbo 20000mAh — شحن 65W",
    nameShort: "Turbo Power Bank 20K",
    category: "modern-tech",
    price: 799,
    oldPrice: 1099,
    stock: 30,
    emoji: "🔋",
    image: "",
    badge: "الأكثر طلباً",
    badgeColor: "orange",
    featured: true,
    bestseller: true,
    isNew: false,
    desc: "شحن GaN 65W يشحن اللاب توب والموبايل في نفس الوقت. 20,000 mAh تكفيك أسبوع كامل.",
    features: [
      "سعة 20,000mAh",
      "شحن سريع 65W GaN",
      "شحن 3 أجهزة في نفس الوقت",
      "USB-C + USB-A",
      "شاشة LED للبطارية",
      "وزن خفيف 380 جرام"
    ],
    rating: 4.8,
    reviews: 892,
    enabled: true
  },
  {
    id: 3,
    name: "شاحن GaN 100W — 4 منافذ",
    nameShort: "GaN Charger 100W",
    category: "modern-tech",
    price: 549,
    oldPrice: 749,
    stock: 25,
    emoji: "⚡",
    image: "",
    badge: "جديد",
    badgeColor: "green",
    featured: true,
    bestseller: false,
    isNew: true,
    desc: "شاحن GaN الذكي بقوة 100W و4 منافذ. اشحن كل أجهزتك في نفس الوقت بأمان تام.",
    features: [
      "GaN Technology — 100W",
      "4 منافذ (2 USB-C + 2 USB-A)",
      "PPS + PD 3.0 + QC 4.0",
      "Universal Voltage 100-240V",
      "حماية من الحرارة الزائدة"
    ],
    rating: 4.8,
    reviews: 428,
    enabled: true
  },
  {
    id: 4,
    name: "كابل Titan — USB-C إلى USB-C — 240W",
    nameShort: "Titan Cable 240W",
    category: "modern-tech",
    price: 199,
    oldPrice: 279,
    stock: 50,
    emoji: "🔌",
    image: "",
    badge: "",
    badgeColor: "",
    featured: false,
    bestseller: true,
    isNew: false,
    desc: "240W شحن سريع. 40Gbps نقل بيانات. Nylon مضفر يتحمل 30,000 ثنية.",
    features: [
      "240W Super Fast Charge",
      "40 Gbps Data Transfer",
      "Nylon Braided — 30,000 بنية",
      "طول 1.5 متر",
      "USB 4.0 Compatible"
    ],
    rating: 4.9,
    reviews: 1891,
    enabled: true
  },
  {
    id: 5,
    name: "AirPods Retro Arcade Edition",
    nameShort: "Retro Arcade AirPods",
    category: "old-tech",
    price: 899,
    oldPrice: 1199,
    stock: 8,
    emoji: "🎮",
    image: "",
    badge: "RARE DROP",
    badgeColor: "purple",
    featured: true,
    bestseller: false,
    isNew: true,
    desc: "نسخة حصرية ريترو أركيد. RGB Glow Effect. Limited 100 قطعة فقط.",
    features: [
      "تصميم Retro Arcade حصري",
      "نويز كانسيلينج نشط",
      "RGB Glow Effect على الكيس",
      "بطارية 28 ساعة",
      "Limited Edition — 100 قطعة"
    ],
    rating: 5.0,
    reviews: 47,
    enabled: true,
    limitedEdition: true
  },
  {
    id: 6,
    name: "الباور بانك الريترو — CRT Edition",
    nameShort: "CRT Power Bank",
    category: "old-tech",
    price: 699,
    oldPrice: 999,
    stock: 12,
    emoji: "📺",
    image: "",
    badge: "LIMITED",
    badgeColor: "neon",
    featured: true,
    bestseller: false,
    isNew: true,
    desc: "تصميم مستوحى من شاشات CRT الكلاسيكية. شاشة ريترو مضيئة. RGB Breathing Effect.",
    features: [
      "تصميم CRT Monitor كلاسيكي",
      "شاشة Retro LED خاصة",
      "سعة 15,000mAh",
      "شحن سريع 45W",
      "RGB Breathing Effect"
    ],
    rating: 4.9,
    reviews: 89,
    enabled: true
  },
  {
    id: 7,
    name: "كفر iPhone — Pixel Grid Series",
    nameShort: "Pixel Grid iPhone Case",
    category: "old-tech",
    price: 249,
    oldPrice: 349,
    stock: 40,
    emoji: "📱",
    image: "",
    badge: "تريند",
    badgeColor: "orange",
    featured: false,
    bestseller: true,
    isNew: false,
    desc: "كفر Pixel Grid ريترو. Military Grade. متاح لـ iPhone 13/14/15.",
    features: [
      "تصميم Pixel Grid حصري",
      "Military Grade Protection",
      "iPhone 13/14/15/15 Pro",
      "TPU + PC مزدوجة"
    ],
    rating: 4.7,
    reviews: 312,
    enabled: true
  },
  {
    id: 8,
    name: "ساعة ذكية Quantum Pro",
    nameShort: "Quantum Smart Watch",
    category: "modern-tech",
    price: 1099,
    oldPrice: 1499,
    stock: 20,
    emoji: "⌚",
    image: "",
    badge: "جديد",
    badgeColor: "blue",
    featured: true,
    bestseller: false,
    isNew: true,
    desc: "AMOLED 1.96 بوصة. GPS مستقل. مقاومة ماء 5ATM. بطارية 14 يوم.",
    features: [
      "شاشة AMOLED 1.96 بوصة",
      "GPS مستقل",
      "قياس ضربات القلب والأكسجين",
      "مقاومة ماء 5ATM",
      "بطارية 14 يوم",
      "100+ وضع رياضي"
    ],
    rating: 4.8,
    reviews: 156,
    enabled: true
  }
];

/* ── DEFAULT STORE SETTINGS ──────────────────────────────── */
const INITIAL_SETTINGS = {
  storeName: "ZAPTIX",
  storeTagline: "المستقبل في إيدك",
  whatsapp: "201000000000",
  whatsappMsg: "مرحباً، أريد الاستفسار عن منتج من ZAPTIX",
  email: "support@zaptix.eg",
  phone: "+20 100 000 0000",
  facebook: "https://facebook.com/zaptix",
  instagram: "https://instagram.com/zaptix",
  tiktok: "https://tiktok.com/@zaptix",
  primaryColor: "#0066FF",
  accentColor: "#00CFFF",
  freeShippingMin: 500,
  shippingCost: 60,
  currency: "ج.م",
  heroHeadline: "المستقبل في إيدك",
  heroSub: "تكنولوجيا بريميوم. أسعار ذكية. توصيل سريع لكل مصر.",
  heroCTA: "تسوق الآن",
  offerBadge: "عرض محدود الوقت",
  offerTitle: "AirPods Pro 2 بسعر خيالي",
  offerSub: "نسخة Premium High Copy — جودة صوت استثنائية بثمن ذكي.",
  maintenanceMode: false
};

/* ── DATA ACCESS LAYER ───────────────────────────────────── */

/**
 * getProducts()
 * Returns current product list from localStorage.
 * Falls back to INITIAL_PRODUCTS on first run.
 */
function getProducts() {
  try {
    const raw = localStorage.getItem('zaptix_products');
    if (raw) return JSON.parse(raw);
  } catch(e) { /* ignore parse errors */ }
  // First run — seed localStorage
  saveProducts(INITIAL_PRODUCTS);
  return INITIAL_PRODUCTS;
}

/**
 * saveProducts(products)
 * Writes the product array to localStorage.
 * Called by the admin panel every time a product changes.
 */
function saveProducts(products) {
  localStorage.setItem('zaptix_products', JSON.stringify(products));
}

/**
 * getSettings()
 * Returns current store settings from localStorage.
 */
function getSettings() {
  try {
    const raw = localStorage.getItem('zaptix_settings');
    if (raw) {
      // Merge with defaults so new keys always exist
      return Object.assign({}, INITIAL_SETTINGS, JSON.parse(raw));
    }
  } catch(e) {}
  saveSettings(INITIAL_SETTINGS);
  return INITIAL_SETTINGS;
}

/**
 * saveSettings(settings)
 * Writes store settings to localStorage.
 */
function saveSettings(settings) {
  localStorage.setItem('zaptix_settings', JSON.stringify(settings));
}

/**
 * getProductById(id)
 * Returns a single product by its numeric id.
 */
function getProductById(id) {
  return getProducts().find(p => p.id === parseInt(id));
}

/**
 * nextProductId()
 * Returns the next available product id (max existing + 1).
 */
function nextProductId() {
  const products = getProducts();
  if (!products.length) return 1;
  return Math.max(...products.map(p => p.id)) + 1;
}

/**
 * addProduct(product)
 * Adds a new product. Assigns an id automatically.
 */
function addProduct(product) {
  const products = getProducts();
  product.id = nextProductId();
  products.push(product);
  saveProducts(products);
  return product;
}

/**
 * updateProduct(id, changes)
 * Updates specific fields of a product by id.
 */
function updateProduct(id, changes) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === parseInt(id));
  if (idx === -1) return false;
  products[idx] = Object.assign(products[idx], changes);
  saveProducts(products);
  // Track last edited for admin stats
  localStorage.setItem('zaptix_last_edited', JSON.stringify({
    id: products[idx].id,
    name: products[idx].nameShort || products[idx].name,
    time: new Date().toISOString()
  }));
  return true;
}

/**
 * deleteProduct(id)
 * Removes a product by id.
 */
function deleteProduct(id) {
  const products = getProducts().filter(p => p.id !== parseInt(id));
  saveProducts(products);
}

/**
 * exportBackup()
 * Returns a JSON string of all store data for download.
 */
function exportBackup() {
  const backup = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    products: getProducts(),
    settings: getSettings()
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * importBackup(jsonString)
 * Restores products and settings from a JSON backup string.
 * Returns { ok: true } or { ok: false, error: '...' }
 */
function importBackup(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.products || !Array.isArray(data.products)) {
      return { ok: false, error: 'الملف لا يحتوي على قائمة منتجات صحيحة.' };
    }
    saveProducts(data.products);
    if (data.settings) saveSettings(data.settings);
    return { ok: true };
  } catch(e) {
    return { ok: false, error: 'فشل قراءة الملف: ' + e.message };
  }
}

/**
 * getAdminStats()
 * Returns statistics for the admin dashboard.
 */
function getAdminStats() {
  const products = getProducts();
  const enabled = products.filter(p => p.enabled !== false);
  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  const lastEdited = JSON.parse(localStorage.getItem('zaptix_last_edited') || 'null');
  return {
    total: products.length,
    enabled: enabled.length,
    disabled: products.length - enabled.length,
    lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalInventoryValue: totalValue,
    lastEdited
  };
}
