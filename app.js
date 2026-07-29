/* =========================================
   KAYFA APP PREMIUM
   Google Sheets Pricelist
========================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbzjmPVAmHmPnXZ3WOJEJZjp5Az7AzqQIHzkpupcVyJX1tB6k1iEo31DbfTXVG5IaOnT/exec";


/* =========================================
   ELEMENT WEBSITE
========================================= */

const productContainer = document.getElementById("productContainer");
const loadingContainer = document.getElementById("loadingContainer");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const filterContainer = document.getElementById("filterContainer");

const totalProduct = document.getElementById("totalProduct");
const readyCount = document.getElementById("readyCount");
const emptyCount = document.getElementById("emptyCount");

const lastUpdate = document.getElementById("lastUpdate");
const footerUpdate = document.getElementById("footerUpdate");

const backToTop = document.getElementById("backToTop");


/* =========================================
   DATA
========================================= */

let allProducts = [];
let activeFilter = "all";


/* =========================================
   HELPER
========================================= */

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}


function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatRupiah(value) {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return "—";
    }

    if (typeof value === "number") {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(value);
    }

    const rawValue = String(value).trim();

    const numericValue = Number(
        rawValue.replace(/[^\d-]/g, "")
    );

    if (Number.isNaN(numericValue)) {
        return escapeHTML(rawValue);
    }

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(numericValue);
}


/* =========================================
   STATUS
========================================= */

function getStatusClass(statusValue) {
    const status = normalizeText(statusValue);

    if (status === "ready") {
        return "ready";
    }

    if (
        status === "kosong" ||
        status === "tidak ready" ||
        status === "habis" ||
        status === "sold out"
    ) {
        return "off";
    }

    if (
        status === "pre order" ||
        status === "preorder" ||
        status === "po"
    ) {
        return "preorder";
    }

    return "other";
}


function getStatusIcon(statusValue) {
    const statusClass = getStatusClass(statusValue);

    const icons = {
        ready: "fa-circle-check",
        off: "fa-circle-xmark",
        preorder: "fa-clock",
        other: "fa-circle-info"
    };

    return icons[statusClass];
}


/* =========================================
   PRODUCT ICON
========================================= */

function getProductIcon(productName) {
    const product = normalizeText(productName);

    const iconMap = [
        {
            keywords: ["netflix"],
            icon: "fa-solid fa-film"
        },
        {
            keywords: ["spotify", "music"],
            icon: "fa-solid fa-music"
        },
        {
            keywords: ["youtube"],
            icon: "fa-brands fa-youtube"
        },
        {
            keywords: ["canva", "design"],
            icon: "fa-solid fa-palette"
        },
        {
            keywords: ["chatgpt", "openai", "claude", "grok"],
            icon: "fa-solid fa-robot"
        },
        {
           keywords: ["gemini"],
            icon: "fa-solid fa-star"
        },
        {
            keywords: ["capcut", "video"],
            icon: "fa-solid fa-video"
        },
        {
            keywords: ["disney", "prime", "vidio", "vision"],
            icon: "fa-solid fa-tv"
        },
        {
            keywords: ["office", "microsoft"],
            icon: "fa-brands fa-microsoft"
        },
        {
            keywords: ["zoom", "meeting"],
            icon: "fa-solid fa-video"
        }
    ];

    const matchedIcon = iconMap.find(item =>
        item.keywords.some(keyword =>
            product.includes(keyword)
        )
    );

    return matchedIcon
        ? matchedIcon.icon
        : "fa-solid fa-cube";
}


/* =========================================
   AMBIL DATA
========================================= */

