const pages = Array.from(document.querySelectorAll('.page'));
const navLinks = Array.from(document.querySelectorAll('[data-page-link]'));
const progressFill = document.querySelector('#progress-fill');
const controlButtons = Array.from(document.querySelectorAll('[data-target]'));

let activeIndex = 0;

function syncNavigation(index) {
  activeIndex = index;
  pages.forEach((page, pageIndex) => {
    page.classList.toggle('is-visible', pageIndex === index);
  });

  navLinks.forEach((link, linkIndex) => {
    const isActive = linkIndex === index;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  if (progressFill) {
    progressFill.style.width = `${((index + 1) / pages.length) * 100}%`;
  }
}

function scrollToPage(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const href = link.getAttribute('href');
    if (!href) return;
    scrollToPage(href.slice(1));
  });
});

controlButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    if (!targetId) return;
    scrollToPage(targetId);
  });
});

document.addEventListener('keydown', (event) => {
  const isTextField =
    event.target instanceof HTMLElement &&
    (event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.tagName === 'SELECT' ||
      event.target.isContentEditable);

  if (isTextField) return;

  if ((event.key === 'ArrowDown' || event.key === 'PageDown') && activeIndex < pages.length - 1) {
    event.preventDefault();
    scrollToPage(pages[activeIndex + 1].id);
  }

  if ((event.key === 'ArrowUp' || event.key === 'PageUp') && activeIndex > 0) {
    event.preventDefault();
    scrollToPage(pages[activeIndex - 1].id);
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

    if (!visibleEntry) return;

    const visibleIndex = pages.findIndex((page) => page === visibleEntry.target);
    if (visibleIndex >= 0) {
      syncNavigation(visibleIndex);
    }
  },
  {
    threshold: [0.25, 0.45, 0.65]
  }
);

pages.forEach((page) => observer.observe(page));
syncNavigation(0);
