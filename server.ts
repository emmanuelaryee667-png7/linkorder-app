import express from "express";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

interface Vendor {
  id: number;
  slug: string;
  businessName: string;
  balance: number;
  phone?: string;
  logo?: string; // Base64 logo string
  passwordHash?: string; // secure bcrypt hash
}

interface Product {
  id: number;
  vendorId: number;
  name: string;
  price: number;
  image?: string; // Base64 product image
}

interface Order {
  id: number;
  vendorId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productName: string;
  quantity: number;
  totalPaid: number;
  paystackFeePaid: number; // Stored for compliance but renamed conceptually to Gateway fee
  commissionPaid: number;
  paymentReference: string;
  date: string;
}

interface Database {
  vendors: Vendor[];
  products: Product[];
  orders: Order[];
}

// Default Seed Database (Bcrypt hashed default password is 'admin' or '123456')
// Hash for 'admin': $2a$10$UoWbXit1D5n1A4C4LWehpeOQ5fD9E46gUvG31H6b/v50e0Z25XkGe
const DEFAULT_DB: Database = {
  vendors: [
    { 
      id: 1, 
      slug: 'creative-studio', 
      businessName: 'Creative Design Studio', 
      balance: 1450.00,
      phone: "+233 24 123 4567",
      passwordHash: "$2a$10$UoWbXit1D5n1A4C4LWehpeOQ5fD9E46gUvG31H6b/v50e0Z25XkGe", // default 'admin'
      logo: ""
    }
  ],
  products: [
    { id: 1, vendorId: 1, name: 'Premium Branding Campaign', price: 450, image: "" },
    { id: 2, vendorId: 1, name: 'Custom Social Design Assets', price: 120, image: "" }
  ],
  orders: [
    {
      id: 1,
      vendorId: 1,
      customerName: "Kofi Mensah",
      customerEmail: "kofi.mensah@gmail.com",
      customerPhone: "+233 20 987 6543",
      productName: "Premium Branding Campaign",
      quantity: 1,
      totalPaid: 450,
      paystackFeePaid: 8.78,
      commissionPaid: 13.50,
      paymentReference: "LNK_GLB_928172",
      date: new Date(Date.now() - 3600000 * 2).toLocaleString()
    },
    {
      id: 2,
      vendorId: 1,
      customerName: "Ama Serwaa",
      customerEmail: "ama.serwaa@example.com",
      customerPhone: "+233 24 555 1234",
      productName: "Custom Social Design Assets",
      quantity: 2,
      totalPaid: 240,
      paystackFeePaid: 4.68,
      commissionPaid: 7.20,
      paymentReference: "LNK_GLB_819283",
      date: new Date(Date.now() - 3600000 * 5).toLocaleString()
    }
  ]
};

// Load or initialize DB
function getDatabase(): Database {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(content);
      
      // Upgrade existing database if missing any password hashes
      let modified = false;
      if (db.vendors) {
        db.vendors.forEach((v: any) => {
          if (!v.passwordHash) {
            // Automatically assign default password "admin" to old profiles so they don't break
            v.passwordHash = "$2a$10$UoWbXit1D5n1A4C4LWehpeOQ5fD9E46gUvG31H6b/v50e0Z25XkGe";
            modified = true;
          }
        });
      }
      if (modified) {
        saveDatabase(db);
      }
      return db;
    }
  } catch (error) {
    console.error("Error reading database file, using fallback:", error);
  }
  return DEFAULT_DB;
}

