/* ============================================================
   script.js — SalesFlow Dashboard Logic
   All KPI values are derived from the salesData array below.
============================================================ */

// ── 1. DATA ──────────────────────────────────────────────────
const salesData = [
  { id: "SF98765", date: "2024-07-29", customer: "Alice Johnson",  amount: 450.00, status: "Completed" },
  { id: "SF98764", date: "2024-07-28", customer: "Bob Williams",   amount: 120.50, status: "Pending"   },
  { id: "SF98763", date: "2024-07-28", customer: "Charlie Brown",  amount: 89.99,  status: "Completed" },
  { id: "SF98762", date: "2024-07-27", customer: "Diana Prince",   amount: 780.25, status: "Completed" },
  { id: "SF98761", date: "2024-07-27", customer: "Eve Adams",      amount: 300.00, status: "Cancelled" },
];

// Monthly Sales + Returns data for the chart
const monthlyData = {
  labels:   ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  sales:    [1650, 2200, 2600, 2250, 2950, 3050],
  returns:  [130,  160,  185,  125,  155,  145],
};

// ── 2. HELPERS ────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toISOString().slice(0, 10).replace(/-/g, "-");
};

// ── 3. COMPUTE KPIs ───────────────────────────────────────────
function computeKPIs() {
  // Only count non-cancelled rows for sales/revenue totals
  const active = salesData.filter((r) => r.status !== "Cancelled");
  const completedAmounts = active.map((r) => r.amount);
  const totalSales     = completedAmounts.reduce((a, b) => a + b, 0);
  const totalRevenue   = totalSales * 0.273; // simulate revenue margin (~27.3 %)
  const totalTx        = salesData.length;

  // Top selling: highest single completed transaction
  const topRow = [...active].sort((a, b) => b.amount - a.amount)[0];

  // Fake "last month" deltas for flavour
  const salesDelta  = "+20.1% from last month";
  const revenueDelta= "+15.5% from last month";
  const txDelta     = "+10.2% from last month";

  return { totalSales, totalRevenue, totalTx, topRow, salesDelta, revenueDelta, txDelta };
}

// ── 4. RENDER KPIs ────────────────────────────────────────────
function renderKPIs() {
  const { totalSales, totalRevenue, totalTx, topRow, salesDelta, revenueDelta, txDelta } = computeKPIs();

  document.getElementById("totalSales").textContent        = fmt(totalSales);
  document.getElementById("totalRevenue").textContent      = fmt(totalRevenue);
  document.getElementById("totalTransactions").textContent = totalTx.toLocaleString();
  document.getElementById("topSellingItem").textContent    = topRow ? topRow.customer.split(" ")[0] + "'s Order" : "–";

  document.getElementById("salesDelta").textContent        = salesDelta;
  document.getElementById("revenueDelta").textContent      = revenueDelta;
  document.getElementById("transactionsDelta").textContent = txDelta;
}

// ── 5. RENDER TABLE ───────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById("salesTableBody");
  tbody.innerHTML = salesData.map((row) => {
    const statusClass = `status-${row.status.toLowerCase()}`;
    return `
      <tr>
        <td><strong>${row.id}</strong></td>
        <td>${fmtDate(row.date)}</td>
        <td>${row.customer}</td>
        <td>${fmt(row.amount)}</td>
        <td><span class="status-badge ${statusClass}">${row.status}</span></td>
      </tr>`;
  }).join("");
}

// ── 6. RENDER CHART ───────────────────────────────────────────
function renderChart() {
  const ctx = document.getElementById("salesChart").getContext("2d");

  // Gradient for sales bars
  const salesGrad = ctx.createLinearGradient(0, 0, 0, 240);
  salesGrad.addColorStop(0, "rgba(46,109,230,0.95)");
  salesGrad.addColorStop(1, "rgba(46,109,230,0.65)");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: monthlyData.labels,
      datasets: [
        {
          label: "Sales",
          data: monthlyData.sales,
          backgroundColor: salesGrad,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        },
        {
          label: "Returns",
          data: monthlyData.returns,
          backgroundColor: "rgba(239,68,68,0.80)",
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1a2035",
          titleColor: "#a8b4cc",
          bodyColor: "#fff",
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#6b7a99", font: { family: "DM Sans", size: 12 } },
          border: { display: false },
        },
        y: {
          grid: { color: "rgba(229,234,244,0.7)", drawTicks: false },
          ticks: {
            color: "#6b7a99",
            font: { family: "DM Sans", size: 12 },
            callback: (v) => v.toLocaleString(),
            maxTicksLimit: 5,
            padding: 8,
          },
          border: { display: false },
        },
      },
    },
  });
}

// ── 7. DATE ───────────────────────────────────────────────────
function setDate() {
  const el = document.getElementById("currentDate");
  if (!el) return;
  const d = new Date();
  const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months= ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  el.textContent = `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
}

// ── 8. SIDEBAR TOGGLE ─────────────────────────────────────────
function initSidebar() {
  const hamburger = document.getElementById("hamburger");
  const sidebar   = document.getElementById("sidebar");
  const overlay   = document.getElementById("sidebarOverlay");

  const open  = () => { sidebar.classList.add("open"); overlay.classList.add("active"); };
  const close = () => { sidebar.classList.remove("open"); overlay.classList.remove("active"); };

  hamburger.addEventListener("click", () =>
    sidebar.classList.contains("open") ? close() : open()
  );
  overlay.addEventListener("click", close);
}

// ── 9. RECENT VIEWS ACCORDION ─────────────────────────────────
function initAccordion() {
  const toggle  = document.getElementById("recentViewsToggle");
  const links   = document.getElementById("recentLinks");
  const chevron = document.getElementById("chevronIcon");

  toggle.addEventListener("click", () => {
    const isOpen = !links.classList.contains("collapsed");
    links.classList.toggle("collapsed", isOpen);
    chevron.classList.toggle("open", !isOpen);
  });
}

// ── 10. INIT ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setDate();
  renderKPIs();
  renderTable();
  renderChart();
  initSidebar();
  initAccordion();
});
