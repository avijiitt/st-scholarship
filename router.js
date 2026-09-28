/**
 * National Tribal Scholarship Portal (NTSP - MoTA)
 * Client-Side SPA Router with Layout Engine & Route Protection
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.currentParams = {};

    window.addEventListener("hashchange", () => this.handleRouting());
    window.addEventListener("popstate", () => this.handleRouting());

    // Intercept standard internal links
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-route], a[href^='/'], a[href^='#/']");
      if (link && !link.target && !link.hasAttribute("download")) {
        const href = link.getAttribute("data-route") || link.getAttribute("href");
        if (href && (href.startsWith("/") || href.startsWith("#/"))) {
          e.preventDefault();
          const cleanPath = href.startsWith("#") ? href.substring(1) : href;
          this.navigate(cleanPath);
        }
      }
    });
  }

  register(path, handler, options = {}) {
    // Convert path with params like /admin/applications/:id to regex
    const paramNames = [];
    const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return "([^/]+)";
    });

    const regex = new RegExp(`^${regexPath}$`);
    this.routes[path] = {
      regex,
      paramNames,
      handler,
      layout: options.layout || "public", // "public", "applicant", "admin", "bare"
      authRole: options.authRole || null // "applicant", "admin"
    };
  }

  navigate(path) {
    if (path.startsWith("#")) path = path.substring(1);
    if (!path.startsWith("/")) path = "/" + path;
    window.location.hash = "#" + path;
  }

  getCurrentPath() {
    let hash = window.location.hash;
    if (hash && hash.startsWith("#")) {
      hash = hash.substring(1);
      if (hash !== "") return hash;
    }
    let pathname = window.location.pathname || "/";
    if (pathname.endsWith("/index.html")) {
      pathname = pathname.replace("/index.html", "");
    }
    if (!pathname || pathname === "") pathname = "/";
    return pathname;
  }

  matchRoute(path) {
    for (const [routePattern, routeConfig] of Object.entries(this.routes)) {
      const match = path.match(routeConfig.regex);
      if (match) {
        const params = {};
        routeConfig.paramNames.forEach((name, idx) => {
          params[name] = match[idx + 1];
        });
        return { config: routeConfig, pattern: routePattern, params };
      }
    }
    return null;
  }

  handleRouting() {
    const rawPath = this.getCurrentPath();
    const [pathOnly, queryString] = rawPath.split("?");
    const queryParams = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });
    }

    const matched = this.matchRoute(pathOnly);

    if (!matched) {
      this.render404(rawPath);
      return;
    }

    const { config, pattern, params } = matched;
    const combinedParams = { ...queryParams, ...params };
    this.currentRoute = pattern;
    this.currentParams = combinedParams;

    // Role-based protection check
    const authUser = window.appStore.getAuthUser();
    if (config.authRole) {
      if (!authUser || authUser.role !== config.authRole) {
        if (config.authRole === "admin") {
          showToast("Admin access required. Please login with admin credentials.", "warning");
          this.navigate("/admin/login");
          return;
        } else if (config.authRole === "applicant") {
          showToast("Scholar login required.", "warning");
          this.navigate("/login");
          return;
        }
      }
    }

    // Render with specified layout
    this.renderLayout(config.layout, () => {
      config.handler(combinedParams);
    });

    // Update active nav highlights
    this.updateActiveNavs(pattern);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  renderLayout(layoutType, contentCallback) {
    const appContainer = document.getElementById("app");
    if (!appContainer) return;

    if (layoutType === "applicant") {
      appContainer.innerHTML = this.getApplicantLayoutHTML();
    } else if (layoutType === "admin") {
      appContainer.innerHTML = this.getAdminLayoutHTML();
    } else {
      appContainer.innerHTML = this.getPublicLayoutHTML();
    }

    // Render view content inside #main-view-container
    const mainContainer = document.getElementById("main-view-container");
    if (mainContainer) {
      contentCallback();
    }
  }

  updateActiveNavs(currentPattern) {
    document.querySelectorAll("[data-nav-link]").forEach(link => {
      const target = link.getAttribute("data-nav-link");
      if (target === currentPattern || (target !== "/" && currentPattern.startsWith(target))) {
        link.classList.add("bg-primary", "text-on-primary", "font-bold");
        link.classList.remove("text-surface-container-lowest", "hover:bg-primary/40");
      } else {
        link.classList.remove("bg-primary", "text-on-primary", "font-bold");
        link.classList.add("text-surface-container-lowest");
      }
    });

    // Sidebar active item highlight
    document.querySelectorAll("[data-sidebar-link]").forEach(link => {
      const target = link.getAttribute("data-sidebar-link");
      if (target === currentPattern || (target !== "/" && currentPattern.startsWith(target))) {
        link.classList.add("bg-primary", "text-white", "font-bold");
        link.classList.remove("text-on-surface", "hover:bg-surface-container");
      } else {
        link.classList.remove("bg-primary", "text-white", "font-bold");
        link.classList.add("text-on-surface");
      }
    });
  }

  render404(path) {
    const appContainer = document.getElementById("app");
    if (!appContainer) return;

    appContainer.innerHTML = `
      ${this.getTopRibbonHTML()}
      <header class="w-full bg-surface-container-lowest shadow-sm py-4 px-margin flex justify-between items-center max-w-7xl mx-auto">
        <a href="#/" class="flex items-center gap-3">
          <img alt="MoTA Emblem" class="h-10 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5iDY8HhCiAkZClSCqpitPAV8V9PCXpPODREIZWl9JAovXtMpZ0ScQpbOUIrtNEhFCzZImajxDNREYqgn5jrgmkI-tvDQCRsug3A3DNZb7_kb737zfcL3HqI48DAVo55z_jAZAQmLGS_T3hL6XoSyfC5VdXh9EpmohXr_hjt79edFc2ZkLR1bfl9uZgNUooT1OG_pl5mxF7sCxBWnTveN0oh2O5Zn2WdUwr2_XCIKh5bYdpX3gxKSdiA"/>
          <div>
            <h1 class="font-bold text-primary text-base">National Tribal Scholarship Portal</h1>
            <p class="text-xs text-on-surface-variant">Ministry of Tribal Affairs</p>
          </div>
        </a>
        <a href="#/" class="px-4 py-2 bg-primary text-white rounded text-sm font-semibold">Home</a>
      </header>
      <main class="max-w-2xl mx-auto px-margin py-20 text-center">
        <div class="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-4xl">search_off</span>
        </div>
        <h2 class="text-3xl font-bold text-primary mb-2">404 - Page Not Found</h2>
        <p class="text-on-surface-variant mb-6">
          The requested route <code class="bg-surface-container-high px-2 py-0.5 rounded font-mono text-secondary">${path}</code> does not exist on this portal.
        </p>
        <div class="flex justify-center gap-4">
          <button onclick="window.history.back()" class="px-5 py-2.5 bg-surface-container text-primary rounded font-semibold text-sm hover:bg-surface-container-high">
            Go Back
          </button>
          <a href="#/" class="px-5 py-2.5 bg-secondary text-white rounded font-semibold text-sm hover:bg-secondary/90 shadow-md">
            Return to Homepage
          </a>
        </div>
      </main>
      ${this.getPublicFooterHTML()}
    `;
  }

  // Layout Templates
  getTopRibbonHTML() {
    return `
      <div class="w-full bg-surface-container-lowest shadow-sm">
        <div class="w-full flex h-1.5">
          <div class="flex-1 bg-secondary"></div>
          <div class="flex-1 bg-surface-container-lowest"></div>
          <div class="flex-1 bg-tertiary-container"></div>
        </div>
        <div class="bg-primary-container text-surface-container-lowest py-1 px-margin">
          <div class="max-w-7xl mx-auto flex flex-wrap justify-between items-center text-xs">
            <span class="tracking-wide">GOVERNMENT OF INDIA • MINISTRY OF TRIBAL AFFAIRS</span>
            <div class="flex items-center gap-2.5 flex-wrap">
              <!-- Language Toggle -->
              <button onclick="window.togglePortalLanguage()" class="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1 transition">
                <span class="material-symbols-outlined text-[13px]">translate</span>
                <span id="current-portal-lang">${(typeof localStorage !== "undefined" && localStorage.getItem("NTSP_LANG") === "hi") ? "English" : "हिन्दी"}</span>
              </button>

              <span class="text-white/40">|</span>

              <!-- Text Sizing Controls (A-, A, A+) -->
              <div class="flex items-center gap-1 font-bold text-xs">
                <button onclick="window.changePortalFontSize('decrease')" title="Decrease Text Size" class="px-1.5 py-0.5 rounded hover:bg-white/20 text-white transition">A-</button>
                <button onclick="window.changePortalFontSize('reset')" title="Default Text Size" class="px-1.5 py-0.5 rounded hover:bg-white/20 text-white font-extrabold transition">A</button>
                <button onclick="window.changePortalFontSize('increase')" title="Increase Text Size" class="px-1.5 py-0.5 rounded hover:bg-white/20 text-white transition">A+</button>
              </div>

              <span class="text-white/40">|</span>

              <!-- Dark Mode Toggle -->
              <button onclick="window.togglePortalDarkMode()" title="Toggle Dark Mode" class="px-1.5 py-0.5 rounded hover:bg-white/20 flex items-center gap-1 text-white transition">
                <span class="material-symbols-outlined text-[15px]" data-dark-toggle-icon>${(typeof localStorage !== "undefined" && localStorage.getItem("NTSP_DARK_MODE") === "true") ? "light_mode" : "dark_mode"}</span>
                <span class="text-[11px] font-semibold">Theme</span>
              </button>

              <span class="text-white/40">|</span>

              <!-- 2G / Low Bandwidth Tribal Mode -->
              <button onclick="window.toggleLowBandwidthMode()" title="2G Tribal Low-Bandwidth Mode" class="px-2 py-0.5 rounded bg-secondary hover:bg-secondary/90 text-white text-[11px] font-bold flex items-center gap-1 transition shadow-xs">
                <span class="material-symbols-outlined text-[13px]">offline_bolt</span>
                <span data-low-bandwidth-label>${(typeof localStorage !== "undefined" && localStorage.getItem("NTSP_LOW_BANDWIDTH") === "true") ? "2G: ON" : "2G Mode"}</span>
              </button>

              <span class="text-white/40">|</span>

              <a href="#/calendar" class="text-secondary-fixed hover:underline flex items-center gap-1 font-semibold text-[11px]">
                <span class="material-symbols-outlined text-[13px]">calendar_month</span> Calendar
              </a>

              <span class="text-white/40">|</span>

              <a href="#/login" class="text-secondary-fixed hover:underline flex items-center gap-1 font-semibold text-[11px]">
                <span class="material-symbols-outlined text-[13px]">school</span> Scholar Login
              </a>
              <span class="text-white/40">|</span>
              <a href="#/admin/login" class="text-secondary-fixed hover:underline flex items-center gap-1 font-semibold text-[11px]">
                <span class="material-symbols-outlined text-[13px]">admin_panel_settings</span> Official Portal
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getPublicLayoutHTML() {
    const authUser = window.appStore.getAuthUser();
    const isHi = (typeof localStorage !== "undefined" && localStorage.getItem("NTSP_LANG") === "hi");
    return `
      ${this.getTopRibbonHTML()}
      <header class="w-full bg-surface-container-lowest shadow-sm">
        <div class="max-w-7xl mx-auto px-margin py-space-md flex flex-col lg:flex-row items-center justify-between gap-space-md">
          <a href="#/" class="flex items-center gap-space-md">
            <img alt="MoTA Official Portal Logo" class="h-12 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5iDY8HhCiAkZClSCqpitPAV8V9PCXpPODREIZWl9JAovXtMpZ0ScQpbOUIrtNEhFCzZImajxDNREYqgn5jrgmkI-tvDQCRsug3A3DNZb7_kb737zfcL3HqI48DAVo55z_jAZAQmLGS_T3hL6XoSyfC5VdXh9EpmohXr_hjt79edFc2ZkLR1bfl9uZgNUooT1OG_pl5mxF7sCxBWnTveN0oh2O5Zn2WdUwr2_XCIKh5bYdpX3gxKSdiA"/>
            <div class="border-l border-outline-variant pl-space-md">
              <p class="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">National Tribal Scholarship Portal</p>
              <p class="font-label-md text-label-md text-secondary font-semibold">राष्ट्रीय जनजातीय छात्रवृत्ति एवं अध्येतावृत्ति पोर्टल</p>
              <p class="font-label-sm text-label-sm text-on-surface-variant">Ministry of Tribal Affairs, Government of India</p>
            </div>
          </a>

          <div class="flex items-center gap-space-md">
            <div class="hidden sm:flex items-center bg-surface-container-low px-space-md py-space-xs rounded gap-space-sm border border-outline-variant/50">
              <span class="material-symbols-outlined text-outline text-[18px]">search</span>
              <input class="bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none w-44 xl:w-56" placeholder="${isHi ? 'योजनाएं खोजें...' : 'Search schemes...'}" type="text" onkeydown="if(event.key==='Enter') router.navigate('/schemes')"/>
            </div>
            ${authUser && authUser.role === "applicant" ? `
              <div class="flex items-center gap-2">
                <button onclick="openNotificationCenterModal()" class="relative p-2 text-primary hover:bg-surface-container rounded-full transition flex items-center" title="In-App Notifications">
                  <span class="material-symbols-outlined text-[20px]">notifications</span>
                  <span class="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-error text-white font-bold text-[10px] rounded-full shadow-xs">3</span>
                </button>
                <a href="#/applicant/dashboard" class="px-4 py-2 bg-primary text-white font-semibold rounded text-sm flex items-center gap-1 shadow-sm">
                  <span class="material-symbols-outlined text-[18px]">dashboard</span> ${isHi ? 'डैशबोर्ड' : 'Dashboard'}
                </a>
                <button onclick="handleApplicantLogout()" class="px-3 py-2 bg-surface-container text-on-surface rounded text-xs font-semibold hover:bg-surface-container-high" title="Sign Out">
                  ${isHi ? 'लॉगआउट' : 'Logout'}
                </button>
              </div>
            ` : `
              <div class="flex items-center gap-2">
                <a href="#/login" class="px-4 py-2 text-primary font-semibold hover:bg-surface-container rounded text-sm">
                  ${isHi ? 'लॉगिन' : 'Login'}
                </a>
                <a href="#/register" class="px-4 py-2 bg-secondary text-white font-semibold rounded text-sm hover:bg-secondary/90 shadow-sm">
                  ${isHi ? 'नया पंजीकरण' : 'New Registration'}
                </a>
              </div>
            `}
          </div>
        </div>

        <nav class="bg-primary-container text-on-primary-container">
          <div class="max-w-7xl mx-auto px-margin flex items-center overflow-x-auto whitespace-nowrap py-1">
            <a href="#/" data-nav-link="/" class="px-4 py-2 font-medium text-sm text-surface-container-lowest hover:bg-primary/40 rounded transition">${isHi ? 'मुख्य पृष्ठ' : 'Home'}</a>
            <a href="#/schemes" data-nav-link="/schemes" class="px-4 py-2 font-medium text-sm text-surface-container-lowest hover:bg-primary/40 rounded transition">${isHi ? 'सभी योजनाएं' : 'All Schemes'}</a>
            <a href="#/schemes/nos" data-nav-link="/schemes/nos" class="px-4 py-2 font-medium text-sm text-surface-container-lowest hover:bg-primary/40 rounded transition">${isHi ? 'विदेशी छात्रवृत्ति (NOS)' : 'Overseas Scholarship (NOS)'}</a>
            <a href="#/schemes/nfst" data-nav-link="/schemes/nfst" class="px-4 py-2 font-medium text-sm text-surface-container-lowest hover:bg-primary/40 rounded transition">${isHi ? 'राष्ट्रीय फैलोशिप (NFST)' : 'National Fellowship (NFST)'}</a>
            <a href="#/application/track" data-nav-link="/application/track" class="px-4 py-2 font-medium text-sm text-surface-container-lowest hover:bg-primary/40 rounded transition">${isHi ? 'आवेदन ट्रैक करें' : 'Track Application'}</a>
            <a href="#/application/deficiency" data-nav-link="/application/deficiency" class="px-4 py-2 font-medium text-sm text-surface-container-lowest hover:bg-primary/40 rounded transition">${isHi ? 'त्रुटि निवारण केंद्र' : 'Deficiency Desk'}</a>
          </div>
        </nav>
      </header>
      <div id="main-view-container"></div>
      ${this.getPublicFooterHTML()}
    `;
  }

  getApplicantLayoutHTML() {
    const app = window.appStore.getApplication();
    const user = window.appStore.getAuthUser() || { name: "Priya Munda", otrId: "OTR-2025-ST-884129" };
    const isHi = (typeof localStorage !== "undefined" && localStorage.getItem("NTSP_LANG") === "hi");

    return `
      ${this.getTopRibbonHTML()}
      <header class="w-full bg-surface-container-lowest shadow-sm border-b border-outline-variant/30">
        <div class="max-w-7xl mx-auto px-margin py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a href="#/applicant/dashboard" class="flex items-center gap-2">
              <img alt="MoTA Logo" class="h-9 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5iDY8HhCiAkZClSCqpitPAV8V9PCXpPODREIZWl9JAovXtMpZ0ScQpbOUIrtNEhFCzZImajxDNREYqgn5jrgmkI-tvDQCRsug3A3DNZb7_kb737zfcL3HqI48DAVo55z_jAZAQmLGS_T3hL6XoSyfC5VdXh9EpmohXr_hjt79edFc2ZkLR1bfl9uZgNUooT1OG_pl5mxF7sCxBWnTveN0oh2O5Zn2WdUwr2_XCIKh5bYdpX3gxKSdiA"/>
              <span class="font-bold text-primary text-base hidden sm:inline">National Tribal Scholarship Portal</span>
            </a>
            <span class="px-2 py-0.5 bg-surface-container text-primary font-bold text-xs rounded">${isHi ? 'अभ्यर्थी पोर्टल' : 'Applicant Portal'}</span>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded border border-outline-variant/40">
              <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                ${user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div class="text-left text-xs">
                <p class="font-bold text-primary leading-tight">${user.name}</p>
                <p class="text-outline text-[11px] leading-tight">${user.otrId}</p>
              </div>
              <span class="ml-1 px-1.5 py-0.5 bg-tertiary-container text-white rounded text-[10px] font-bold">ST Verified</span>
            </div>
            <button onclick="openNotificationCenterModal()" class="relative p-2 text-primary hover:bg-surface-container rounded-full transition flex items-center" title="Notifications">
              <span class="material-symbols-outlined text-[20px]">notifications</span>
              <span class="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-error text-white font-bold text-[10px] rounded-full shadow-xs">3</span>
            </button>
            <button onclick="handleApplicantLogout()" class="text-xs text-on-surface-variant hover:text-error flex items-center gap-1 font-semibold px-2 py-1 rounded hover:bg-surface-container">
              <span class="material-symbols-outlined text-[16px]">logout</span> ${isHi ? 'लॉगआउट' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <!-- Applicant Workspace Layout with Sidebar -->
      <div class="max-w-7xl mx-auto px-margin py-space-lg grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <!-- Sidebar Navigation -->
        <aside class="lg:col-span-3 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-space-md space-y-1">
          <div class="pb-3 mb-2 border-b border-outline-variant/20 px-2">
            <span class="text-xs uppercase font-bold text-secondary tracking-wider block">${isHi ? 'अभ्यर्थी मेनू' : 'Candidate Menu'}</span>
            <p class="font-bold text-primary text-sm">${user.name}</p>
          </div>

          <a href="#/applicant/dashboard" data-sidebar-link="/applicant/dashboard" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition">
            <span class="material-symbols-outlined text-[20px]">dashboard</span> ${isHi ? 'डैशबोर्ड' : 'Dashboard'}
          </a>
          <a href="#/applicant/profile" data-sidebar-link="/applicant/profile" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition">
            <span class="material-symbols-outlined text-[20px]">person</span> ${isHi ? 'मेरी प्रोफ़ाइल' : 'My Profile'}
          </a>
          <a href="#/application/track" data-sidebar-link="/application/track" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition">
            <span class="material-symbols-outlined text-[20px]">timeline</span> ${isHi ? 'आवेदन व ट्रैकिंग' : 'My Applications & Track'}
          </a>
          <a href="#/application/new" data-sidebar-link="/application/new" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition">
            <span class="material-symbols-outlined text-[20px]">add_circle</span> ${isHi ? 'नई योजना हेतु आवेदन' : 'Apply for New Scheme'}
          </a>
          <a href="#/schemes" data-sidebar-link="/schemes" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition">
            <span class="material-symbols-outlined text-[20px]">explore</span> ${isHi ? 'अनुशंसित योजनाएं' : 'Recommended Schemes'}
          </a>
          <a href="#/calendar" data-sidebar-link="/calendar" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition">
            <span class="material-symbols-outlined text-[20px]">calendar_month</span> ${isHi ? 'छात्रवृत्ति कैलेंडर' : 'Scholarship Calendar'}
          </a>
          <a href="#/grievance" data-sidebar-link="/grievance" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition">
            <span class="material-symbols-outlined text-[20px]">support_agent</span> ${isHi ? 'शिकायत व निवारण केंद्र' : 'Grievance & Escalation Desk'}
          </a>
          <a href="#/application/deficiency" data-sidebar-link="/application/deficiency" class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition">
            <span class="material-symbols-outlined text-[20px]">warning</span> ${isHi ? 'त्रुटि सूचनाएं' : 'Deficiency Notifications'}
          </a>

          <div class="pt-4 mt-4 border-t border-outline-variant/20">
            <div class="p-3 bg-surface-container-low rounded-lg text-xs space-y-1">
              <span class="text-outline block font-semibold">${isHi ? 'सक्रिय ड्राफ्ट स्थिति:' : 'Active Draft Status:'}</span>
              <p class="font-bold text-primary">${app.schemeCode} 2026–27</p>
              <p class="text-secondary font-semibold font-mono text-[11px]">${app.status}</p>
              <a href="#${app.lastSavedStep || '/application/personal'}" class="mt-2 inline-block font-bold text-secondary hover:underline">
                ${isHi ? 'ड्राफ्ट जारी रखें →' : 'Continue Draft →'}
              </a>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="lg:col-span-9 flex flex-col gap-space-lg" id="main-view-container">
        </main>
      </div>
      ${this.getPublicFooterHTML()}
    `;
  }

  getAdminLayoutHTML() {
    const queue = window.appStore.getAdminQueue();
    const pendingCount = queue.filter(q => q.status === "Under Document Scrutiny").length;

    return `
      ${this.getTopRibbonHTML()}
      <header class="w-full bg-primary text-white shadow-md border-b border-primary-container">
        <div class="max-w-7xl mx-auto px-margin py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a href="#/admin/dashboard" class="flex items-center gap-2 text-white">
              <span class="material-symbols-outlined text-[26px] text-secondary-fixed">shield_person</span>
              <span class="font-bold text-lg">MoTA Scholarship Administration Console</span>
            </a>
            <span class="px-2 py-0.5 bg-secondary text-white font-bold text-xs rounded">Officer Portal</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs text-primary-fixed-dim hidden sm:inline">Officer: Shri K. S. Verma (Deputy Secretary)</span>
            <button onclick="openNotificationCenterModal()" class="relative p-2 text-white hover:bg-primary-container rounded-full transition flex items-center" title="System Notifications">
              <span class="material-symbols-outlined text-[20px]">notifications</span>
              <span class="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-secondary-fixed text-on-secondary-fixed font-bold text-[10px] rounded-full shadow-xs">3</span>
            </button>
            <button onclick="window.appStore.logout(); router.navigate('/admin/login');" class="text-xs bg-primary-container hover:bg-primary-container/80 text-white font-semibold px-3 py-1.5 rounded flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">logout</span> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-margin py-space-lg grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <!-- Admin Sidebar -->
        <aside class="lg:col-span-3 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-space-md space-y-1">
          <div class="pb-3 mb-2 border-b border-outline-variant/20 px-2">
            <span class="text-xs uppercase font-bold text-secondary tracking-wider block">Admin Control</span>
            <p class="font-bold text-primary text-sm">Tribal Welfare Division</p>
          </div>

          <a href="#/admin/dashboard" data-sidebar-link="/admin/dashboard" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition">
            <span class="flex items-center gap-2.5"><span class="material-symbols-outlined text-[20px]">monitoring</span> Overview Dashboard</span>
          </a>
          <a href="#/admin/applications" data-sidebar-link="/admin/applications" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition">
            <span class="flex items-center gap-2.5"><span class="material-symbols-outlined text-[20px]">ballot</span> Application Queue</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed">${pendingCount}</span>
          </a>
          <a href="#/admin/analytics" data-sidebar-link="/admin/analytics" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition">
            <span class="flex items-center gap-2.5"><span class="material-symbols-outlined text-[20px]">insights</span> Funnel &amp; Rejection Analytics</span>
          </a>
          <a href="#/admin/grievances" data-sidebar-link="/admin/grievances" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition">
            <span class="flex items-center gap-2.5"><span class="material-symbols-outlined text-[20px]">support_agent</span> Grievance Escalation Desk</span>
          </a>
          <a href="#/admin/schemes" data-sidebar-link="/admin/schemes" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition">
            <span class="flex items-center gap-2.5"><span class="material-symbols-outlined text-[20px]">tune</span> Scheme Quotas &amp; Rules</span>
          </a>
          <a href="#/" class="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-on-surface hover:bg-surface-container transition">
            <span class="flex items-center gap-2.5"><span class="material-symbols-outlined text-[20px]">public</span> Public Portal View</span>
          </a>
        </aside>

        <!-- Admin Main Content -->
        <main class="lg:col-span-9 flex flex-col gap-space-lg" id="main-view-container">
        </main>
      </div>
      ${this.getPublicFooterHTML()}
    `;
  }

  getPublicFooterHTML() {
    return `
      <footer class="w-full bg-surface-container-high text-on-surface mt-space-xl border-t border-outline-variant py-space-lg px-margin text-center text-xs text-on-surface-variant">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>Designed and Maintained by <strong>National Informatics Centre (NIC)</strong> for Ministry of Tribal Affairs.</p>
          <div class="flex items-center gap-4">
            <a href="#/schemes" class="hover:underline">Schemes</a>
            <a href="#/application/track" class="hover:underline">Tracking</a>
            <a href="#/admin/login" class="hover:underline text-secondary font-bold">Admin Login</a>
          </div>
        </div>
      </footer>
    `;
  }
}

window.router = new Router();

window.handleApplicantLogout = async function() {
  if (window.supabaseLogout) {
    await window.supabaseLogout();
  }
  if (window.appStore) {
    window.appStore.logout();
  }
  showToast("Signed out successfully.", "info");
  window.router.navigate("/");
};
function handleApplicantLogout() {
  window.handleApplicantLogout();
}
