// ======================================
// CONFIG
// ======================================

const API_URL = "https://script.google.com/macros/s/AKfycbwEu48llXaE4KJMl_8GoehxE1OEk4LRClgNS-t-ffY4atCSObg77vKXRB9CvE0XIgDV/exec";

// ======================================
// ELEMENT
// ======================================

const topName = document.getElementById("topName");
const topProfit = document.getElementById("topProfit");
const topOrder = document.getElementById("topOrder");
const lastUpdate = document.getElementById("lastUpdate");
const leaderboardList = document.getElementById("leaderboardList");

// ======================================
// LOAD DATA
// ======================================

async function loadLeaderboard() {

    try {

        showLoading();

        const response = await fetch(`${API_URL}?sheet=TopReseller`);

        if (!response.ok) {
            throw new Error("Network Error");
        }

        const result = await response.json();

        const data = result.data || [];

        lastUpdate.textContent =
            formatDate(result.updatedAt);

        if (!data.length) {

            showEmpty();

            return;

        }

        renderTopCard(data[0]);

        renderLeaderboard(data);

    } catch (err) {

        console.error(err);

        showError();

    }

}

// ======================================
// TOP CARD
// ======================================

function renderTopCard(item) {

    topName.textContent = item.Nama;

    topProfit.textContent =
        formatCurrency(item.Profit);

    topOrder.textContent =
        item["Total Order"];

}

// ======================================
// LEADERBOARD
// ======================================

function renderLeaderboard(data) {

    leaderboardList.innerHTML = "";

    data.forEach((item, index) => {

        leaderboardList.insertAdjacentHTML(
            "beforeend",

`
<div class="leaderboard-row ${index < 3 ? "top3" : ""}">

<div class="rank ${getRankClass(index+1)}">

${getRankBadge(index+1)}

</div>

<div class="user-info">

<div class="user-avatar">

${getInitial(item.Nama)}

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

${formatCurrency(item.Profit)}

</div>

</div>
`

        );

    });

}

// ======================================
// BADGE
// ======================================

function getRankBadge(rank){

    if(rank===1) return "🥇";

    if(rank===2) return "🥈";

    if(rank===3) return "🥉";

    return "#" + rank;

}

function getRankClass(rank){

    if(rank===1) return "rank-1";

    if(rank===2) return "rank-2";

    if(rank===3) return "rank-3";

    return "other";

}

// ======================================
// FORMAT
// ======================================

function formatCurrency(value){

    return new Intl.NumberFormat("id-ID",{

        style:"currency",

        currency:"IDR",

        maximumFractionDigits:0

    }).format(Number(value));

}

function formatDate(date){

    if(!date) return "-";

    return new Date(date).toLocaleString("id-ID",{

        dateStyle:"long",

        timeStyle:"short"

    });

}

function getInitial(name){

    if(!name) return "?";

    return name.charAt(0).toUpperCase();

}

// ======================================
// STATE
// ======================================

function showLoading(){

    leaderboardList.innerHTML = "";

    for(let i=0;i<8;i++){

        leaderboardList.innerHTML += `

<div class="leaderboard-row">

<div class="rank">...</div>

<div>Loading...</div>

<div>...</div>

<div>...</div>

</div>

`;

    }

}

function showEmpty(){

    leaderboardList.innerHTML = `

<div class="leaderboard-empty">

<h3>Belum Ada Data</h3>

<p>Leaderboard reseller masih kosong.</p>

</div>

`;

}

function showError(){

    leaderboardList.innerHTML = `

<div class="leaderboard-empty">

<h3>Terjadi Kesalahan</h3>

<p>Gagal mengambil data dari server.</p>

</div>

`;

}

// ======================================
// INIT
// ======================================

document.addEventListener("DOMContentLoaded",()=>{

    loadLeaderboard();

    setInterval(loadLeaderboard,60000);

});