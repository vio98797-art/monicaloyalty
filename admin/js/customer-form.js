import customerRepo from "./customerRepository.js";

const form = document.getElementById("customerForm");

const fields = {
    customerId: document.getElementById("customerId"),
    memberType: document.getElementById("memberType"),
    name: document.getElementById("name"),
    phone: document.getElementById("phone"),
    vehicle: document.getElementById("vehicle"),
    status: document.getElementById("status"),
    creditLimit: document.getElementById("creditLimit"),
    creditBalance: document.getElementById("creditBalance"),
    points: document.getElementById("points"),
    bonusPoints: document.getElementById("bonusPoints"),
    remarks: document.getElementById("remarks"),
};

let editingCustomerId = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    bindEvents();
    await checkEditMode();
}

function isLoggedIn() {
    return localStorage.getItem("admin_logged_in") === "true";
}

/* =========================
   EVENT BINDING
========================= */
function bindEvents() {
    form.addEventListener("submit", handleSubmit);

    fields.creditLimit.addEventListener("input", syncCreditBalance);

    document
        .querySelector(".back-btn")
        ?.addEventListener("click", () => {
            window.location.href = "customers.html";
        });
}

/* =========================
   EDIT MODE CHECK
========================= */
async function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!id) return;

    const customer = await customerRepo.get(id);
    if (!customer) return;

    editingCustomerId = id;
    fillForm(customer);
}

/* =========================
   FILL FORM (EDIT)
========================= */
function fillForm(c) {
    fields.customerId.value = c.customerId || "";
    fields.memberType.value = c.tier || "NORMAL";
    fields.name.value = c.name || "";
    fields.phone.value = c.phone || "";
    fields.vehicle.value = c.vehicle || "";
    fields.status.value = c.status || "ACTIVE";
    fields.creditLimit.value = c.creditLimit ?? 0;
    fields.creditBalance.value = c.creditBalance ?? 0;
    fields.points.value = c.points ?? 0;
    fields.bonusPoints.value = c.bonusPoints ?? 0;
    fields.remarks.value = c.remarks || "";
}

/* =========================
   SYNC CREDIT
========================= */
function syncCreditBalance() {
    fields.creditBalance.value = Number(fields.creditLimit.value || 0);
}

/* =========================
   SUBMIT HANDLER
========================= */
async function handleSubmit(e) {
    e.preventDefault();

    const payload = collectForm();

    if (!validate(payload)) return;

    try {
        if (editingCustomerId) {
            payload.customerId = editingCustomerId;
            await customerRepo.update(payload);
            toast("Customer updated successfully");
        } else {
            await customerRepo.create(payload);
            toast("Customer created successfully");
        }

        window.location.href = "customers.html";
    } catch (err) {
        console.error(err);
        alert("Something went wrong while saving customer");
    }
}

/* =========================
   COLLECT DATA
========================= */
function collectForm() {
    return {
        customerId: fields.customerId.value.trim(),
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        vehicle: fields.vehicle.value.trim(),
        status: fields.status.value,
        tier: fields.memberType.value,

        creditLimit: Number(fields.creditLimit.value || 0),
        creditBalance: Number(fields.creditBalance.value || 0),

        points: Number(fields.points.value || 0),
        bonusPoints: Number(fields.bonusPoints.value || 0),

        remarks: fields.remarks.value.trim(),
    };
}

/* =========================
   VALIDATION
========================= */
function validate(data) {
    if (!data.name) {
        alert("Customer name is required");
        return false;
    }

    if (!data.phone) {
        alert("Phone number is required");
        return false;
    }

    if (data.creditLimit < 0) {
        alert("Credit limit cannot be negative");
        return false;
    }

    return true;
}

/* =========================
   SIMPLE TOAST
========================= */
function toast(message) {
    const div = document.createElement("div");
    div.textContent = message;

    div.style.position = "fixed";
    div.style.bottom = "20px";
    div.style.right = "20px";
    div.style.background = "#111827";
    div.style.color = "#fff";
    div.style.padding = "12px 16px";
    div.style.borderRadius = "12px";
    div.style.zIndex = "9999";
    div.style.fontSize = "14px";

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2500);
}