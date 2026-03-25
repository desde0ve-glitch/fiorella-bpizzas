// ═══════════════════════════════════════════
//  branch.js — Lógica de la pantalla de sucursales
// ═══════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  renderBranchList();
});

function renderBranchList() {
  const list = document.getElementById("branchList");

  list.innerHTML = BRANCHES.map((branch, index) => {
    const phonesHTML = branch.phones
      .map(p => formatPhoneDisplay(p))
      .join(" &nbsp;·&nbsp; ");

    return `
      <button
        class="branch-card slide-up"
        style="animation-delay: ${index * 0.08}s"
        onclick="selectBranch('${branch.id}')"
        aria-label="Seleccionar sucursal ${branch.name}"
      >
        <div class="branch-icon" aria-hidden="true">${branch.icon}</div>
        <div class="branch-info">
          <div class="branch-name">${branch.name}</div>
          <div class="branch-addr">${branch.addr}</div>
          <div class="branch-phones">${phonesHTML}</div>
        </div>
        <div class="branch-arrow" aria-hidden="true">→</div>
      </button>
    `;
  }).join("");
}

function formatPhoneDisplay(phone) {
  // 584220459596 → 0422-045-95-96
  const local = "0" + phone.slice(2); // remove country code 58, add 0
  if (local.length === 11) {
    return local.replace(/^(0\d{3})(\d{3})(\d{2})(\d{2})$/, "$1-$2-$3-$4");
  }
  return local;
}

function selectBranch(branchId) {
  // Store selection in sessionStorage so menu.html can read it
  sessionStorage.setItem("selectedBranch", branchId);

  // Navigate to menu
  window.location.href = "menu.html";
}
