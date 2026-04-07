const pages = Array.from(document.querySelectorAll('.page'));
const navLinks = Array.from(document.querySelectorAll('[data-page-link]'));
const progressFill = document.querySelector('#progress-fill');
const railToggle = document.querySelector('#rail-toggle');
const railBackdrop = document.querySelector('#rail-backdrop');

const railStateKey = 'ai-assignment-site:rail-collapsed';
const mobileRailQuery = window.matchMedia('(max-width: 1100px)');

let activeIndex = 0;

function setRailCollapsed(collapsed, { persist = !mobileRailQuery.matches } = {}) {
  document.body.dataset.railCollapsed = collapsed ? 'true' : 'false';
  document.body.dataset.mobileRail = mobileRailQuery.matches ? 'true' : 'false';

  if (railToggle) {
    railToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    railToggle.setAttribute(
      'title',
      mobileRailQuery.matches
        ? collapsed
          ? '打开导航'
          : '关闭导航'
        : collapsed
          ? '展开侧边栏'
          : '收起侧边栏'
    );
  }

  if (railBackdrop) {
    railBackdrop.hidden = !(mobileRailQuery.matches && !collapsed);
  }

  if (persist) {
    try {
      localStorage.setItem(railStateKey, collapsed ? 'true' : 'false');
    } catch {
      // Ignore storage failures and keep the in-memory UI state.
    }
  }
}

function readRailCollapsed() {
  try {
    return localStorage.getItem(railStateKey) === 'true';
  } catch {
    return false;
  }
}

function syncRailMode() {
  document.body.dataset.mobileRail = mobileRailQuery.matches ? 'true' : 'false';

  if (mobileRailQuery.matches) {
    setRailCollapsed(true, { persist: false });
    return;
  }

  setRailCollapsed(readRailCollapsed(), { persist: false });
}

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

    if (mobileRailQuery.matches) {
      setRailCollapsed(true, { persist: false });
    }
  });
});

if (railToggle) {
  railToggle.addEventListener('click', () => {
    const collapsed = document.body.dataset.railCollapsed === 'true';
    setRailCollapsed(!collapsed, { persist: !mobileRailQuery.matches });
  });
}

if (railBackdrop) {
  railBackdrop.addEventListener('click', () => {
    setRailCollapsed(true, { persist: false });
  });
}

document.addEventListener('keydown', (event) => {
  const isTextField =
    event.target instanceof HTMLElement &&
    (event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.tagName === 'SELECT' ||
      event.target.isContentEditable);

  if (isTextField) return;

  if (
    event.key === 'Escape' &&
    mobileRailQuery.matches &&
    document.body.dataset.railCollapsed !== 'true'
  ) {
    event.preventDefault();
    setRailCollapsed(true, { persist: false });
    return;
  }

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

if (typeof mobileRailQuery.addEventListener === 'function') {
  mobileRailQuery.addEventListener('change', syncRailMode);
} else if (typeof mobileRailQuery.addListener === 'function') {
  mobileRailQuery.addListener(syncRailMode);
}

syncRailMode();
syncNavigation(0);
