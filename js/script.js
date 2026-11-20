

/* HEADER (ALL PAGES) =================================
Bar menu behavor */
const header = document.querySelector(".header");

function updateHeaderOnScroll() {
  const threshold = header.offsetHeight;
  const hasScrolledPastHeader = window.scrollY > threshold;

  header.classList.toggle("header--scrolled", hasScrolledPastHeader);
}

window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
updateHeaderOnScroll();


/* BUTTON FOR SCROLLING TO TOP ======================= */
const upButton = document.querySelector("#btn-up");

function updateUpButtonVisibility() {
  upButton?.classList.toggle("is-visible", window.scrollY > window.innerHeight);
}

window.addEventListener("scroll", updateUpButtonVisibility, { passive: true });
window.addEventListener("resize", updateUpButtonVisibility);
updateUpButtonVisibility();

/* HERO CV DOWNLOAD MENU */
const cvToggle = document.querySelector("[data-cv-toggle]");
const cvMenu = document.querySelector("[data-cv-menu]");

function closeCvMenu({ restoreFocus = false } = {}) {
  if (!cvToggle || !cvMenu) return;
  cvMenu.hidden = true;
  cvToggle.setAttribute("aria-expanded", "false");
  if (restoreFocus) cvToggle.focus();
}

function positionCvMenu() {
  if (!cvToggle || !cvMenu || cvMenu.hidden) return;

  const buttonRect = cvToggle.getBoundingClientRect();
  const menuRect = cvMenu.getBoundingClientRect();
  const gap = 0;
  const left = Math.max(
    8,
    Math.min(buttonRect.left, window.innerWidth - menuRect.width - 8)
  );
  let top = buttonRect.bottom + gap;

  if (top + menuRect.height > window.innerHeight - 8) {
    top = buttonRect.top - menuRect.height - gap;
  }

  cvMenu.style.left = `${left}px`;
  cvMenu.style.top = `${Math.max(8, top)}px`;
}

cvToggle?.addEventListener("click", () => {
  const isExpanded = cvToggle.getAttribute("aria-expanded") === "true";
  cvToggle.setAttribute("aria-expanded", String(!isExpanded));
  cvMenu.hidden = isExpanded;
  if (!isExpanded) positionCvMenu();
});

window.addEventListener("resize", positionCvMenu);
window.addEventListener("scroll", positionCvMenu, true);

document.addEventListener("click", (event) => {
  if (!event.target.closest(".c-hero__cv") && !event.target.closest("#hero-cv-menu")) {
    closeCvMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cvMenu && !cvMenu.hidden) {
    closeCvMenu({ restoreFocus: true });
  }
});

upButton?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
  });
});



/* MAIN MENU MODAL AND CONTACT MODAL */
const menuToggle = document.querySelector(".header__menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const menuClose = document.querySelector(".mobile-menu__close");
const contactModal = document.querySelector("#contact-modal");
const contactDialog = contactModal?.querySelector(".c-contact-modal__dialog");
const contactOpeners = document.querySelectorAll("[data-contact-open]");
const contactCloseButtons = contactModal?.querySelectorAll(
  "[data-contact-close]"
);

let contactReturnFocus = null;

function setMenuOpen(isOpen, { restoreFocus = true } = {}) {
  if (!mobileMenu || !menuToggle) return;

  mobileMenu.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    menuClose?.focus();
  } else if (restoreFocus) {
    menuToggle.focus();
  }
}

function closeMobileMenuThen(callback) {
  if (!mobileMenu?.classList.contains("is-open")) {
    callback();
    return;
  }

  setMenuOpen(false, { restoreFocus: false });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    callback();
    return;
  }

  let completed = false;
  const finishClosing = () => {
    if (completed) return;
    completed = true;
    mobileMenu.removeEventListener("transitionend", onTransitionEnd);
    window.clearTimeout(fallbackTimer);
    callback();
  };

  const onTransitionEnd = (event) => {
    if (event.target === mobileMenu && event.propertyName === "transform") {
      finishClosing();
    }
  };

  mobileMenu.addEventListener("transitionend", onTransitionEnd);
  const fallbackTimer = window.setTimeout(finishClosing, 350);
}

function openContactModal(trigger) {
  if (!contactModal || !contactDialog) return;

  if (trigger.closest(".mobile-menu")) {
    // El menú se cierra antes de mostrar el contacto; al final el foco
    // regresará a la hamburguesa.
    contactReturnFocus = menuToggle;
    closeMobileMenuThen(() => {
      contactModal.inert = false;
      contactModal.setAttribute("aria-hidden", "false");
      contactModal.classList.add("is-open");
      requestAnimationFrame(() => contactDialog.focus());
    });
  } else {
    // En escritorio se restaura el foco al botón Contactar que abrió el modal.
    contactReturnFocus = trigger;
    contactModal.inert = false;
    contactModal.setAttribute("aria-hidden", "false");
    contactModal.classList.add("is-open");
    requestAnimationFrame(() => contactDialog.focus());
  }
}

function closeContactModal() {
  if (!contactModal) return;

  contactModal.classList.remove("is-open");
  contactModal.setAttribute("aria-hidden", "true");
  contactModal.inert = true;
  contactReturnFocus?.focus();
}

