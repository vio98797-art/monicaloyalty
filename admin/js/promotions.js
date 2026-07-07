// admin/js/settings.js
document.addEventListener("DOMContentLoaded", init);

function init() {
if (!isLoggedIn()) {
window.location.href = "login.html";
return;
}

```
loadSettings();
bindEvents();
applyTheme(getSavedTheme());
```

}

function isLoggedIn() {
return localStorage.getItem("admin_logged_in") === "true";
}

function bindEvents() {
const logoutBtn = document.getElementById("logoutBtn");
const themeBtn = document.getElementById("themeBtn");
const saveBtn = document.getElementById("saveSettingsBtn");
const backupBtn = document.getElementById("backupBtn");
const restoreBtn = document.getElementById("restoreBtn");
const restoreFile = document.getElementById("restoreFile");

```
logoutBtn?.addEventListener("click", logout);
themeBtn?.addEventListener("click", toggleTheme);
saveBtn?.addEventListener("click", saveSettings);
backupBtn?.addEventListener("click", backupData);
restoreBtn?.addEventListener("click", () => restoreFile?.click());
restoreFile?.addEventListener("change", handleRestoreFile);
```

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
    icon.className = theme === "dark"
        ? "fa-solid fa-sun"
        : "fa-solid fa-moon";
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
const nextTheme = getSavedTheme() === "dark" ? "light" : "dark";
applyTheme(nextTheme);
}

function loadSettings() {
const settings = {
companyName: localStorage.getItem("monica_companyName") || "Monica Energy",
companyTag: localStorage.getItem("monica_companyTag") || "Customer Management Service",
fuel92: localStorage.getItem("monica_fuel92") || "",
fuel95: localStorage.getItem("monica_fuel95") || "",
diesel: localStorage.getItem("monica_diesel") || "",
creditLimit: localStorage.getItem("monica_creditLimit") || "50000",
adminUsername: localStorage.getItem("admin_username") || "admin",
adminPassword: localStorage.getItem("admin_password") || "admin123",
};

```
setValue("companyName", settings.companyName);
setValue("companyTag", settings.companyTag);
setValue("fuel92", settings.fuel92);
setValue("fuel95", settings.fuel95);
setValue("diesel", settings.diesel);
setValue("creditLimit", settings.creditLimit);
setValue("adminUsername", settings.adminUsername);
setValue("adminPassword", settings.adminPassword);
```

}

function saveSettings() {
setItem("monica_companyName", getValue("companyName"));
setItem("monica_companyTag", getValue("companyTag"));
setItem("monica_fuel92", getValue("fuel92"));
setItem("monica_fuel95", getValue("fuel95"));
setItem("monica_diesel", getValue("diesel"));
setItem("monica_creditLimit", getValue("creditLimit"));
setItem("admin_username", getValue("adminUsername"));
setItem("admin_password", getValue("adminPassword"));

```
showToast("Settings saved successfully.");
```

}

function backupData() {
const backup = {
settings: {
companyName: localStorage.getItem("monica_companyName") || "",
companyTag: localStorage.getItem("monica_companyTag") || "",
fuel92: localStorage.getItem("monica_fuel92") || "",
fuel95: localStorage.getItem("monica_fuel95") || "",
diesel: localStorage.getItem("monica_diesel") || "",
creditLimit: localStorage.getItem("monica_creditLimit") || "",
adminUsername: localStorage.getItem("admin_username") || "",
},
app: {
admin_logged_in: localStorage.getItem("admin_logged_in") || "",
admin_theme: localStorage.getItem("admin_theme") || "light",
},
exportedAt: new Date().toISOString(),
};

```
const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
});

const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `monica_energy_backup_${formatDateForFile(new Date())}.json`;
document.body.appendChild(a);
a.click();
a.remove();
URL.revokeObjectURL(url);

showToast("Backup file downloaded.");
```

}

async function handleRestoreFile(event) {
const file = event.target.files?.[0];
if (!file) return;

```
try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data?.settings) {
        const s = data.settings;
        if (s.companyName !== undefined) setItem("monica_companyName", s.companyName);
        if (s.companyTag !== undefined) setItem("monica_companyTag", s.companyTag);
        if (s.fuel92 !== undefined) setItem("monica_fuel92", s.fuel92);
        if (s.fuel95 !== undefined) setItem("monica_fuel95", s.fuel95);
        if (s.diesel !== undefined) setItem("monica_diesel", s.diesel);
        if (s.creditLimit !== undefined) setItem("monica_creditLimit", s.creditLimit);
        if (s.adminUsername !== undefined) setItem("admin_username", s.adminUsername);
    }

    if (data?.app) {
        const a = data.app;
        if (a.admin_theme) setItem("admin_theme", a.admin_theme);
        if (a.admin_logged_in) setItem("admin_logged_in", a.admin_logged_in);
    }

    loadSettings();
    applyTheme(getSavedTheme());
    showToast("Data restored successfully.");
} catch (error) {
    console.error(error);
    showToast("Restore failed. Invalid JSON file.");
} finally {
    event.target.value = "";
}
```

}

function getValue(id) {
return document.getElementById(id)?.value?.trim() || "";
}

function setValue(id, value) {
const el = document.getElementById(id);
if (el) el.value = value ?? "";
}

function setItem(key, value) {
localStorage.setItem(key, String(value));
}

function formatDateForFile(date) {
const y = date.getFullYear();
const m = String(date.getMonth() + 1).padStart(2, "0");
const d = String(date.getDate()).padStart(2, "0");
return `${y}${m}${d}`;
}

function showToast(message) {
let toast = document.getElementById("appToast");

```
if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.style.position = "fixed";
    toast.style.right = "20px";
    toast.style.bottom = "20px";
    toast.style.zIndex = "9999";
    toast.style.padding = "14px 18px";
    toast.style.borderRadius = "14px";
    toast.style.background = "rgba(15, 23, 42, 0.92)";
    toast.style.color = "#fff";
    toast.style.boxShadow = "0 14px 30px rgba(0,0,0,.18)";
    toast.style.fontFamily = "Poppins, sans-serif";
    toast.style.fontSize = "14px";
    toast.style.maxWidth = "90vw";
    toast.style.transform = "translateY(10px)";
    toast.style.opacity = "0";
    toast.style.transition = "all .25s ease";
    document.body.appendChild(toast);
}

toast.textContent = message;

requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
});

clearTimeout(window.__toastTimer);
window.__toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
}, 2200);
```

}
