# HamzProject.ID — OTP Web Starter

Starter website responsif + backend Node.js untuk alur OTP yang sah pada aplikasi milik sendiri/yang dikelola.

## Yang sudah tersedia
- Dashboard web responsif.
- `GET /api/health`
- `GET /api/services`
- `POST /api/otp/request` (mode demo, tidak mengirim SMS)
- `POST /api/webhooks/provider` (memvalidasi shared secret dan menyimpan metadata status, bukan isi OTP)
- `GET /api/admin/overview` (Bearer token admin)
- Rate limit dan Helmet security headers.

## Menjalankan di komputer/hosting Node.js
1. Instal Node.js versi LTS.
2. Ekstrak ZIP ini.
3. Jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`.
5. Ganti `ADMIN_API_KEY` dan `WEBHOOK_SECRET` dengan nilai acak yang panjang.
6. Jalankan `npm start`.
7. Buka `http://localhost:3000`.

## Menjalankan dari Android
Cara termudah adalah unggah folder proyek ke hosting yang mendukung Node.js melalui browser Android. Alternatif pengujian lokal dapat memakai Termux dari sumber resminya, lalu memasang Node.js dan menjalankan perintah di atas. Jangan menaruh secret di HTML atau membagikan file `.env`.

## Mengaktifkan provider
Mode awal sengaja `demo`. Untuk mengaktifkan pengiriman SMS:
1. Pilih penyedia SMS/OTP resmi yang mengizinkan penggunaan untuk aplikasi milik Anda.
2. Baca dokumentasi API dan ketentuan layanannya.
3. Buat adapter server-side khusus mengikuti dokumentasi provider tersebut.
4. Simpan kredensial di environment variable hosting.
5. Konfigurasikan URL webhook HTTPS dan shared secret sesuai dokumentasi provider.
6. Uji di sandbox/test mode terlebih dahulu.

Belum ada provider atau API key yang ditanamkan. Jangan menganggap SMS sungguhan sudah terkirim. Jangan gunakan untuk mengambil OTP akun pihak lain, menyadap pesan, atau menghindari verifikasi layanan lain.

## Catatan produksi
Untuk penggunaan nyata, tambahkan database terkelola, autentikasi admin yang kuat, HTTPS, audit log, kebijakan retensi, batas biaya, dan verifikasi tanda tangan webhook sesuai spesifikasi provider. Contoh ini menyimpan data sementara di memori sehingga data hilang saat server restart.