async function loadProducts() {
    showLoading();

    try {
        const response = await fetch(
            `${API_URL}?timestamp=${Date.now()}`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        const result = await response.json();

        let products = [];
        let updatedAt = null;

        // Format API lama: [...]
        if (Array.isArray(result)) {
            products = result;
        }

        // Format API baru:
        // { updatedAt: "...", data: [...] }
        else if (
            result &&
            Array.isArray(result.data)
        ) {
            products = result.data;
            updatedAt = result.updatedAt || null;
        }

        else {
            throw new Error(
                "Format data API tidak sesuai."
            );
        }

        allProducts = products.filter(item => {
            const product = String(
                item["Produk"] || ""
            ).trim();

            const variant = String(
                item["Varian"] || ""
            ).trim();

            return product !== "" || variant !== "";
        });

        createCategoryFilters();
        updateStatistics();
        updateLastUpdate(updatedAt);
        applyFilters();

    } catch (error) {
        console.error(
            "Gagal mengambil data:",
            error
        );

        showFetchError();
    }
}


/* =========================================
   LOADING
========================================= */

function showLoading() {
    if (loadingContainer) {
        loadingContainer.style.display = "grid";
    }

    if (productContainer) {
        productContainer.style.display = "none";
    }

    if (emptyState) {
        emptyState.style.display = "none";
    }
}


function hideLoading() {
    if (loadingContainer) {
        loadingContainer.style.display = "none";
    }

    if (productContainer) {
        productContainer.style.display = "grid";
    }
}


/* =========================================
   RENDER PRODUCT
========================================= */

function renderProducts(products) {
    hideLoading();

    productContainer.innerHTML = "";

    if (products.length === 0) {
        productContainer.style.display = "none";
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";
    productContainer.style.display = "grid";

    products.forEach((item, index) => {
        const product = escapeHTML(
            item["Produk"] || "Produk"
        );

        const variant = escapeHTML(
            item["Varian"] || "Tanpa varian"
        );

        const resellerPrice = formatRupiah(
            item["Harga Reseller"]
        );

        const publicPrice = formatRupiah(
            item["Harga Umum"]
        );

        const originalStatus = String(
            item["Status"] || "Belum tersedia"
        ).trim();

        const safeStatus = escapeHTML(
            originalStatus
        );

        const originalCategory = String(
            item["Kategori"] || ""
        ).trim();

        const safeCategory = escapeHTML(
            originalCategory
        );

        const statusClass = getStatusClass(
            originalStatus
        );

        const statusIcon = getStatusIcon(
            originalStatus
        );

        const productIcon = getProductIcon(
            item["Produk"]
        );

        const card = document.createElement("article");

        card.className = "product-card";

        card.style.animationDelay =
            `${Math.min(index * 0.04, 0.4)}s`;

        card.innerHTML = `
            <div class="product-header">

                <div class="product-icon">
                    <i class="${productIcon}"></i>
                </div>

                <div class="product-title">
                    <h3>${product}</h3>
                    <p>${variant}</p>
                </div>

            </div>

            <div class="price-box">

                <div class="price-item">
                    <span class="price-label">
                        Harga Reseller
                    </span>

                    <span class="price-value">
                        ${resellerPrice}
                    </span>
                </div>

                <div class="price-item">
                    <span class="price-label">
                        Harga Umum
                    </span>

                    <span class="price-value">
                        ${publicPrice}
                    </span>
                </div>

            </div>

            <div class="product-meta">
                <span class="status ${statusClass}">
                    <i class="fa-solid ${statusIcon}"></i>
                    ${safeStatus}
                </span>

                ${originalCategory ? `
                    <span class="category-badge">
                        <i class="fa-solid fa-tag"></i>
                        ${safeCategory}
                    </span>
                ` : ""}
            </div>
        `;

        productContainer.appendChild(card);
    });
}


/* =========================================
   FILTER OTOMATIS
========================================= */

function createCategoryFilters() {
    if (!filterContainer) {
        activeFilter = "all";
        return;
    }

    const categories = [];

    allProducts.forEach(item => {
        const originalCategory = String(
            item["Kategori"] || ""
        ).trim();

        const categoryKey = normalizeText(
            originalCategory
        );

        if (
            originalCategory &&
            !categories.some(item =>
                item.key === categoryKey
            )
        ) {
            categories.push({
                key: categoryKey,
                label: originalCategory
            });
        }
    });

    activeFilter = "all";
    filterContainer.innerHTML = "";

    const allButton = createFilterButton(
        "all",
        "Semua"
    );

    allButton.classList.add("active");
    filterContainer.appendChild(allButton);

    categories.forEach(category => {
        const button = createFilterButton(
            category.key,
            category.label
        );

        filterContainer.appendChild(button);
    });
}


function createFilterButton(filterValue, label) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "filter-btn";
    button.dataset.filter = filterValue;
    button.textContent = label;

    button.addEventListener("click", () => {
        activeFilter = filterValue;

        document
            .querySelectorAll(".filter-btn")
            .forEach(item =>
                item.classList.remove("active")
            );

        button.classList.add("active");

        applyFilters();
    });

    return button;
}


/* =========================================
   SEARCH DAN FILTER
========================================= */

function applyFilters() {
    const keyword = normalizeText(
        searchInput?.value
    );

    const filteredProducts = allProducts.filter(item => {
        const product = normalizeText(
            item["Produk"]
        );

        const variant = normalizeText(
            item["Varian"]
        );

        const status = normalizeText(
            item["Status"]
        );

        const category = normalizeText(
            item["Kategori"]
        );

        const resellerPrice = normalizeText(
            item["Harga Reseller"]
        );

        const publicPrice = normalizeText(
            item["Harga Umum"]
        );

        const matchesSearch =
            product.includes(keyword) ||
            variant.includes(keyword) ||
            status.includes(keyword) ||
            category.includes(keyword) ||
            resellerPrice.includes(keyword) ||
            publicPrice.includes(keyword);

        const matchesCategory =
            activeFilter === "all" ||
            category === activeFilter;

        return matchesSearch && matchesCategory;
    });

    renderProducts(filteredProducts);
}


if (searchInput) {
    searchInput.addEventListener(
        "input",
        applyFilters
    );
}


/* =========================================
   STATISTIK
========================================= */

function updateStatistics() {
    const total = allProducts.length;

    const ready = allProducts.filter(item =>
        normalizeText(item["Status"]) === "ready"
    ).length;

    const notReady = total - ready;

    animateNumber(totalProduct, total);
    animateNumber(readyCount, ready);
    animateNumber(emptyCount, notReady);
}


function animateNumber(element, target) {
    if (!element) {
        return;
    }

    let current = 0;

    const duration = 700;
    const frameRate = 16;

    const totalFrames = Math.max(
        1,
        Math.round(duration / frameRate)
    );

    const increment = target / totalFrames;

    const timer = setInterval(() => {
        current += increment;

        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
            return;
        }

        element.textContent = Math.floor(current);
    }, frameRate);
}


