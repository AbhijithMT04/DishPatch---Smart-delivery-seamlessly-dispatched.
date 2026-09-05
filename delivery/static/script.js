document.addEventListener("DOMContentLoaded", function () {
  initDeleteConfirm();
  initBackButtons();
  initNavShadow();
  initAddToCart();
  initRemoveFromCart();
});

function initDeleteConfirm() {
  document.querySelectorAll(".js-confirm-delete").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var row = link.closest(".row-card");
      var nameEl = row ? row.querySelector(".name") : null;
      var label = nameEl ? nameEl.textContent.trim() : "this item";
      var href = link.getAttribute("href");

      showConfirmDialog({
        title: "Delete " + label + "?",
        body: "This removes it for good. There's no undo.",
        confirmLabel: "Delete",
        onConfirm: function () {
          window.location.href = href;
        }
      });
    });
  });
}

function initBackButtons() {
  document.querySelectorAll(".js-back").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.history.back();
    });
  });
}

function initNavShadow() {
  var nav = document.querySelector(".navbar");
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 4);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initAddToCart() {
  document.querySelectorAll(".js-add-to-cart").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      var href = link.getAttribute("href");
      var row = link.closest(".row-card");
      var nameEl = row ? row.querySelector(".name") : null;
      var label = link.dataset.itemName || (nameEl ? nameEl.textContent.trim() : "Item");
      var originalText = link.textContent;

      link.textContent = "Adding…";
      link.style.pointerEvents = "none";

      fetch(href, { credentials: "same-origin" })
        .then(function (res) {
          link.textContent = originalText;
          link.style.pointerEvents = "";
          if (res.ok) {
            showToast(label + " added to cart");
          } else {
            window.location.href = href;
          }
        })
        .catch(function () {
          window.location.href = href;
        });
    });
  });
}

function initRemoveFromCart() {
  document.querySelectorAll(".js-remove-cart-item").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      var href = link.getAttribute("href");
      var row = link.closest(".row-card");
      var price = parseFloat(link.dataset.price) || 0;

      link.style.pointerEvents = "none";

      fetch(href, { credentials: "same-origin" })
        .then(function (res) {
          if (res.ok) {
            removeCartRow(row, price);
          } else {
            link.style.pointerEvents = "";
            window.location.href = href;
          }
        })
        .catch(function () {
          window.location.href = href;
        });
    });
  });
}

function removeCartRow(row, price) {
  row.style.transition = "opacity 0.2s ease, transform 0.2s ease";
  row.style.opacity = "0";
  row.style.transform = "translateX(8px)";

  setTimeout(function () {
    row.remove();
    updateCartTotal(-price);
    checkCartEmpty();
  }, 200);
}

function updateCartTotal(delta) {
  var totalEl = document.getElementById("cart-total");
  if (!totalEl) return;
  var current = parseFloat(totalEl.textContent.replace(/[^0-9.-]/g, "")) || 0;
  var updated = Math.max(0, current + delta);
  totalEl.textContent = "\u20B9" + updated.toFixed(2);
}

function checkCartEmpty() {
  var container = document.getElementById("cart-items");
  if (!container || container.children.length > 0) return;

  var summary = document.getElementById("cart-summary");
  var form = document.getElementById("checkout-form");
  var emptyMsg = document.getElementById("cart-empty-msg");

  if (summary) summary.style.display = "none";
  if (form) form.style.display = "none";
  if (emptyMsg) emptyMsg.style.display = "block";
}

var toastTimer = null;
function showToast(message) {
  var toast = document.querySelector(".dp-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "dp-toast";
    toast.innerHTML = '<span class="dp-toast-icon">\u2713</span><span class="dp-toast-text"></span>';
    document.body.appendChild(toast);
  }
  toast.querySelector(".dp-toast-text").textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 2200);
}

function showConfirmDialog(opts) {
  var overlay = document.createElement("div");
  overlay.className = "dp-overlay";
  overlay.innerHTML =
    '<div class="dp-dialog" role="alertdialog" aria-modal="true" aria-labelledby="dp-dialog-title">' +
      '<h3 id="dp-dialog-title"></h3>' +
      "<p></p>" +
      '<div class="dp-dialog-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="cancel">Cancel</button>' +
        '<button type="button" class="btn btn-danger btn-solid btn-sm" data-action="confirm"></button>' +
      "</div>" +
    "</div>";

  overlay.querySelector("h3").textContent = opts.title;
  overlay.querySelector("p").textContent = opts.body;
  overlay.querySelector('[data-action="confirm"]').textContent = opts.confirmLabel;

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  function close() {
    overlay.remove();
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
  }
  function onKeydown(e) {
    if (e.key === "Escape") close();
  }

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });
  overlay.querySelector('[data-action="cancel"]').addEventListener("click", close);
  overlay.querySelector('[data-action="confirm"]').addEventListener("click", function () {
    close();
    opts.onConfirm();
  });
  document.addEventListener("keydown", onKeydown);

  overlay.querySelector('[data-action="confirm"]').focus();
}