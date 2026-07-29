// =============================
// CONFIG
// =============================

const API_URL = "https://script.google.com/macros/s/AKfycbzjmPVAmHmPnXZ3WOJEJZjp5Az7AzqQIHzkpupcVyJX1tB6k1iEo31DbfTXVG5IaOnT/exec";

// =============================
// ELEMENT
// =============================

const topName = document.getElementById("topName");
const topProfit = document.getElementById("topProfit");
const topOrder = document.getElementById("topOrder");
const leaderboardList = document.getElementById("leaderboardList");
const lastUpdate = document.getElementById("lastUpdate");

// =============================
// FORMAT
// =============================

function rupiah(value) {

    const number = Number(String(value).replace(/[^\d]/g, "")) || 0;

    return "Rp " + number.toLocaleString("id-ID");

}

function avatar(name) {

    if (!name) return "?";

    return name.charAt(0).toUpperCase();

}

// =============================
// LOADING
// =============================

function showLoading() {

    leaderboardList.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        leaderboardList.innerHTML += `
        
        <div class="leaderboard-row">

            <div>...</div>

            <div>Loading...</div>

            <div>...</div>

            <div>...</div>

        </div>

        `;

    }

}

// =============================
// EMPTY
// =============================

function showEmpty() {

    leaderboardList.innerHTML = `

    <div class="leaderboard-empty">

        <h3>Belum ada data.</h3>

        <p>Leaderboard akan tampil setelah data tersedia.</p>

    </div>

    `;

}

// =============================
// ERROR
// =============================

function showError() {

    leaderboardList.innerHTML = `

    <div class="leaderboard-empty">

        <h3>Gagal memuat data.</h3>

        <p>Silakan coba lagi beberapa saat.</p>

    </div>

    `;

}

// =============================
// RENDER
// =============================

function render(data) {

    leaderboardList.innerHTML = "";

    if (!data.length) {

        showEmpty();

        return;

    }

    // TOP 1

    topName.textContent = data[0].Nama || "-";

    topProfit.textContent = rupiah(data[0].Profit);

    topOrder.textContent = data[0]["Total Order"] || "0";

    // LIST

    data.forEach((item, index) => {

        let medal = index + 1;

        let rankClass = "";

        if (medal === 1) rankClass = "rank-1";
        if (medal === 2) rankClass = "rank-2";
        if (medal === 3) rankClass = "rank-3";

        leaderboardList.innerHTML += `

        <div class="leaderboard-row">

            <div class="rank ${rankClass}">
                #${medal}
            </div>

            <div class="user-info">

                <div class="user-avatar">

                    ${avatar(item.Nama)}

                </div>

                <div class="user-name">

                    <strong>${item.Nama}</strong>

                    <span>Reseller</span>

                </div>

            </div>

            <div class="order-value">

                ${item["Total Order"]}

            </div>

            <div class="profit-value">

                ${rupiah(item.Profit)}

            </div>

        </div>

        `;

    });

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

// =============================
// FETCH
// =============================

async function loadLeaderboard() {

    showLoading();

    try {
        const url = new URL(API_URL);
        url.searchParams.set("sheet", "TopReseller");
        url.searchParams.set("timestamp", Date.now());

        const res = await fetch(url, {
            cache: "no-store"
        });

        if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`);
        }

        const result = await res.json();
        const data = Array.isArray(result)
            ? result
            : (Array.isArray(result.data) ? result.data : []);

        data.sort((a, b) => {
            return Number(b.Profit) - Number(a.Profit);
        });

        render(data);

        const updatedAt = !Array.isArray(result)
            ? result.updatedAt
            : null;

        lastUpdate.textContent = updatedAt
            ? formatLastUpdate(updatedAt)
            : "Belum ada riwayat pembaruan";

    } catch (err) {
        console.error("Leaderboard Error:", err);
        lastUpdate.textContent = "Gagal mengambil data";
        showError();
    }
}

// =============================
// AUTO REFRESH
// =============================

loadLeaderboard();

setInterval(loadLeaderboard, 60000);

// =============================
// BACK TO TOP
// =============================

const backBtn = document.querySelector(".back-to-top");

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {

        backBtn.style.display = "block";

    } else {

        backBtn.style.display = "none";

    }

});

backBtn.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});
