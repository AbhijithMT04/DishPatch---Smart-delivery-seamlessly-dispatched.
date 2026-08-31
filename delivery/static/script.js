document.addEventListener("DOMContentLoaded", function () {
  // Ask for confirmation before any "delete" link is followed,
  
  document.querySelectorAll(".js-confirm-delete").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var ok = confirm("Delete this restaurant? This can't be undone.");
      if (!ok) {
        e.preventDefault();
      }
    });
  });

  // Generic "back" buttons that don't depend on a specific URL name.
  document.querySelectorAll(".js-back").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.history.back();
    });
  });
});