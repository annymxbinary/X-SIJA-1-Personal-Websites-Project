/* ===== Foto latar header (dipilih acak setiap halaman dibuka) =====
   Simpan foto Minecraft di folder "img" lalu tulis namanya di sini.
   Jika foto tidak ditemukan, latar otomatis memakai gradasi hijau-biru. */
const fotoMinecraft = [
  "img/minecraft-1.jpg",
  "img/minecraft-2.jpg",
  "img/minecraft-3.jpg",
  "img/minecraft-4.jpg",
  "img/minecraft-5.jpg",
];

const pilihan = fotoMinecraft[Math.floor(Math.random() * fotoMinecraft.length)];
const gambar = new Image();
gambar.onload = () => {
  const bg = document.getElementById("heroBg");
  bg.style.setProperty("--hero-img", `url("${pilihan}")`);
  bg.classList.add("ada-foto");
};
gambar.src = pilihan;

const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Efek ketik pada subjudul ===== */
const subjudul = document.getElementById("subjudul");
if (subjudul && !kurangiGerak) {
  const teks = subjudul.textContent.trim();
  subjudul.setAttribute("aria-label", teks);
  subjudul.innerHTML = '<span class="sudah" aria-hidden="true"></span><span class="belum" aria-hidden="true"></span>';
  const sudah = subjudul.querySelector(".sudah");
  const belum = subjudul.querySelector(".belum");
  belum.textContent = teks;

  let n = 0;
  setTimeout(() => {
    const ketik = setInterval(() => {
      n++;
      sudah.textContent = teks.slice(0, n);
      belum.textContent = teks.slice(n);
      if (n >= teks.length) {
        clearInterval(ketik);
        setTimeout(() => subjudul.classList.add("selesai"), 1200);
      }
    }, 35);
  }, 600);
}

/* ===== Tombol yang linknya belum diisi dinonaktifkan otomatis ===== */
document.querySelectorAll(".btn").forEach((tombol) => {
  const href = (tombol.getAttribute("href") || "").trim();
  if (href === "" || href === "#") {
    tombol.removeAttribute("href");
    tombol.removeAttribute("target");
    tombol.classList.add("nonaktif");
    tombol.setAttribute("aria-disabled", "true");
    tombol.textContent = "Belum tersedia";
  }
});

/* ===== Favorit, pencarian nama & nomor absen ===== */
const inputCari = document.getElementById("cari");
const labelJumlah = document.getElementById("jumlah");
const pesanKosong = document.getElementById("kosong");
const tombolFavorit = document.getElementById("tombolFavorit");
const labelJumlahFav = document.getElementById("jumlahFav");

const kartu = Array.from(document.querySelectorAll(".card")).map((el) => ({
  el,
  nama: el.querySelector(".nama").textContent.trim().toLowerCase(),
  nomor: parseInt(el.querySelector(".absen").textContent.replace(/\D/g, ""), 10),
  hati: el.querySelector(".favorit")
}));

const KUNCI_FAVORIT = "sijaFavorit";
let favorit = new Set();
try {
  favorit = new Set(JSON.parse(localStorage.getItem(KUNCI_FAVORIT) || "[]"));
} catch (e) {
  /* penyimpanan browser tidak tersedia: favorit hanya berlaku selama halaman terbuka */
}

function simpanFavorit() {
  try {
    localStorage.setItem(KUNCI_FAVORIT, JSON.stringify([...favorit]));
  } catch (e) {}
}

let hanyaFavorit = false;

function normal(teks) {
  return teks.toLowerCase().replace(/\s+/g, " ").trim();
}

function cari() {
  const kata = normal(inputCari.value);
  // "no. 5", "no 05", atau "5" dianggap pencarian nomor absen
  const angka = kata.replace(/^no\.?\s*/, "");
  const cariNomor = /^\d+$/.test(angka) ? parseInt(angka, 10) : null;

  let tampil = 0;
  kartu.forEach(({ el, nama, nomor }) => {
    const cocokTeks =
      kata === "" || (cariNomor !== null ? nomor === cariNomor : nama.includes(kata));
    const cocok = cocokTeks && (!hanyaFavorit || favorit.has(nomor));
    el.hidden = !cocok;
    if (cocok) tampil++;
  });

  const adaFilter = kata !== "" || hanyaFavorit;
  labelJumlah.textContent = adaFilter ? `${tampil} dari ${kartu.length} Siswa` : `${kartu.length} Siswa`;
  pesanKosong.hidden = tampil !== 0;
  if (tampil === 0) {
    pesanKosong.textContent =
      hanyaFavorit && kata === ""
        ? "Belum ada favorit. Tekan ikon hati pada kartu siswa untuk menandainya."
        : `Tidak ada siswa yang cocok dengan "${inputCari.value.trim()}".`;
  }
}

function perbaruiHati() {
  kartu.forEach(({ nomor, hati }) => {
    hati.setAttribute("aria-pressed", favorit.has(nomor) ? "true" : "false");
  });
  labelJumlahFav.textContent = favorit.size;
}

kartu.forEach(({ nomor, hati }) => {
  hati.addEventListener("click", () => {
    if (favorit.has(nomor)) favorit.delete(nomor);
    else favorit.add(nomor);
    simpanFavorit();
    perbaruiHati();
    if (hanyaFavorit) cari();
  });
});

tombolFavorit.addEventListener("click", () => {
  hanyaFavorit = !hanyaFavorit;
  tombolFavorit.setAttribute("aria-pressed", hanyaFavorit ? "true" : "false");
  cari();
});

inputCari.addEventListener("input", cari);
perbaruiHati();

/* ===== Tombol kembali ke atas ===== */
const keAtas = document.getElementById("keAtas");
let keAtasTampil = false;
let keAtasDasar = false;
window.addEventListener(
  "scroll",
  () => {
    const jarakKeDasar =
      document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    const harusTampil = window.scrollY > 500;
    const harusDasar = harusTampil && jarakKeDasar < 30;
    if (harusTampil !== keAtasTampil) {
      keAtasTampil = harusTampil;
      keAtas.classList.toggle("tampil", harusTampil);
    }
    if (harusDasar !== keAtasDasar) {
      keAtasDasar = harusDasar;
      keAtas.classList.toggle("dasar", harusDasar);
    }
  },
  { passive: true }
);
keAtas.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: kurangiGerak ? "auto" : "smooth" });
});

/* ===== Kursor lingkaran putih (hanya untuk perangkat dengan mouse) =====
   Dibuat ringan: posisi hanya diperbarui sekali per frame (requestAnimationFrame)
   dan hanya memakai transform sehingga tidak memicu layout ulang. */
const kursor = document.getElementById("kursor");
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.documentElement.classList.add("kursor-aktif");

  let x = 0;
  let y = 0;
  let menunggu = false;

  function gambarKursor() {
    kursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    menunggu = false;
  }

  document.addEventListener(
    "mousemove",
    (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!menunggu) {
        menunggu = true;
        requestAnimationFrame(gambarKursor);
      }
      kursor.classList.add("tampil");
    },
    { passive: true }
  );
  document.documentElement.addEventListener("mouseleave", () => kursor.classList.remove("tampil"));
  document.documentElement.addEventListener("mouseenter", () => kursor.classList.add("tampil"));
}