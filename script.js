/*
 * روابط النشر الافتراضية
 * استبدل القيم الفارغة فقط بالروابط الفعلية قبل النشر.
 * مثال واتساب: https://wa.me/963XXXXXXXXX
 */
const DEFAULT_LINKS = Object.freeze({
  whatsapp: "https://whatsapp.com/channel/0029VbDoKfJ1noyzk0SF8W3J",
  telegram: "https://t.me/alnassarlibrary",
  facebook: "https://www.facebook.com/alnassarlibrary",
  instagram: "https://www.instagram.com/alnassarlibrary",
});

const LINK_LABELS = Object.freeze({
  whatsapp: "واتساب",
  telegram: "تلغرام",
  facebook: "فيسبوك",
  instagram: "إنستغرام",
});

const STORAGE_KEY = "alnassar-links-preview";
const EDIT_ACCESS_WORD = "amm";
const editMode = new URLSearchParams(window.location.search).get("edit") === EDIT_ACCESS_WORD;
const links = [...document.querySelectorAll("[data-link-key]")];
const customizer = document.querySelector("[data-customizer]");
const form = document.querySelector("[data-customizer-form]");
const message = document.querySelector("[data-form-message]");
const toast = document.querySelector("[data-toast]");
const tiltStage = document.querySelector("[data-tilt-stage]");
const supportsTilt =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let toastTimer;

function readSavedLinks() {
  try {
    return { ...DEFAULT_LINKS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return { ...DEFAULT_LINKS };
  }
}

function isValidWebUrl(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function showToast(text) {
  window.clearTimeout(toastTimer);
  toast.textContent = text;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function render(linkValues) {
  links.forEach((link) => {
    const key = link.dataset.linkKey;
    const value = linkValues[key]?.trim();
    const status = document.querySelector(`[data-status-for="${key}"]`);

    link.href = value || "#";
    link.target = value ? "_blank" : "";
    link.rel = value ? "noopener noreferrer" : "";
    link.classList.toggle("is-configured", Boolean(value));
    link.setAttribute(
      "aria-label",
      value ? `${LINK_LABELS[key]} — فتح الرابط` : `${LINK_LABELS[key]} — رابط تجريبي غير مضاف`,
    );
    status.textContent = value || status.dataset.placeholder || status.textContent;
  });
}

function rememberPlaceholderLabels() {
  document.querySelectorAll("[data-status-for]").forEach((element) => {
    element.dataset.placeholder = element.textContent;
  });
}

function populateForm(linkValues) {
  Object.entries(linkValues).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value;
  });
}

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.classList.contains("is-configured")) return;

    event.preventDefault();
    showToast("هذا رابط تجريبي. اختر «تخصيص الروابط» لإضافة الرابط الفعلي.");
  });
});

document.querySelector("[data-open-customizer]").addEventListener("click", () => {
  populateForm(readSavedLinks());
  message.textContent = "";
  customizer.showModal();
});

document.querySelector("[data-close-customizer]").addEventListener("click", () => {
  customizer.close();
});

customizer.addEventListener("click", (event) => {
  if (event.target === customizer) customizer.close();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = Object.fromEntries(
    Object.keys(DEFAULT_LINKS).map((key) => [key, form.elements[key].value.trim()]),
  );

  const invalidKey = Object.keys(values).find((key) => !isValidWebUrl(values[key]));
  if (invalidKey) {
    message.textContent = `تحقق من رابط ${LINK_LABELS[invalidKey]}؛ يجب أن يبدأ بـ https:// أو http://`;
    form.elements[invalidKey].focus();
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  render(values);
  customizer.close();
  showToast("تم حفظ روابط المعاينة على هذا الجهاز.");
});

document.querySelector("[data-reset-links]").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  populateForm(DEFAULT_LINKS);
  render(DEFAULT_LINKS);
  message.textContent = "تمت إعادة الروابط إلى الحالة التجريبية.";
});

rememberPlaceholderLabels();

if (editMode) {
  document.querySelector("[data-open-customizer]").hidden = false;
}

render(editMode ? readSavedLinks() : DEFAULT_LINKS);

if (tiltStage && supportsTilt) {
  tiltStage.addEventListener("pointermove", (event) => {
    const bounds = tiltStage.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width;
    const vertical = (event.clientY - bounds.top) / bounds.height;
    const rotateY = (horizontal - 0.5) * 9;
    const rotateX = (0.5 - vertical) * 7;

    tiltStage.style.setProperty("--tilt-x", `${rotateY.toFixed(2)}deg`);
    tiltStage.style.setProperty("--tilt-y", `${rotateX.toFixed(2)}deg`);
    tiltStage.style.setProperty("--light-x", `${(horizontal * 100).toFixed(1)}%`);
    tiltStage.style.setProperty("--light-y", `${(vertical * 100).toFixed(1)}%`);
  });

  tiltStage.addEventListener("pointerleave", () => {
    tiltStage.style.setProperty("--tilt-x", "0deg");
    tiltStage.style.setProperty("--tilt-y", "0deg");
    tiltStage.style.setProperty("--light-x", "50%");
    tiltStage.style.setProperty("--light-y", "16%");
  });
}
