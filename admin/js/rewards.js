// admin/js/rewards.js

const STORAGE_KEY = "monica_rewards";

document.addEventListener("DOMContentLoaded", init);

function init() {
if (!isLoggedIn()) {
window.location.href = "login.html";
return;
}

```
seedRewardsIfEmpty();
bindEvents();
applyTheme(getSavedTheme());
renderRewards();
```

}

function isLoggedIn() {
return localStorage.getItem("admin_logged_in") === "true";
}

function bindEvents() {
document.getElementById("logoutBtn")?.addEventListener("click", logout);
document.getElementById("themeBtn")?.addEventListener("click", toggleTheme);
document.getElementById("searchInput")?.addEventListener("input", renderRewards);
document.getElementById("addRewardBtn")?.addEventListener("click", addReward);
}

function logout() {
localStorage.removeItem("admin_logged_in");
window.location.href = "login.html";
}

function getSavedTheme() {
return localStorage.getItem("admin_theme") || "light";
}

function applyTheme(theme) {
localStorage.setItem("admin_theme", theme);

```
const themeBtn = document.getElementById("themeBtn");
const icon = themeBtn?.querySelector("i");

if (icon) {
    icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

document.documentElement.setAttribute("data-theme", theme);

if (theme === "dark") {
    document.body.style.background =
        "radial-gradient(circle at top left, rgba(91,124,250,.15), transparent 30%), radial-gradient(circle at bottom right, rgba(0,201,167,.12), transparent 28%), #0b1220";
    document.body.style.color = "#E2E8F0";
} else {
    document.body.style.background = "";
    document.body.style.color = "";
}
```

}

function toggleTheme() {
const next = getSavedTheme() === "dark" ? "light" : "dark";
applyTheme(next);
}

function getRewards() {
try {
const raw = localStorage.getItem(STORAGE_KEY);
const data = raw ? JSON.parse(raw) : [];
return Array.isArray(data) ? data : [];
} catch {
return [];
}
}

function saveRewards(items) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function seedRewardsIfEmpty() {
const items = getRewards();
if (items.length) return;

```
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const sample = [
    {
        rewardId: uid(),
        date: formatDateInput(today),
        customerName: "မင်းလှ Lal Tin",
        points: 120,
        type: "Earned",
        note: "Fuel purchase reward",
    },
    {
        rewardId: uid(),
        date: formatDateInput(yesterday),
        customerName: "Nau Sui Nu",
        points: 50,
        type: "Redeemed",
        note: "Discount redemption",
    },
    {
        rewardId: uid(),
        date: formatDateInput(today),
        customerName: "မနှင်း",
        points: 90,
        type: "Earned",
        note: "Weekly bonus",
    },
];

saveRewards(sample);
```

}

function renderRewards() {
const tbody = document.getElementById("rewardsTable");
if (!tbody) return;

```
const query = getSearchValue();
const all = getRewards();

updateStats(all);

const filtered = all.filter((item) => {
    const text = [
        item.date,
        item.customerName,
        item.points,
        item.type,
        item.note,
    ]
        .join(" ")
        .toLowerCase();

    return text.includes(query);
});

if (!filtered.length) {
    tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;padding:24px;">
                No rewards found.
            </td>
        </tr>
    `;
    return;
}

filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

