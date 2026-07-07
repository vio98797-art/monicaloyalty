import customerRepo from "./shared/db/customerRepo.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    bindEvents();
    applyTheme(getTheme());

    await seedIfEmpty();
    await render();
}

/* ======================
   AUTH
====================== */
function isLoggedIn() {
    return localStorage.getItem("admin_logged_in") === "true";
}

/* ======================
   EVENTS
====================== */
function bindEvents() {
    document
        .getElementById("searchInput")
        ?.addEventListener("input", render);

    document
        .getElementById("themeBtn")
        ?.addEventListener("click", toggleTheme);

    document
        .getElementById("logoutBtn")
        ?.addEventListener("click", logout);

    document
        .getElementById("addCustomerBtn")
        ?.addEventListener("click", () => {
            window.location.href = "customer-form.html";
        });
}

function logout() {
    localStorage.removeItem("admin_logged_in");
    window.location.href = "login.html";
}

/* ======================
   THEME
====================== */
function getTheme() {
    return localStorage.getItem("admin_theme") || "light";
}

function applyTheme(theme) {
    localStorage.setItem("admin_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
    const next = getTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
}

/* ======================
   SEED DATA
====================== */
async function seedIfEmpty() {
    const count = await customerRepo.count();
    if (count > 0) return;

    await customerRepo.add({
        name: "မင်းလှ Lal Tin",
        phone: "---",
        creditLimit: 20000,
        creditBalance: 20000,
    });

    await customerRepo.add({
        name: "Nau Sui Nu",
        phone: "---",
        creditLimit: 48000,
        creditBalance: 48000,
    });

    await customerRepo.add({
        name: "မနှင်း",
        phone: "---",
        creditLimit: 15000,
        creditBalance: 15000,
    });
}

/* ======================
   RENDER
====================== */
async function render() {
    const tbody = document.getElementById("customerTableBody");
    if (!tbody) return;

    const query = getSearch();

    let items = await customerRepo.getAll();

    if (query) {
        items = await customerRepo.search(query);
    }

    updateStats(items);

    if (!items.length) {
        tbody.innerHTML = `
            <tr><td colspan="8" style="text-align:center;padding:20px;">
                No customers found
            </td></tr>
        `;
        return;
    }

    tbody.innerHTML = items.map(c => `
        <tr>
            <td>${escape(c.name)}</td>
            <td>${escape(c.phone)}</td>
            <td>${money(c.creditLimit)}</td>
            <td>${money(c.creditBalance)}</td>
            <td>${status(c)}</td>
            <td>
                <button onclick="edit('${c.customerId}')">Edit</button>
                <button onclick="remove('${c.customerId}')">Delete</button>
            </td>
        </tr>
    `).join("");
}

/* ======================
   ACTIONS
====================== */
window.edit = (id) => {
    window.location.href = `customer-form.html?id=${id}`;
};

window.remove = async (id) => {
    if (!confirm("Delete this customer?")) return;
    await customerRepo.remove(id);
    render();
};

/* ======================
   SEARCH
====================== */
function getSearch() {
    return (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
}

/* ======================
   STATS
====================== */
function updateStats(items) {
    const total = items.length;
    const credit = items.reduce((s, c) => s + Number(c.creditBalance || 0), 0);

    setText("totalCustomers", total);
    setText("activeCustomers", items.filter(c => c.creditBalance > 0).length);
    setText("pendingCustomers", items.filter(c => c.status === "PENDING").length);
}

/* ======================
   HELPERS
====================== */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function money(v) {
    return `${Number(v || 0).toLocaleString()} MMK`;
}

function escape(s) {
    return String(s || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function status(c) {
    if (c.creditBalance <= 0) return "Clear";
    if (c.creditBalance >= c.creditLimit) return "Full";
    return "Active";
}