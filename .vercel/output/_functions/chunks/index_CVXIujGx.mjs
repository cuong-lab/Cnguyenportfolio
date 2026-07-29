import { n as $$Image, s as __exportAll } from "./_astro_assets_jXD1WK_d.mjs";
import { C as createAstro, _ as addAttribute, a as renderComponent, c as renderSlot, d as renderTemplate, g as renderHead, h as maybeRenderHead, n as renderScript, v as defineScriptVars, w as createComponent, x as unescapeHTML } from "./server_BETefGXa.mjs";
import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
//#region \0sanity:client
var sanityClient = createClient({
	"apiVersion": "2025-05-01",
	"projectId": "yrg3sjk0",
	"dataset": "production",
	"useCdn": false
});
//#endregion
//#region astro:scripts/page-ssr.js
globalThis.sanityClient = sanityClient;
var vi_default = {
	nav: {
		"ariaLabel": "Điều hướng chính",
		"about": "Giới thiệu",
		"services": "Dịch vụ",
		"work": "Dự án",
		"contact": "Liên hệ",
		"resume": "Resume"
	},
	actions: {
		"viewProjects": "Xem dự án",
		"contactNow": "Liên hệ ngay",
		"viewMoreWork": "Xem thêm tác phẩm",
		"viewServices": "Xem chi tiết dịch vụ",
		"viewAllProjects": "Xem tất cả dự án",
		"bookNow": "Đặt lịch"
	},
	resume: {
		"role": "Vai trò",
		"skills": "Kỹ năng",
		"outcomes": "Thành tựu",
		"description": "Mô tả",
		"scrollHint": "(Cuộn xuống)",
		"experience": "Kinh nghiệm",
		"prevAria": "Kinh nghiệm trước",
		"nextAria": "Kinh nghiệm sau"
	},
	about: { "strengths": "Điểm mạnh" },
	project: {
		"client": "Khách hàng",
		"year": "Năm",
		"role": "Vai trò",
		"overview": "Mô tả dự án",
		"all": "Tất cả",
		"filterAria": "Lọc dự án theo thể loại",
		"prevAria": "Dự án trước",
		"nextAria": "Dự án sau",
		"closeAria": "Đóng"
	},
	contactForm: {
		"name": "Họ và tên",
		"namePlaceholder": "Tên của bạn",
		"email": "Email",
		"emailPlaceholder": "email@cuaban.com",
		"projectType": "Loại dự án",
		"projectTypePlaceholder": "Chọn loại dự án",
		"optionFilm": "Quay phim",
		"optionPhoto": "Chụp ảnh",
		"optionEdit": "Dựng phim",
		"optionOther": "Khác",
		"message": "Lời nhắn",
		"messagePlaceholder": "Kể cho tôi nghe về dự án của bạn…",
		"submit": "Gửi lời nhắn",
		"sending": "Đang gửi…",
		"success": "Cảm ơn bạn! Tôi sẽ phản hồi sớm nhất.",
		"error": "Có lỗi xảy ra, vui lòng thử lại.",
		"errorName": "Vui lòng nhập họ tên.",
		"errorEmail": "Vui lòng nhập email hợp lệ.",
		"errorMessage": "Vui lòng nhập lời nhắn."
	},
	footer: {
		"tagline": "Kể chuyện bằng hình ảnh, ánh sáng và nhịp điệu điện ảnh.",
		"phone": "Điện thoại",
		"email": "Email",
		"address": "Địa chỉ",
		"social": "Mạng xã hội"
	}
};
var en_default = {
	nav: {
		"ariaLabel": "Main navigation",
		"about": "About",
		"services": "Services",
		"work": "Work",
		"contact": "Contact",
		"resume": "Resume"
	},
	actions: {
		"viewProjects": "View work",
		"contactNow": "Get in touch",
		"viewMoreWork": "See more work",
		"viewServices": "Explore services",
		"viewAllProjects": "View all work",
		"bookNow": "Book a call"
	},
	resume: {
		"role": "Role",
		"skills": "Skills",
		"outcomes": "Highlights",
		"description": "Description",
		"scrollHint": "(Scroll down)",
		"experience": "Experience",
		"prevAria": "Previous experience",
		"nextAria": "Next experience"
	},
	about: { "strengths": "Strengths" },
	project: {
		"client": "Client",
		"year": "Year",
		"role": "Role",
		"overview": "Project overview",
		"all": "All",
		"filterAria": "Filter projects by category",
		"prevAria": "Previous project",
		"nextAria": "Next project",
		"closeAria": "Close"
	},
	contactForm: {
		"name": "Full name",
		"namePlaceholder": "Your name",
		"email": "Email",
		"emailPlaceholder": "you@email.com",
		"projectType": "Project type",
		"projectTypePlaceholder": "Choose a project type",
		"optionFilm": "Filming",
		"optionPhoto": "Photography",
		"optionEdit": "Editing",
		"optionOther": "Other",
		"message": "Message",
		"messagePlaceholder": "Tell me about your project…",
		"submit": "Send message",
		"sending": "Sending…",
		"success": "Thank you! I'll get back to you as soon as possible.",
		"error": "Something went wrong, please try again.",
		"errorName": "Please enter your name.",
		"errorEmail": "Please enter a valid email.",
		"errorMessage": "Please enter a message."
	},
	footer: { "tagline": "Crafted with light and story." }
};
//#endregion
//#region src/i18n/config.ts
var locales = ["vi", "en"];
function isLocale(value) {
	return !!value && locales.includes(value);
}
//#endregion
//#region src/i18n/utils.ts
var dictionaries = {
	vi: vi_default,
	en: en_default
};
/**
* Resolve the active locale from a URL. URL routing for `/en/` isn't wired up
* yet, so this yields the default (vi) unless a locale path segment is already
* present — reading the segment now means `/en/` routes light up for free when
* that routing lands, without touching call sites.
*/
function getLocale(url) {
	const segment = url?.pathname.split("/").filter(Boolean)[0];
	return isLocale(segment) ? segment : "vi";
}
function lookup(dict, key) {
	return key.split(".").reduce((node, part) => {
		if (node && typeof node === "object") return node[part];
	}, dict);
}
/**
* UI-string translator for chrome/labels held in vi.json / en.json.
* Falls back to the default locale, then to the raw key, so a missing string
* is visible in dev rather than rendering blank.
*/
function useTranslations(locale = "vi") {
	return function t(key) {
		const value = lookup(dictionaries[locale], key) ?? lookup(dictionaries["vi"], key);
		return typeof value === "string" ? value : key;
	};
}
/** Pick the active-locale value out of a `{ vi, en }` content field. */
function localize(field, locale = "vi") {
	return field[locale] ?? field["vi"];
}
//#endregion
//#region src/components/SiteHeader.astro
createAstro("https://example.com");
var $$SiteHeader = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$SiteHeader;
	const t = useTranslations(getLocale(Astro.url));
	const navItems = [
		{
			key: "about",
			href: "/"
		},
		{
			key: "work",
			href: "/portfolio/"
		},
		{
			key: "resume",
			href: "/resume/"
		},
		{
			key: "services",
			href: "/dich-vu/"
		},
		{
			key: "contact",
			href: "/lien-he/"
		}
	];
	const normalize = (path) => path.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
	const current = normalize(Astro.url.pathname);
	const isActive = (href) => normalize(href) === current;
	return renderTemplate`${maybeRenderHead($$result)}<header class="site-header"><a id="logo" class="brand" href="/">Cường Nguyễn Showreel</a><nav class="nav-pill-wrapper"${addAttribute(t("nav.ariaLabel"), "aria-label")}><div class="nav-indicator-glow"></div><div class="nav-pill"><div class="nav-indicator-pill"></div>${navItems.map((item) => renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(["nav-toggle", { active: isActive(item.href) }], "class:list")}>${t(`nav.${item.key}`)}</a>`)}</div></nav><div class="header-actions"><a class="nav-cta" href="/lien-he/">${t("actions.bookNow")}</a></div></header>`;
}, "F:/2026/Nomonm website/Website port/src/components/SiteHeader.astro", void 0);
//#endregion
//#region src/components/SiteFooter.astro
createAstro("https://example.com");
var $$SiteFooter = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$SiteFooter;
	getLocale(Astro.url);
	return renderTemplate`${maybeRenderHead($$result)}<footer class="site-footer"><div class="footer-container"><div class="footer-grid"><!-- Brand Column --><div class="footer-brand"><h3 class="brand-title">Cường Nguyễn</h3><p class="brand-subtitle">Showreel & Video Production</p><p class="brand-tagline">Kể chuyện bằng hình ảnh, ánh sáng và nhịp điệu điện ảnh.</p></div><!-- Right Group: Contact & Social --><div class="footer-columns-group"><!-- Contact Column --><div class="footer-column"><h4 class="column-title">Liên hệ</h4><ul class="contact-list"><li><a href="tel:0394775656" class="contact-link"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg><span>039 477 5656</span></a></li><li><a href="mailto:cuong@cnguyenwork.com" class="contact-link"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg><span>cuong@cnguyenwork.com</span></a></li><li><div class="contact-info-item"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg><span>Kim Hoa, Đống Đa, Hà Nội</span></div></li></ul></div><!-- Social Column --><div class="footer-column"><h4 class="column-title">Mạng xã hội</h4><ul class="social-list"><li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="social-link"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg><span>Facebook</span></a></li><li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-link"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg><span>Instagram</span></a></li><li><a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" class="social-link"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><path d="m22 8-6 4 6 4V8Z"></path><rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect></svg><span>Vimeo</span></a></li></ul></div></div></div><div class="footer-bottom"><p>© <span id="year">2026</span> Cường Nguyễn. All rights reserved.</p><!-- Secret 10px Admin Dot: Double Click to enter /admin --><button id="admin-dot" class="admin-dot" type="button" title="Admin Access" aria-label="Admin Access"></button></div></div></footer>${renderScript($$result, "F:/2026/Nomonm website/Website port/src/components/SiteFooter.astro?astro&type=script&index=0&lang.ts")}`;
}, "F:/2026/Nomonm website/Website port/src/components/SiteFooter.astro", void 0);
//#endregion
//#region src/components/HeavyAnimationLoader.astro
createAstro("https://example.com");
var $$HeavyAnimationLoader = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$HeavyAnimationLoader;
	const { initFn } = Astro.props;
	return renderTemplate`<script>(function(){${defineScriptVars({ initFn })}
  (function () {
    try {
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Dev-only escape hatch: some environments (VS Code's embedded browser,
      // certain OS/browser combos) report prefers-reduced-motion as true
      // regardless of the real user setting, with no way to override it from
      // DevTools. ?motion=1 (or localStorage force-motion=1) lets us verify
      // the real animation locally without weakening the accessibility gate
      // for actual visitors, who never pass this flag.
      const forceMotion = /[?&]motion=1\\b/.test(location.search) || localStorage.getItem('force-motion') === '1';
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
      const saveData = conn && conn.saveData;
      const slowNetwork = conn && conn.effectiveType && /2g|slow-2g/.test(conn.effectiveType);
      const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
      const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
      const avoid = (prefersReduced && !forceMotion) || saveData || slowNetwork || lowMemory || lowCores;
      if (avoid) return; // skip loading heavy libs on constrained devices

      function loadScript(src) {
        return new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = src;
          s.async = true;
          s.onload = res;
          s.onerror = rej;
          document.head.appendChild(s);
        });
      }

      Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js'),
      ])
        .then(() => {
          if (window[initFn]) window[initFn]();
        })
        .catch(() => {
          // non-fatal: pin-scroll animation will not initialize
          console.warn(initFn + ' libs failed to load');
        });
    } catch (e) {
      /* ignore */
    }
  })();
})();<\/script>`;
}, "F:/2026/Nomonm website/Website port/src/components/HeavyAnimationLoader.astro", void 0);
//#endregion
//#region src/components/LoadingOverlay.astro
var $$LoadingOverlay = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<div id="page-transition-overlay" class="loading-overlay" aria-hidden="true"><div class="loading-icon-wrapper"><svg class="film-reel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="2"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line><line x1="17.66" y1="4.93" x2="19.07" y2="6.34"></line></svg></div></div>`;
}, "F:/2026/Nomonm website/Website port/src/components/LoadingOverlay.astro", void 0);
//#endregion
//#region src/layouts/BaseLayout.astro
createAstro("https://example.com");
var $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BaseLayout;
	const { title, description, initFn, mediaGallery = false } = Astro.props;
	return renderTemplate`<html${addAttribute(getLocale(Astro.url), "lang")}><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"${addAttribute(description, "content")}><title>${title}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">${initFn && renderTemplate`${renderComponent($$result, "HeavyAnimationLoader", $$HeavyAnimationLoader, { "initFn": initFn })}`}${mediaGallery && renderTemplate`${renderScript($$result, "F:/2026/Nomonm website/Website port/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts")}`}${renderHead($$result)}</head><body><div class="film-grain-overlay" aria-hidden="true"></div><div class="cursor-dot" aria-hidden="true"></div>${renderComponent($$result, "SiteHeader", $$SiteHeader, {})}${renderSlot($$result, $$slots["default"])}${renderComponent($$result, "LoadingOverlay", $$LoadingOverlay, {})}${renderComponent($$result, "SiteFooter", $$SiteFooter, {})}${renderScript($$result, "F:/2026/Nomonm website/Website port/src/layouts/BaseLayout.astro?astro&type=script&index=1&lang.ts")}</body></html>`;
}, "F:/2026/Nomonm website/Website port/src/layouts/BaseLayout.astro", void 0);
//#endregion
//#region src/components/ProjectCard.astro
createAstro("https://example.com");
var $$ProjectCard = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ProjectCard;
	const { title, index, coverImageUrl, videoHoverUrl, cardClass, categories = [], id } = Astro.props;
	const categoryData = categories.join("|");
	return renderTemplate`${maybeRenderHead($$result)}<button type="button"${addAttribute(["portfolio-card", cardClass], "class:list")}${addAttribute(index, "data-index")}${addAttribute(categoryData, "data-categories")}${addAttribute(title, "aria-label")}${addAttribute(id, "data-project")}><div class="card-media-wrapper">${coverImageUrl ? renderTemplate`${renderComponent($$result, "Image", $$Image, {
		"class": "card-cover",
		"src": coverImageUrl,
		"width": 1600,
		"height": 900,
		"alt": title,
		"loading": "lazy"
	})}` : renderTemplate`<div class="card-cover-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></div>`}${videoHoverUrl && renderTemplate`<video class="card-video"${addAttribute(videoHoverUrl, "src")}${addAttribute(coverImageUrl ?? void 0, "poster")} muted loop playsinline preload="metadata"></video>`}<!-- Premium Overlay with Title and Action --><div class="card-overlay"><div class="card-overlay-top">${categories.length > 0 && renderTemplate`<span class="card-badge">${categories[0]}</span>`}</div><div class="card-overlay-bottom"><div class="card-title-group"><h3 class="card-title">${title}</h3></div><div class="card-arrow-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg></div></div></div></div></button>`;
}, "F:/2026/Nomonm website/Website port/src/components/ProjectCard.astro", void 0);
//#endregion
//#region src/components/ProjectModal.astro
createAstro("https://example.com");
var $$ProjectModal = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ProjectModal;
	const { projects } = Astro.props;
	const t = useTranslations(getLocale(Astro.url));
	return renderTemplate`<script type="application/json" id="projects-data">${unescapeHTML(JSON.stringify(projects.map((p) => ({
		title: p.title,
		videoUrl: p.videoUrl ?? null,
		cover: p.coverImageUrl ?? null,
		client: p.client ?? null,
		year: p.year ?? null,
		role: p.role ?? null,
		aspectRatio: p.aspectRatio === "9:16" ? "9:16" : "16:9",
		desc: p.descriptionParagraphs ?? []
	}))).replace(/</g, "\\u003c"))}<\/script>${maybeRenderHead($$result)}<div id="project-modal" class="pm-overlay" aria-hidden="true"><div class="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="pm-title"><button type="button" class="pm-btn pm-close"${addAttribute(t("project.closeAria"), "aria-label")}>&times;</button><div class="pm-scroll" data-pm-scroll><div class="pm-player" data-pm-player></div><div class="pm-info"><div class="pm-info-head"><h2 id="pm-title" class="pm-title"></h2><div class="pm-nav"><span class="pm-counter" aria-hidden="true"></span><button type="button" class="pm-btn pm-prev"${addAttribute(t("project.prevAria"), "aria-label")}>&lsaquo;</button><button type="button" class="pm-btn pm-next"${addAttribute(t("project.nextAria"), "aria-label")}>&rsaquo;</button></div></div><div class="pm-body"><dl class="pm-meta" data-pm-meta><div class="pm-meta-row" data-pm-row="client" hidden><dt class="pm-meta-label">${t("project.client")}</dt><dd class="pm-meta-value" data-pm-client></dd></div><div class="pm-meta-row" data-pm-row="year" hidden><dt class="pm-meta-label">${t("project.year")}</dt><dd class="pm-meta-value" data-pm-year></dd></div><div class="pm-meta-row" data-pm-row="role" hidden><dt class="pm-meta-label">${t("project.role")}</dt><dd class="pm-meta-value" data-pm-role></dd></div></dl><div class="pm-desc-section" data-pm-desc-section hidden><h3 class="pm-desc-head">${t("project.overview")}</h3><div class="pm-desc" data-pm-desc></div></div></div></div></div><!-- Custom liquid scroll indicator (native scrollbar hidden on .pm-scroll) --><div class="pm-scrollbar" data-pm-scrollbar aria-hidden="true"><span class="pm-scrollthumb" data-pm-scrollthumb></span></div></div></div>${renderScript($$result, "F:/2026/Nomonm website/Website port/src/components/ProjectModal.astro?astro&type=script&index=0&lang.ts")}`;
}, "F:/2026/Nomonm website/Website port/src/components/ProjectModal.astro", void 0);
//#endregion
//#region src/data/index.ts
var projects = {
	meta: {
		"title": {
			"vi": "Dự án | Cường Nguyễn Showreel",
			"en": "Work | Cường Nguyễn Showreel"
		},
		"description": {
			"vi": "Toàn bộ dự án quay phim, chụp ảnh và dựng phim của Cường Nguyễn Showreel — portfolio đầy đủ dành cho khách hàng và nhà tuyển dụng.",
			"en": "The full body of filming, photography and editing work by Cường Nguyễn Showreel — a complete portfolio for clients and recruiters."
		}
	},
	eyebrow: {
		"vi": "Dự án",
		"en": "Work"
	},
	heading: {
		"vi": "Toàn bộ dự án quay dựng và chụp ảnh.",
		"en": "The full body of filming and photography work."
	},
	items: [
		{
			"id": "quiet-luxury",
			"featured": true,
			"cardClass": "card-1",
			"tag": {
				"vi": "Campaign",
				"en": "Campaign"
			},
			"title": {
				"vi": "Quiet Luxury",
				"en": "Quiet Luxury"
			},
			"description": {
				"vi": "Series hình ảnh thương hiệu với tone màu muted và cảm giác sang trọng.",
				"en": "A brand image series with muted tones and a sense of understated luxury."
			}
		},
		{
			"id": "after-rain",
			"featured": true,
			"cardClass": "card-2",
			"tag": {
				"vi": "Short Film",
				"en": "Short Film"
			},
			"title": {
				"vi": "After Rain",
				"en": "After Rain"
			},
			"description": {
				"vi": "Storytelling nhẹ nhàng, lấy cảm hứng từ ánh sáng buổi chiều và nỗi nhớ.",
				"en": "Gentle storytelling inspired by afternoon light and nostalgia."
			}
		},
		{
			"id": "golden-hour",
			"featured": true,
			"cardClass": "card-3",
			"tag": {
				"vi": "Editorial",
				"en": "Editorial"
			},
			"title": {
				"vi": "Golden Hour",
				"en": "Golden Hour"
			},
			"description": {
				"vi": "Bộ ảnh cá nhân với phong cách cinematic và góc nhìn độc đáo.",
				"en": "A personal photo series with a cinematic style and a distinctive point of view."
			}
		}
	]
};
//#endregion
//#region src/sanity/image.js
var builder = createImageUrlBuilder(sanityClient);
function urlFor(source) {
	return builder.image(source);
}
//#endregion
//#region src/sanity/api.js
var L = (field) => field ? localize(field, "vi") : "";
async function safeFetch(query, params) {
	try {
		return await sanityClient.fetch(query, params, { useCdn: false });
	} catch (e) {
		console.warn("[sanity] fetch failed, using src/data fallback:", e?.message || e);
		return null;
	}
}
function blocksToText(blocks) {
	if (!Array.isArray(blocks)) return "";
	return blocks.filter((b) => b && b._type === "block").map((b) => (b.children || []).map((c) => c.text).join("")).join("\n\n").trim();
}
function coverUrl(source, w = 1600, h = 900) {
	if (!source) return null;
	try {
		return urlFor(source).width(w).height(h).fit("crop").auto("format").url();
	} catch {
		return null;
	}
}
function toParagraphs(blocks) {
	return blocksToText(blocks).split("\n\n").map((p) => p.trim()).filter(Boolean);
}
function fixLocalhostUrl(url) {
	if (typeof url !== "string") return url;
	return url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, "");
}
function getYouTubeThumbnail(url) {
	if (!url || typeof url !== "string") return null;
	const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
	if (match && match[2] && match[2].length === 11) return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
	return null;
}
function mapProject(r) {
	const manualCover = coverUrl(r.coverImage);
	const autoYoutubeCover = getYouTubeThumbnail(r.mainVideoUrl) || getYouTubeThumbnail(r.videoHoverUrl);
	return {
		id: r.id,
		title: r.title || "",
		coverImageUrl: manualCover || autoYoutubeCover,
		videoHoverUrl: fixLocalhostUrl(r.videoHoverUrl) || null,
		videoUrl: fixLocalhostUrl(r.mainVideoUrl) || null,
		client: r.client || null,
		year: r.year ?? null,
		role: r.role || null,
		categories: Array.isArray(r.categories) ? r.categories.filter(Boolean) : [],
		aspectRatio: r.aspectRatio === "9:16" ? "9:16" : "16:9",
		descriptionParagraphs: toParagraphs(r.description),
		cardClass: null,
		featured: !!r.featured
	};
}
async function getProjects() {
	const rows = await safeFetch(`*[_type == "project"] | order(coalesce(orderRank, "zzz") asc, featured desc, year desc, _createdAt desc){
      "id": _id, title, featured, client, year, role,
      "categories": categories[]{
        _type == "reference" => @->title,
        _type != "reference" => @
      },
      aspectRatio, coverImage, videoHoverUrl, mainVideoUrl, description
    }`);
	if (rows && rows.length) return rows.map(mapProject);
	return projects.items.map((p) => ({
		id: p.id,
		title: L(p.title),
		coverImageUrl: null,
		videoHoverUrl: null,
		videoUrl: null,
		client: null,
		year: null,
		role: null,
		categories: p.tag ? [L(p.tag)] : [],
		aspectRatio: "16:9",
		descriptionParagraphs: [L(p.description)].filter(Boolean),
		cardClass: p.cardClass || null,
		featured: !!p.featured
	}));
}
async function getProjectsGroupedByCategory() {
	const allProjects = await getProjects();
	const groupMap = /* @__PURE__ */ new Map();
	allProjects.forEach((project) => {
		(Array.isArray(project.categories) && project.categories.length > 0 ? project.categories : ["Khác"]).forEach((catName) => {
			if (!groupMap.has(catName)) groupMap.set(catName, []);
			groupMap.get(catName).push(project);
		});
	});
	return Array.from(groupMap.entries()).map(([name, items]) => ({
		name,
		projects: items
	}));
}
//#endregion
//#region src/pages/portfolio/index.astro
var portfolio_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://example.com");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const locale = getLocale(Astro.url);
	const t = useTranslations(locale);
	const [projectList, categoryGroups] = await Promise.all([getProjects(), getProjectsGroupedByCategory()]);
	const allCategories = categoryGroups.map((g) => g.name);
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": localize(projects.meta.title, locale),
		"description": localize(projects.meta.description, locale)
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<main class="page-main-wrapper"><div class="editorial-container"><section class="section portfolio reveal"><div class="editorial-header"><div class="section-tag">[ PORTFOLIO ]</div><h1 class="editorial-title">${localize(projects.heading, locale)}</h1></div>${allCategories.length > 0 && renderTemplate`<div class="portfolio-filter" role="group"${addAttribute(t("project.filterAria"), "aria-label")}><button type="button" class="filter-pill active" data-filter="all">${t("project.all")}</button>${allCategories.map((cat) => renderTemplate`<button type="button" class="filter-pill"${addAttribute(cat, "data-filter")}>${cat}</button>`)}</div>`}<div class="portfolio-category-sections" data-portfolio-sections>${categoryGroups.map((group) => renderTemplate`<div class="category-group-block"${addAttribute(group.name, "data-category-group")}><div class="category-group-header"><h2 class="category-group-title">[ ${group.name.toUpperCase()} ]</h2><span class="category-group-count">${group.projects.length} dự án</span></div><div class="portfolio-grid reveal-stagger" data-portfolio-grid>${group.projects.map((project, i) => renderTemplate`${renderComponent($$result, "ProjectCard", $$ProjectCard, {
		"title": project.title,
		"index": i,
		"coverImageUrl": project.coverImageUrl,
		"videoHoverUrl": project.videoHoverUrl,
		"cardClass": project.cardClass,
		"categories": project.categories,
		"id": project.id
	})}`)}</div></div>`)}</div></section>${renderComponent($$result, "ProjectModal", $$ProjectModal, { "projects": projectList })}</div></main>${renderScript($$result, "F:/2026/Nomonm website/Website port/src/pages/portfolio/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "F:/2026/Nomonm website/Website port/src/pages/portfolio/index.astro", void 0);
var $$file = "F:/2026/Nomonm website/Website port/src/pages/portfolio/index.astro";
var $$url = "/portfolio";
//#endregion
//#region \0virtual:astro:page:src/pages/portfolio/index@_@astro
var page = () => portfolio_exports;
//#endregion
export { page };