/* =========================================
   LAST UPDATE
========================================= */

function formatLastUpdate(updatedAt) {
    const match = String(updatedAt).trim().match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})[ ,T]+(\d{1,2}):(\d{2})/
    );

    if (!match) {
        return String(updatedAt).trim();
    }

    const [, day, month, year, hour, minute] = match;
    const date = new Date(Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day)
    ));

    const weekday = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        timeZone: "UTC"
    }).format(date);

    const monthName = new Intl.DateTimeFormat("id-ID", {
        month: "long",
        timeZone: "UTC"
    }).format(date);

    const capitalizedWeekday =
        weekday.charAt(0).toUpperCase() + weekday.slice(1);

    return `${capitalizedWeekday}, ${Number(day)} ${monthName} ${year} | ${hour.padStart(2, "0")}:${minute} WIB`;
}

function updateLastUpdate(updatedAt) {

    if (!updatedAt) {

        if (lastUpdate) {
            lastUpdate.textContent = "Belum ada riwayat pembaruan";
        }

        if (footerUpdate) {
            footerUpdate.textContent = "Belum ada riwayat pembaruan";
        }

        return;
    }

    const formattedUpdate = formatLastUpdate(updatedAt);

    if (lastUpdate) {
        lastUpdate.textContent = formattedUpdate;
    }

    if (footerUpdate) {
        footerUpdate.textContent = formattedUpdate;
    }

}


/* =========================================
   ERROR
========================================= */

function showFetchError() {
    hideLoading();

    productContainer.innerHTML = "";
    productContainer.style.display = "none";

    emptyState.style.display = "block";

    emptyState.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>

        <h3>Data gagal dimuat</h3>

        <p>
            Silakan refresh halaman atau coba beberapa
            saat lagi.
        </p>
    `;

    if (lastUpdate) {
        lastUpdate.textContent =
            "Gagal mengambil data";
    }

    if (footerUpdate) {
        footerUpdate.textContent =
            "Gagal mengambil data";
    }
}


/* =========================================
   BACK TO TOP
========================================= */

window.addEventListener("scroll", () => {
    if (!backToTop) {
        return;
    }

    if (window.scrollY > 450) {
        backToTop.classList.add("show");
    } else {
        backToTop.classList.remove("show");
    }
});


if (backToTop) {
    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


/* =========================================
   MULAI WEBSITE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    loadProducts
);
