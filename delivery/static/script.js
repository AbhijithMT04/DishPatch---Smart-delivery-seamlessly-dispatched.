document.addEventListener("DOMContentLoaded", function () {
  initDeleteConfirm();
  initBackButtons();
  initNavShadow();
  initAddToCart();
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