contactOpeners.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    if (trigger instanceof HTMLAnchorElement) event.preventDefault();
    openContactModal(trigger);
  });
});

contactCloseButtons?.forEach((button) => {
  button.addEventListener("click", closeContactModal);
});

// Permite cerrar al pulsar la cortina en escritorio.
contactModal?.addEventListener("click", (event) => {
  if (event.target === contactModal) closeContactModal();
});

menuToggle?.addEventListener("click", () => {
  setMenuOpen(true);
});

menuClose?.addEventListener("click", () => {
  setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (contactModal?.classList.contains("is-open")) {
    if (event.key === "Escape") {
      closeContactModal();
      return;
    }

    if (event.key === "Tab" && contactDialog) {
      const focusableElements = contactDialog.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement) {
        event.preventDefault();
        contactDialog.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === firstElement || document.activeElement === contactDialog)
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    return;
  }

  if (event.key === "Escape" && mobileMenu?.classList.contains("is-open")) {
    setMenuOpen(false);
  }
});



/* PORFOLIO =================================
Portfolio category filters */
const filterButtons = document.querySelectorAll(
  ".c-portfolio-projects__filter"
);
const projectCards = document.querySelectorAll(".project-card");

if (filterButtons.length && projectCards.length) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter;

      projectCards.forEach((card) => {
        const categories = (card.dataset.categories || "")
          .split(/\s+/)
          .filter(Boolean);

        card.hidden =
          selectedFilter !== "all" && !categories.includes(selectedFilter);
      });

      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;

        filterButton.setAttribute("aria-pressed", String(isActive));
        filterButton.classList.toggle("is-active", isActive);
        filterButton.classList.toggle("btn--primary", isActive);
        filterButton.classList.toggle("btn--secondary", !isActive);
      });
    });
  });
}



/* REUSABLE IMAGE VIEWER */
const imageViewer = document.querySelector("#image-viewer");
const imageViewerImage = imageViewer?.querySelector("[data-viewer-image]");
const viewerCloseButton = imageViewer?.querySelector("[data-viewer-close]");
const viewerPreviousButton = imageViewer?.querySelector("[data-viewer-prev]");
const viewerNextButton = imageViewer?.querySelector("[data-viewer-next]");

const projectGalleryImages = [
  ...document.querySelectorAll(".c-project-visuals__image"),
];

let activeViewerIndex = 0;
let viewerTouchStartX = 0;
let viewerReturnFocus = null;
let viewerTouchStartY = 0;

function showViewerImage(index) {
  if (!imageViewerImage || projectGalleryImages.length === 0) return;

  activeViewerIndex =
    (index + projectGalleryImages.length) % projectGalleryImages.length;

  const sourceImage = projectGalleryImages[activeViewerIndex];

  imageViewerImage.src = sourceImage.currentSrc || sourceImage.src;
  imageViewerImage.alt = sourceImage.alt;
}

function openImageViewer(index) {
  if (!imageViewer || !imageViewerImage) return;

  viewerReturnFocus = projectGalleryImages[index];
  showViewerImage(index);

  imageViewer.inert = false;
  imageViewer.setAttribute("aria-hidden", "false");
  imageViewer.classList.add("is-open");
  document.body.style.overflow = "hidden";

  viewerCloseButton?.focus();
}

function closeImageViewer() {
  if (!imageViewer) return;

  imageViewer.classList.remove("is-open");
  imageViewer.setAttribute("aria-hidden", "true");
  imageViewer.inert = true;
  document.body.style.overflow = "";

  viewerReturnFocus?.focus();
}

projectGalleryImages.forEach((image, index) => {
  image.addEventListener("click", () => openImageViewer(index));
});

viewerCloseButton?.addEventListener("click", closeImageViewer);

viewerPreviousButton?.addEventListener("click", () => {
  showViewerImage(activeViewerIndex - 1);
});

viewerNextButton?.addEventListener("click", () => {
  showViewerImage(activeViewerIndex + 1);
});

// Cerrar al hacer clic en el fondo del visualizador.
imageViewer?.addEventListener("click", (event) => {
  if (event.target === imageViewer) closeImageViewer();
});

// Navegación táctil: deslizar a izquierda o derecha.
imageViewerImage?.addEventListener(
  "touchstart",
  (event) => {
    viewerTouchStartX = event.changedTouches[0].clientX;
    viewerTouchStartY = event.changedTouches[0].clientY;
  },
  { passive: true }
);

imageViewerImage?.addEventListener(
  "touchend",
  (event) => {
    const swipeDistance =
      event.changedTouches[0].clientX - viewerTouchStartX;
    const verticalDistance =
      event.changedTouches[0].clientY - viewerTouchStartY;

    if (Math.abs(swipeDistance) < 50 || Math.abs(swipeDistance) < Math.abs(verticalDistance)) return;

    showViewerImage(activeViewerIndex + (swipeDistance < 0 ? 1 : -1));
  },
  { passive: true }
);

// Atajos de teclado para escritorio.
document.addEventListener("keydown", (event) => {
  if (!imageViewer?.classList.contains("is-open")) return;

  if (event.key === "Escape") closeImageViewer();
  if (event.key === "ArrowLeft") showViewerImage(activeViewerIndex - 1);
  if (event.key === "ArrowRight") showViewerImage(activeViewerIndex + 1);
});
