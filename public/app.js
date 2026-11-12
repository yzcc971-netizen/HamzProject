const stateEl = document.getElementById("serverState");
const noteEl = document.getElementById("serverNote");
const form = document.getElementById("otpForm");
const result = document.getElementById("formResult");

async function loadHealth() {
  try {
    const r = await fetch("/api/health");
    const data = await r.json();
    stateEl.textContent = data.status === "online" ? "Backend aktif" : "Backend tidak aktif";
    noteEl.textContent = data.note;
  } catch {
    stateEl.textContent = "Backend belum terjangkau";
    noteEl.textContent = "Jalankan server Node.js terlebih dahulu.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  result.textContent = "Memproses permintaan demo...";
  const body = {
    phone: document.getElementById("phone").value.trim(),
    purpose: document.getElementById("purpose").value
  };
  try {
    const r = await fetch("/api/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    result.textContent = data.message || data.error || "Permintaan selesai.";
  } catch {
    result.textContent = "Tidak dapat menghubungi backend. Pastikan server berjalan.";
  }
});
loadHealth();