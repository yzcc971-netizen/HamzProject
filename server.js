require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false
});
app.use("/api/", apiLimiter);

const requests = [];
const events = [];

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;
  const supplied = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!expected || expected.startsWith("replace-") || !safeEqual(supplied, expected)) {
    return res.status(401).json({ error: "Admin tidak terautentikasi." });
  }
  next();
}

app.get("/api/health", (req, res) => {
  res.json({
    app: "HamzProject.ID",
    status: "online",
    mode: process.env.OTP_PROVIDER === "demo" ? "demo" : "provider-configured",
    providerConnected: false,
    note: "Status provider harus diverifikasi melalui adapter resmi."
  });
});

app.get("/api/services", (req, res) => {
  res.json({
    mode: "demo",
    services: [
      { id: "owned-app-test", name: "Aplikasi milik sendiri", description: "Pengujian alur OTP untuk aplikasi yang Anda kelola." }
    ],
    message: "Daftar ini hanya contoh. Tidak ada nomor virtual atau SMS sungguhan yang disediakan."
  });
});

// Safe scaffold: no third-party account-verification rentals or OTP interception.
// Implement a provider adapter only for a service you own/manage and whose terms allow it.
app.post("/api/otp/request", (req, res) => {
  const { phone, purpose } = req.body || {};
  if (typeof phone !== "string" || !/^\+[1-9]\d{7,14}$/.test(phone)) {
    return res.status(400).json({ error: "Gunakan nomor E.164, contoh +6281234567890." });
  }
  if (purpose !== "own-app-login" && purpose !== "own-app-verification") {
    return res.status(400).json({ error: "OTP hanya didukung untuk aplikasi yang Anda miliki atau kelola." });
  }

  const id = crypto.randomUUID();
  requests.unshift({
    id,
    phoneMasked: phone.slice(0, 4) + "••••" + phone.slice(-3),
    purpose,
    status: "demo-not-sent",
    createdAt: new Date().toISOString()
  });
  return res.status(202).json({
    id,
    status: "demo-not-sent",
    message: "Mode demo: belum ada SMS dikirim. Hubungkan provider resmi untuk mengaktifkan pengiriman."
  });
});

// Provider webhook: verify a shared secret and store only delivery metadata.
// Never log or persist OTP codes.
app.post("/api/webhooks/provider", (req, res) => {
  const secret = req.headers["x-webhook-secret"];
  const expected = process.env.WEBHOOK_SECRET;
  if (!expected || expected.startsWith("replace-") || !safeEqual(String(secret || ""), expected)) {
    return res.status(401).json({ error: "Webhook signature/secret tidak valid." });
  }
  const { event, reference, status } = req.body || {};
  if (typeof event !== "string" || typeof reference !== "string" || typeof status !== "string") {
    return res.status(400).json({ error: "Payload webhook tidak lengkap." });
  }
  events.unshift({
    event: event.slice(0, 80),
    reference: reference.slice(0, 120),
    status: status.slice(0, 40),
    receivedAt: new Date().toISOString()
  });
  res.json({ received: true });
});

app.get("/api/admin/overview", requireAdmin, (req, res) => {
  res.json({
    requests: requests.slice(0, 50),
    events: events.slice(0, 50),
    providerMode: process.env.OTP_PROVIDER || "demo",
    providerReady: false
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`HamzProject.ID berjalan di http://localhost:${PORT}`);
});