// admin/js/dashboard.js
import customerRepo from "../../shared/db/customerRepo.js";
import transactionRepo from "../../shared/db/transactionRepo.js";
import repository from "../../shared/db/repository.js";
import CONFIG from "../../shared/js/config.js";
import utils from "../../shared/js/utils.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    applyTheme(getSavedTheme());

    bindEvents();

    await loadDashboard();
}

function isLoggedIn() {
    return localStorage.getItem("admin_logged_in") === "true";
}

function bindEvents() {
    const logoutBtn = document.getElementById("logoutBtn");
    const themeBtn = document.getElementById("themeBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", toggleTheme);
    }
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

    const themeBtn = document.getElementById("themeBtn");
    const icon = themeBtn?.querySelector("i");

    if (icon) {
        icon.className = theme === "dark"
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";
    }

    document.documentElement.setAttribute("data-theme", theme);

    // simple dark mode support for current layout
    if (theme === "dark") {
        document.body.style.background =
            "radial-gradient(circle at top left, rgba(91,124,250,.15), transparent 30%), radial-gradient(circle at bottom right, rgba(0,201,167,.12), transparent 28%), #0b1220";
        document.body.style.color = "#E2E8F0";
    } else {
        document.body.style.background = "";
        document.body.style.color = "";
    }
}

function toggleTheme() {
    const nextTheme = getSavedTheme() === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
}

async function loadDashboard() {
    try {
        setStatsLoading(true);

        await Promise.all([
            loadCounts(),
            loadFuelPrices(),
            loadRecentTransactions(),
            loadSalesChart(),
        ]);
    } catch (error) {
        console.error("Dashboard load failed:", error);
        showError(error?.message || "Failed to load dashboard data.");
    } finally {
        setStatsLoading(false);
    }
}

function setStatsLoading(isLoading) {
    const ids = ["customerCount", "transactionCount", "rewardCount", "creditAmount"];
    for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (isLoading) el.textContent = "Loading...";
    }
}

async function loadCounts() {
    const [customers, transactions, rewardCount] = await Promise.all([
        customerRepo.getAll(),
        transactionRepo.getAll(),
        repository.count("rewards"),
    ]);

    const outstandingCredit = customers.reduce((sum, c) => {
        return sum + Number(c.creditBalance || 0);
    }, 0);

    setText("customerCount", utils.number(customers.length));
    setText("transactionCount", utils.number(transactions.length));
    setText("rewardCount", utils.number(rewardCount));
    setText("creditAmount", `${utils.number(outstandingCredit)} ${CONFIG.CURRENCY}`);
}

async function loadFuelPrices() {
    const settingsRecords = await repository.getAll("settings");
    const settings = normalizeSettings(settingsRecords);

    const price92 = settings.fuelPrice92 ?? "—";
    const price95 = settings.fuelPrice95 ?? "—";
    const companyName = settings.companyName ?? CONFIG.COMPANY_NAME;

    const container = document.getElementById("fuelPrice");
    if (!container) return;

    container.innerHTML = `
        <div class="price-item">
            <strong>${escapeHtml(companyName)}</strong>
            <span>${escapeHtml(CONFIG.CURRENCY)}</span>
        </div>
        <div class="price-item">
            <strong>Fuel 92</strong>
            <span>${escapeHtml(formatPrice(price92))}</span>
        </div>
        <div class="price-item">
            <strong>Fuel 95</strong>
            <span>${escapeHtml(formatPrice(price95))}</span>
        </div>
    `;
}

