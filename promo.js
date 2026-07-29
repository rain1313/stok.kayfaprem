(function () {
    const API_URL = "https://script.google.com/macros/s/AKfycbzjmPVAmHmPnXZ3WOJEJZjp5Az7AzqQIHzkpupcVyJX1tB6k1iEo31DbfTXVG5IaOnT/exec";
    const promoGrid = document.getElementById("promoGrid");
    const promoLoading = document.getElementById("promoLoading");
    const promoEmpty = document.getElementById("promoEmpty");
    const lastUpdate = document.getElementById("lastUpdate");
    const backToTop = document.getElementById("backToTop");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHTML(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function getValue(item, headerName) {
        const wantedKey = normalize(headerName);
        const actualKey = Object.keys(item).find(key => normalize(key) === wantedKey);
        return actualKey ? item[actualKey] : "";
    }

    function formatLastUpdate(value) {
        const match = String(value || "").trim().match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ ,T]+(\d{1,2}):(\d{2})/
        );

        if (!match) return String(value || "").trim();

        const [, day, month, year, hour, minute] = match;
        const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
        const weekday = new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            timeZone: "UTC"
        }).format(date);
        const monthName = new Intl.DateTimeFormat("id-ID", {
            month: "long",
            timeZone: "UTC"
        }).format(date);
        const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

        return `${capitalizedWeekday}, ${Number(day)} ${monthName} ${year} | ${hour.padStart(2, "0")}:${minute} WIB`;
    }

    function formatRupiah(value) {
        if (value === null || value === undefined || String(value).trim() === "") {
            return "—";
        }

        if (typeof value === "number") {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0
            }).format(value);
        }

        const raw = String(value).trim();
        const number = Number(raw.replace(/[^\d-]/g, ""));

        if (Number.isNaN(number)) {
            return escapeHTML(raw);
        }

        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(number);
    }

    function getProductIcon(productName) {
        const product = normalize(productName);
        const icons = [
            [["netflix"], "fa-solid fa-film"],
            [["spotify", "music"], "fa-solid fa-music"],
            [["youtube"], "fa-brands fa-youtube"],
            [["canva", "design"], "fa-solid fa-palette"],
            [["chatgpt", "openai", "claude", "grok"], "fa-solid fa-robot"],
            [["capcut", "video"], "fa-solid fa-video"],
            [["disney", "prime", "vidio", "vision"], "fa-solid fa-tv"]
        ];

        const match = icons.find(([keywords]) =>
            keywords.some(keyword => product.includes(keyword))
        );

        return match ? match[1] : "fa-solid fa-cube";
    }

    function renderPromos(products) {
        promoLoading.style.display = "none";
        promoGrid.innerHTML = "";

        if (!products.length) {
            promoEmpty.classList.add("show");
            return;
        }

        promoEmpty.classList.remove("show", "promo-error");

        products.forEach((item, index) => {
            const productName = getValue(item, "Produk");
            const product = escapeHTML(productName || "Produk Promo");
            const description = escapeHTML(getValue(item, "Deskripsi"));
            const isFlashSale = normalize(getValue(item, "Kategori")) === "flash sale";
            const card = document.createElement("article");
            card.className = `promo-card${isFlashSale ? " flash-sale" : ""}`;
            card.style.animationDelay = `${Math.min(index * 0.05, 0.35)}s`;
            card.innerHTML = `
                <div class="promo-card-head">
                    <div class="promo-product-icon"><i class="${getProductIcon(productName)}"></i></div>
                    <div class="promo-title">
                        <h2>${product}</h2>
                        ${description ? `<p class="promo-product-description">${description}</p>` : ""}
                        ${isFlashSale ? '<span class="flash-badge"><i class="fa-solid fa-bolt"></i> FLASH SALE</span>' : ""}
                    </div>
                </div>
                <div class="promo-prices">
                    <div class="promo-price-row">
                        <div class="promo-price-label"><span>Harga Reseller</span><span class="discount-label">PROMO</span></div>
                        <div class="promo-price-values"><span class="old-price">${formatRupiah(getValue(item, "Harga Reseller Awal"))}</span><strong class="new-price">${formatRupiah(getValue(item, "Harga Reseller Promo"))}</strong></div>
                    </div>
                    <div class="promo-price-row">
                        <div class="promo-price-label"><span>Harga Umum</span><span class="discount-label">PROMO</span></div>
                        <div class="promo-price-values"><span class="old-price">${formatRupiah(getValue(item, "Harga Umum Awal"))}</span><strong class="new-price">${formatRupiah(getValue(item, "Harga Umum Promo"))}</strong></div>
                    </div>
                </div>`;
            promoGrid.appendChild(card);
        });
    }

    async function loadPromos() {
        try {
            const url = new URL(API_URL);
            url.searchParams.set("sheet", "promo");
            url.searchParams.set("timestamp", Date.now());

            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            if (result.error) throw new Error(result.message || "Data promo gagal dimuat");

            const products = (Array.isArray(result.data) ? result.data : [])
                .filter(item => String(getValue(item, "Produk") || "").trim() !== "")
                .map((item, order) => ({ ...item, _order: order }))
                .sort((a, b) => {
                    const aFlash = normalize(getValue(a, "Kategori")) === "flash sale" ? 0 : 1;
                    const bFlash = normalize(getValue(b, "Kategori")) === "flash sale" ? 0 : 1;
                    return aFlash - bFlash || a._order - b._order;
                });

            lastUpdate.textContent = result.updatedAt
                ? formatLastUpdate(result.updatedAt)
                : "Belum ada riwayat pembaruan";
            renderPromos(products);
        } catch (error) {
            console.error("Promo Error:", error);
            promoLoading.style.display = "none";
            promoGrid.innerHTML = "";
            promoEmpty.classList.add("show", "promo-error");
            promoEmpty.querySelector("h2").textContent = "Data promo gagal dimuat";
            promoEmpty.querySelector("p").textContent = "Silakan refresh halaman atau coba kembali beberapa saat lagi.";
            lastUpdate.textContent = "Gagal mengambil data";
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

    window.addEventListener("scroll", () => {
        backToTop.classList.toggle("show", window.scrollY > 450);
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.addEventListener("DOMContentLoaded", loadPromos);
})();
