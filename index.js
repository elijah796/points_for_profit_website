(function () {
  const openBtn = document.getElementById("nav-hamburger");
  const menu = document.getElementById("mobile-menu");
  const closeBtn = document.getElementById("mobile-menu-close");

  if (!openBtn || !menu || !closeBtn) return;

  const links = menu.querySelectorAll(".mobile-menu-link");

  function openMenu() {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // prevent background scroll
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // restore scroll
  }

  openBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);

  // Close if clicking the dark overlay (outside the panel)
  menu.addEventListener("click", (e) => {
    if (e.target === menu) closeMenu();
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  // Close after clicking a link
  links.forEach((a) => a.addEventListener("click", closeMenu));
})();