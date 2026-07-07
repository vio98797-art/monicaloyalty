// admin/js/customers.js

const STORAGE_KEY = "monica_customers";

document.addEventListener("DOMContentLoaded", init);

function init() {
if (!isLoggedIn()) {
window.location.href = "login.html";
return;
}

```
seedCustomersIfEmpty();
bindEvents();
applyTheme(getSavedTheme());
renderCustomers();
```

}

function isLoggedIn() {
return localStorage.getItem("admin_logged_in") === "true";
}

function bindEvents() {
document.getElementById("logoutBtn")?.addEventListener("click", logout);
document.getElementById("themeBtn")?.addEventListener("click", toggleTheme);
document.getElementById("searchInput")?.addEventListener("input", renderCustomers);
document.getElementById("addCustomerBtn")?.addEventListener("click", addCustomer);
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

function getCustomers() {
try {
const raw = localStorage.getItem(STORAGE_KEY);
const data = raw ? JSON.parse(raw) : [];
return Array.isArray(data) ? data : [];
} catch {
return [];
}
}

function saveCustomers(items) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function seedCustomersIfEmpty() {
const items = getCustomers();
if (items.length) return;

```
const sample = [
    {
        customerId: uid(),
        name: "မင်းလှ Lal Tin",
        phone: "---",
        creditLimit: 20000,
        creditBalance: 20000,
        totalSales: 20000,
        joinedAt: "2026-05-19",
        status: "active",
    },
    {
        customerId: uid(),
        name: "Nau Sui Nu",
        phone: "---",
        creditLimit: 48000,
        creditBalance: 48000,
        totalSales: 48000,
        joinedAt: "2026-05-20",
        status: "active",
    },
    {
        customerId: uid(),
        name: "မနှင်း",
        phone: "---",
        creditLimit: 15000,
        creditBalance: 15000,
        totalSales: 15000,
        joinedAt: "2026-06-22",
        status: "active",
    },
];

saveCustomers(sample);
```

}

function renderCustomers() {
const tbody = document.getElementById("customersTable");
if (!tbody) return;

```
const query = getSearchValue();
const all = getCustomers();

updateStats(all);

const filtered = all.filter((item) => {
    const text = [
        item.name,
        item.phone,
        item.creditLimit,
        item.creditBalance,
        item.totalSales,
        item.status,
        item.joinedAt,
    ]
        .join(" ")
        .toLowerCase();

    return text.includes(query);
});

if (!filtered.length) {
    tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;padding:24px;">
                No customers found.
            </td>
        </tr>
    `;
    return;
}

filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

tbody.innerHTML = filtered.map((customer) => `
    <tr>
        <td>${escapeHtml(customer.name || "")}</td>
        <td>${escapeHtml(customer.phone || "---")}</td>
        <td>${formatMoney(customer.creditLimit)}</td>
        <td>${formatMoney(customer.creditBalance)}</td>
        <td>${badgeHtml(getStatusLabel(customer), getStatusClass(customer))}</td>
        <td>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="login-btn" type="button" style="width:auto;padding:10px 14px;" onclick="window.__editCustomer('${customer.customerId}')">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="login-btn" type="button" style="width:auto;padding:10px 14px;background:linear-gradient(135deg,#FF5B6E,#FF7A8A);" onclick="window.__deleteCustomer('${customer.customerId}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>
`).join("");
```

}

function updateStats(all) {
const totalCustomers = all.length;
const activeCredit = all.reduce((sum, c) => sum + Number(c.creditBalance || 0), 0);
const monthlySales = all.reduce((sum, c) => sum + Number(c.totalSales || 0), 0);
const pendingPayments = all.filter((c) => Number(c.creditBalance || 0) > 0).length;

```
setText("totalCustomers", String(totalCustomers));
setText("activeCredit", formatMoney(activeCredit));
setText("monthlySales", formatMoney(monthlySales));
setText("pendingPayments", String(pendingPayments));
```

}

function addCustomer() {
const name = prompt("Customer name:");
if (name === null) return;
if (!name.trim()) return alert("Customer name is required.");

```
const phone = prompt("Phone number:", "---");
if (phone === null) return;

const creditLimit = prompt("Credit limit:", "50000");
if (creditLimit === null) return;

const items = getCustomers();
items.unshift({
    customerId: uid(),
    name: name.trim(),
    phone: phone.trim() || "---",
    creditLimit: Number(creditLimit) || 0,
    creditBalance: Number(creditLimit) || 0,
    totalSales: 0,
    joinedAt: formatDateInput(new Date()),
    status: "active",
});

saveCustomers(items);
renderCustomers();
```

}

function editCustomer(id) {
const items = getCustomers();
const customer = items.find((c) => c.customerId === id);
if (!customer) return;

```
const name = prompt("Customer name:", customer.name || "");
if (name === null) return;

const phone = prompt("Phone number:", customer.phone || "---");
if (phone === null) return;

const creditLimit = prompt("Credit limit:", String(customer.creditLimit ?? 0));
if (creditLimit === null) return;

const balance = prompt("Current balance:", String(customer.creditBalance ?? 0));
if (balance === null) return;

customer.name = name.trim();
customer.phone = phone.trim() || "---";
customer.creditLimit = Number(creditLimit) || 0;
customer.creditBalance = Number(balance) || 0;
customer.status = customer.creditBalance > 0 ? "active" : "clear";

saveCustomers(items);
renderCustomers();
```

}

function deleteCustomer(id) {
const items = getCustomers();
const customer = items.find((c) => c.customerId === id);
if (!customer) return;

```
const ok = confirm(`Delete customer "${customer.name}"?`);
if (!ok) return;

saveCustomers(items.filter((c) => c.customerId !== id));
renderCustomers();
```

}

function getSearchValue() {
return (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
}

function badgeHtml(text, cls) {
return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

function getStatusLabel(customer) {
if (Number(customer.creditBalance || 0) <= 0) return "Clear";
if (Number(customer.creditBalance || 0) >= Number(customer.creditLimit || 0)) return "Full Credit";
return "Active";
}

function getStatusClass(customer) {
if (Number(customer.creditBalance || 0) <= 0) return "success";
if (Number(customer.creditBalance || 0) >= Number(customer.creditLimit || 0)) return "warning";
return "primary";
}

function formatMoney(value) {
const num = Number(value);
if (Number.isNaN(num)) return "0 MMK";
return `${num.toLocaleString()} MMK`;
}

function setText(id, value) {
const el = document.getElementById(id);
if (el) el.textContent = value;
}

function formatDateInput(date) {
const d = new Date(date);
const y = d.getFullYear();
const m = String(d.getMonth() + 1).padStart(2, "0");
const day = String(d.getDate()).padStart(2, "0");
return `${y}-${m}-${day}`;
}

function uid() {
return `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
return String(value)
.replaceAll("&", "&")
.replaceAll("<", "<")
.replaceAll(">", ">")
.replaceAll('"', """)
.replaceAll("'", "'");
}

window.__editCustomer = editCustomer;
window.__deleteCustomer = deleteCustomer;