async function loadRecentTransactions() {
    const [transactions, customers] = await Promise.all([
        transactionRepo.getAll(),
        customerRepo.getAll(),
    ]);

    const customerMap = new Map(
        customers.map((c) => [c.customerId, c])
    );

    const recent = transactions
        .slice()
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        .slice(0, 6);

    const tbody = document.getElementById("recentTransactions");
    if (!tbody) return;

    if (!recent.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:24px;">
                    No transactions yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = recent.map((tx) => {
        const customer = customerMap.get(tx.customerId);
        const customerName = customer?.name || tx.customerId || "Unknown";

        const badgeClass = getTransactionBadgeClass(tx.type);

        return `
            <tr>
                <td>${escapeHtml(utils.formatDateTime(tx.date || Date.now()))}</td>
                <td>${escapeHtml(customerName)}</td>
                <td>${escapeHtml(tx.type || "—")}</td>
                <td>${escapeHtml(formatPrice(tx.amount ?? 0))}</td>
                <td>
                    <span class="badge ${badgeClass}">
                        ${escapeHtml(formatStatus(tx.type))}
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

async function loadSalesChart() {
    const transactions = await transactionRepo.getAll();
    const canvas = document.getElementById("salesChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const days = buildLast7Days();
    const series = days.map((day) => {
        return transactions.reduce((sum, tx) => {
            const txDate = tx.date ? new Date(tx.date) : null;
            if (!txDate || Number.isNaN(txDate.getTime())) return sum;

            const key = formatDayKey(txDate);
            if (key !== day.key) return sum;

            return sum + Number(tx.amount || 0);
        }, 0);
    });

    drawLineChart(canvas, ctx, {
        labels: days.map((d) => d.label),
        values: series,
        title: "Last 7 Days Sales",
    });
}

function drawLineChart(canvas, ctx, { labels, values, title }) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 900;
    const height = 320;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);

    // background
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "rgba(0,87,255,0.03)");
    bg.addColorStop(1, "rgba(0,201,167,0.02)");
    ctx.fillStyle = bg;
    roundRect(ctx, 0, 0, width, height, 18);
    ctx.fill();

    const padding = { top: 34, right: 24, bottom: 44, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const max = Math.max(...values, 1);
    const stepX = values.length > 1 ? chartW / (values.length - 1) : chartW;
    const points = values.map((value, index) => {
        const x = padding.left + index * stepX;
        const y = padding.top + chartH - (value / max) * chartH;
        return { x, y, value };
    });

    // title
    ctx.fillStyle = "#1E293B";
    ctx.font = "600 15px Poppins, sans-serif";
    ctx.fillText(title, padding.left, 22);

    // grid
    ctx.strokeStyle = "rgba(100,116,139,0.12)";
    ctx.lineWidth = 1;

    for (let i = 0; i < 4; i++) {
        const y = padding.top + (chartH / 3) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }

    if (!values.some((v) => v > 0)) {
        ctx.fillStyle = "#64748B";
        ctx.font = "500 14px Poppins, sans-serif";
        ctx.fillText("No sales data yet.", padding.left, padding.top + chartH / 2);
        return;
    }

    // line path
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0057FF";
    ctx.fillStyle = "rgba(0,87,255,0.10)";
    ctx.beginPath();

    points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });

    // area fill
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();
    ctx.fill();

    // redraw line on top
    ctx.beginPath();
    points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // points
    points.forEach((p) => {
        ctx.fillStyle = "#00C9A7";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1E293B";
        ctx.font = "500 12px Poppins, sans-serif";
        ctx.fillText(utils.number(Math.round(p.value)), p.x - 12, p.y - 12);
    });

    // x labels
    ctx.fillStyle = "#64748B";
    ctx.font = "500 12px Poppins, sans-serif";
    points.forEach((p, i) => {
        const label = labels[i];
        ctx.fillText(label, p.x - 18, height - 16);
    });
}

function buildLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
            key: formatDayKey(d),
            label: d.toLocaleDateString("en-US", { weekday: "short" }),
        });
    }
    return days;
}

function formatDayKey(date) {
    return date.toISOString().slice(0, 10);
}

function normalizeSettings(records) {
    const result = {};

    for (const item of records || []) {
        if (item && typeof item === "object") {
            if ("key" in item) {
                result[item.key] = item.value ?? item.data ?? item.text ?? item[item.key];
            }
        }
    }

    return result;
}

function getTransactionBadgeClass(type) {
    switch ((type || "").toLowerCase()) {
        case "fuel":
            return "success";
        case "redeem":
            return "warning";
        case "payment":
            return "primary";
        case "credit":
            return "danger";
        default:
            return "primary";
    }
}

function formatStatus(type) {
    switch ((type || "").toLowerCase()) {
        case "fuel":
            return "Fuel Sale";
        case "redeem":
            return "Redeemed";
        case "payment":
            return "Payment";
        case "credit":
            return "Credit Sale";
        default:
            return "Posted";
    }
}

function formatPrice(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value ?? "—");
    return `${utils.number(num)} ${CONFIG.CURRENCY}`;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function showError(message) {
    const panel = document.getElementById("fuelPrice");
    if (panel) {
        panel.innerHTML = `<div class="badge danger">${escapeHtml(message)}</div>`;
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}