function saveDatabase(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

async function startServer() {
  const app = express();
  
  // Enable global CORS headers for assets, manifest.json, and APIs (essential for PWA scanners like PWABuilder)
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,Authorization");
    next();
  });
  
  // Maximize payload limit to allow smooth Base64 brand logos & product images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API: Get all vendors (for routing/validation helper in frontend)
  app.get("/api/vendors", (req, res) => {
    const db = getDatabase();
    // Return safe data without hashes
    const safeVendors = db.vendors.map(({ passwordHash, ...rest }) => rest);
    res.json(safeVendors);
  });

  // API: Get single vendor detail (For checkout pages - does not require authentication)
  app.get("/api/vendors/:slug", (req, res) => {
    const db = getDatabase();
    const vendor = db.vendors.find(v => v.slug === req.params.slug.toLowerCase());
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    const { passwordHash, ...safeVendor } = vendor;
    const products = db.products.filter(p => p.vendorId === vendor.id);
    const orders = db.orders.filter(o => o.vendorId === vendor.id);
    res.json({ vendor: safeVendor, products, orders });
  });

  // API: Secure Owner Password Authentication / Login Verification
  app.post("/api/vendors/:slug/login", async (req, res) => {
    const { password } = req.body;
    const { slug } = req.params;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const db = getDatabase();
    const vendor = db.vendors.find(v => v.slug === slug.toLowerCase());
    if (!vendor) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Default legacy support in case hashing failed
    const storedHash = vendor.passwordHash || "$2a$10$UoWbXit1D5n1A4C4LWehpeOQ5fD9E46gUvG31H6b/v50e0Z25XkGe";

    try {
      const match = await bcrypt.compare(password, storedHash);
      if (!match) {
        return res.status(401).json({ error: "Invalid secure storefront credentials." });
      }
      
      // Successful login - return a simple mock token session flag
      res.json({ success: true, token: `LNK_SESSION_${vendor.id}_${Date.now()}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal security engine fault." });
    }
  });

  // API: Set/Reset password (used to initialize passwords for legacy storefronts)
  app.post("/api/vendors/:slug/set-password", async (req, res) => {
    const { password } = req.body;
    const { slug } = req.params;
    if (!password || password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long" });
    }

    const db = getDatabase();
    const vendor = db.vendors.find(v => v.slug === slug.toLowerCase());
    if (!vendor) {
      return res.status(404).json({ error: "Storefront not found" });
    }

    const salt = await bcrypt.genSalt(10);
    vendor.passwordHash = await bcrypt.hash(password, salt);
    saveDatabase(db);

    res.json({ success: true, message: "Security credentials updated successfully!" });
  });

  // API: Register a new business vendor
  app.post("/api/register", async (req, res) => {
    const { businessName, slug, password, phone, logo } = req.body;
    if (!businessName || !slug || !password || !phone) {
      return res.status(400).json({ error: "Business name, custom slug link, secure password, and phone number are required." });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (!cleanSlug) {
      return res.status(400).json({ error: "Invalid custom link endpoint" });
    }

    const db = getDatabase();
    const exists = db.vendors.find(v => v.slug === cleanSlug);
    if (exists) {
      return res.status(400).json({ error: "This custom link name is already taken!" });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newVendorId = db.vendors.length > 0 ? Math.max(...db.vendors.map(v => v.id)) + 1 : 1;
      const newVendor: Vendor = {
        id: newVendorId,
        slug: cleanSlug,
        businessName: businessName,
        balance: 0,
        phone: phone,
        logo: logo || "",
        passwordHash: passwordHash
      };

      db.vendors.push(newVendor);

      // Seed a starter service pack product for the new storefront
      const newProdId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
      db.products.push({
        id: newProdId,
        vendorId: newVendorId,
        name: "Standard Booking Service",
        price: 99,
        image: "" // Empty starter image
      });

      saveDatabase(db);
      res.json({ success: true, slug: cleanSlug, vendor: { id: newVendorId, slug: cleanSlug, businessName, phone } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not provision security profiles." });
    }
  });

  // API: Handle Order Submission & Dynamic Split Payment calculations
  app.post("/api/checkout", (req, res) => {
    const { vendorId, customerName, customerEmail, customerPhone, productId, quantity, reference } = req.body;
    
    if (!vendorId || !customerName || !customerEmail || !customerPhone || !productId || !quantity) {
      return res.status(400).json({ success: false, message: "Missing required checkout parameters" });
    }

    const db = getDatabase();
    const vendor = db.vendors.find(v => v.id === parseInt(vendorId));
    const product = db.products.find(p => p.id === parseInt(productId));

    if (!vendor || !product) {
      return res.status(404).json({ success: false, message: "Merchant Store or Selected Offering not found." });
    }

    const totalAmount = product.price * parseInt(quantity);
    
    // Dynamic universal processing fee is 1.95%
    const paymentGatewayFee = totalAmount * 0.0195;
    
    // Platform maintenance split is 3.00%
    const platformCut = totalAmount * 0.03;
    
    // Merchant earnings is remaining balance
    const vendorEarnings = totalAmount - paymentGatewayFee - platformCut;

    vendor.balance += vendorEarnings;

    const newOrder: Order = {
      id: db.orders.length > 0 ? Math.max(...db.orders.map(o => o.id)) + 1 : 1,
      vendorId: vendor.id,
      customerName,
      customerEmail,
      customerPhone,
      productName: product.name,
      quantity: parseInt(quantity),
      totalPaid: totalAmount,
      paystackFeePaid: paymentGatewayFee,
      commissionPaid: platformCut,
      paymentReference: reference || ("LNK_CARD_" + Math.floor(Math.random() * 10000000 + 100000)),
      date: new Date().toLocaleString()
    };

    db.orders.push(newOrder);
    saveDatabase(db);

    res.json({ success: true, message: "Order processed and international split payout cleared successfully!", order: newOrder });
  });

  // API: Add a new product/offering with optional picture
  app.post("/api/products/add", (req, res) => {
    const { vendorId, productName, productPrice, image } = req.body;
    if (!vendorId || !productName || !productPrice) {
      return res.status(400).json({ error: "Missing required offering details." });
    }

    const db = getDatabase();
    const vendor = db.vendors.find(v => v.id === parseInt(vendorId));
    if (!vendor) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    const newProdId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      id: newProdId,
      vendorId: vendor.id,
      name: productName,
      price: parseFloat(productPrice),
      image: image || "" // Save Base64 binary safely
    };

    db.products.push(newProduct);
    saveDatabase(db);

    res.json({ success: true, product: newProduct });
  });

  // API: Update Merchant profile details (Brand Logo, Phone number, Business Name)
  app.post("/api/vendors/:slug/update", (req, res) => {
    const { businessName, phone, logo } = req.body;
    const db = getDatabase();
    const vendor = db.vendors.find(v => v.slug === req.params.slug.toLowerCase());
    
    if (!vendor) {
      return res.status(404).json({ error: "Merchant profile not found" });
    }

    if (businessName) vendor.businessName = businessName;
    if (phone) vendor.phone = phone;
    if (logo !== undefined) vendor.logo = logo; // Can overwrite or clear logo

    saveDatabase(db);
    res.json({ success: true, message: "Profile settings updated successfully!", vendor });
  });

  // API: Simulate vendor balance payout withdrawal
  app.post("/api/vendors/:slug/withdraw", (req, res) => {
    const db = getDatabase();
    const vendor = db.vendors.find(v => v.slug === req.params.slug.toLowerCase());
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const withdrawnAmount = vendor.balance;
    vendor.balance = 0;
    saveDatabase(db);

    res.json({ success: true, message: `Successfully initiated a payout of $${withdrawnAmount.toFixed(2)} to your registered international bank account!` });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=======================================================`);
    console.log(`🚀 LinkOrder Platform Server Live on port ${PORT}`);
    console.log(`=======================================================`);
  });
}

startServer();