tbody.innerHTML = filtered.map((item) => `
    <tr>
        <td>${escapeHtml(formatDisplayDate(item.date))}</td>
        <td>${escapeHtml(item.customerName || "")}</td>
        <td>${formatPoints(item.points)}</td>
        <td>${badgeHtml(getTypeLabel(item.type), getTypeClass(item.type))}</td>
        <td>${escapeHtml(item.note || "—")}</td>
        <td>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="login-btn" type="button" style="width:auto;padding:10px 14px;" onclick="window.__editReward('${item.rewardId}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="login-btn" type="button" style="width:auto;padding:10px 14px;background:linear-gradient(135deg,#FF5B6E,#FF7A8A);" onclick="window.__deleteReward('${item.rewardId}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>
`).join("");
```

}

function updateStats(all) {
const totalPoints = all.reduce((sum, item) => sum + Number(item.points || 0), 0);
const redeemedPoints = all
.filter((item) => (item.type || "").toLowerCase() === "redeemed")
.reduce((sum, item) => sum + Number(item.points || 0), 0);
const availablePoints = totalPoints - redeemedPoints;
const rewardMembers = new Set(all.map((item) => item.customerName || "")).size;

```
setText("totalPoints", String(totalPoints));
setText("redeemedPoints", String(redeemedPoints));
setText("availablePoints", String(availablePoints));
setText("rewardMembers", String(rewardMembers));
```

}

function addReward() {
const customerName = prompt("Customer name:");
if (customerName === null) return;
if (!customerName.trim()) return alert("Customer name is required.");

```
const points = prompt("Points:", "0");
if (points === null) return;

const type = prompt("Type (Earned / Redeemed):", "Earned");
if (type === null) return;

const note = prompt("Note (optional):", "");
if (note === null) return;

const items = getRewards();
items.unshift({
    rewardId: uid(),
    date: formatDateInput(new Date()),
    customerName: customerName.trim(),
    points: Number(points) || 0,
    type: normalizeType(type),
    note: note.trim(),
});

saveRewards(items);
renderRewards();
```

}

function editReward(id) {
const items = getRewards();
const reward = items.find((item) => item.rewardId === id);
if (!reward) return;

```
const customerName = prompt("Customer name:", reward.customerName || "");
if (customerName === null) return;

const points = prompt("Points:", String(reward.points ?? 0));
if (points === null) return;

const type = prompt("Type (Earned / Redeemed):", reward.type || "Earned");
if (type === null) return;

const note = prompt("Note:", reward.note || "");
if (note === null) return;

reward.customerName = customerName.trim();
reward.points = Number(points) || 0;
reward.type = normalizeType(type);
reward.note = note.trim();

saveRewards(items);
renderRewards();
```

}

function deleteReward(id) {
const items = getRewards();
const reward = items.find((item) => item.rewardId === id);
if (!reward) return;

```
const ok = confirm(`Delete reward record for "${reward.customerName}"?`);
if (!ok) return;

saveRewards(items.filter((item) => item.rewardId !== id));
renderRewards();
```

}

function getSearchValue() {
return (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
}

function normalizeType(value) {
const v = String(value || "").trim().toLowerCase();
if (v === "redeemed") return "Redeemed";
return "Earned";
}

function getTypeLabel(type) {
return normalizeType(type);
}

function getTypeClass(type) {
return (String(type || "").toLowerCase() === "redeemed") ? "warning" : "success";
}

function badgeHtml(text, cls) {
return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

function formatPoints(value) {
const num = Number(value);
if (Number.isNaN(num)) return "0";
return `${num.toLocaleString()} pts`;
}

function formatDisplayDate(value) {
if (!value) return "—";
const d = new Date(value);
if (Number.isNaN(d.getTime())) return String(value);
return d.toLocaleDateString("en-GB", {
year: "numeric",
month: "short",
day: "2-digit",
});
}

function formatDateInput(date) {
const d = new Date(date);
const y = d.getFullYear();
const m = String(d.getMonth() + 1).padStart(2, "0");
const day = String(d.getDate()).padStart(2, "0");
return `${y}-${m}-${day}`;
}

function setText(id, value) {
const el = document.getElementById(id);
if (el) el.textContent = value;
}

function uid() {
return `reward_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
return String(value)
.replaceAll("&", "&")
.replaceAll("<", "<")
.replaceAll(">", ">")
.replaceAll('"', """)
.replaceAll("'", "'");
}

window.__editReward = editReward;
window.__deleteReward = deleteReward;
