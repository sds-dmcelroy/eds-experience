const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

const progress = qs(".progress span");
const navLinks = qsa(".scene-nav a");
const scenes = qsa("[data-scene]");

function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const ratio = max > 0 ? scrollY / max : 0;
  progress.style.width = `${ratio * 100}%`;
}
addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

qsa(".hero-stations button").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    target?.scrollIntoView({ behavior: "smooth" });
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { threshold: 0.42 });

scenes.forEach((scene) => observer.observe(scene));

function initFallbackAnimations() {
  const revealTargets = qsa(".scene-copy, .scene-visual, .pipeline-grid article, .journey-heading, .security-strip");
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.animate(
          [{ opacity: 0, transform: "translateY(35px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 800, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" }
        );
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach((el) => revealObserver.observe(el));
}

function initGsap() {
  const { gsap } = window;
  const pluginNames = [
    "ScrollTrigger", "ScrollSmoother", "ScrollToPlugin", "SplitText",
    "MotionPathPlugin", "Flip", "MorphSVGPlugin", "DrawSVGPlugin",
    "Observer"
  ];
  const plugins = pluginNames.map((name) => window[name]).filter(Boolean);
  gsap.registerPlugin(...plugins);

  if (window.ScrollSmoother) {
    window.ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 0,
      effects: false,
      normalizeScroll: false,
      ignoreMobileResize: true
    });
  }

  const load = gsap.timeline({ defaults: { ease: "power3.out" } });
  load.from(".site-header", { y: -40, opacity: 0, duration: .8 })
      .from(".hero .eyebrow", { y: 20, opacity: 0, duration: .5 }, "-=.25")
      .from(".hero h1", { y: 70, opacity: 0, duration: 1 }, "-=.25")
      .from(".hero-line, .hero-support, .scroll-cta", { y: 30, opacity: 0, stagger: .12, duration: .65 }, "-=.5")
      .from(".hero-stations button", { y: 25, opacity: 0, stagger: .07, duration: .45 }, "-=.4")
      .from(".doc", { x: -120, opacity: 0, rotate: -30, stagger: .08, duration: .7 }, "-=.9")
      .from(".clarity-panel", { x: 80, opacity: 0, duration: .8 }, "-=.7");

  gsap.to(".hero-art", {
    yPercent: 10, scale: 1.12, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".document-cloud", {
    x: 180, y: 90, rotate: 12, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 }
  });
  gsap.to(".river-hero", {
    xPercent: 8, scaleY: 1.3, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }
  });

  qsa(".process-scene").forEach((section) => {
    const copy = qs(".scene-copy", section);
    const visual = qs(".scene-visual", section);
    gsap.from(copy, {
      x: -80, opacity: 0,
      scrollTrigger: { trigger: section, start: "top 65%", end: "top 25%", scrub: 1 }
    });
    gsap.from(visual, {
      x: 100, opacity: 0, scale: .94,
      scrollTrigger: { trigger: section, start: "top 62%", end: "top 18%", scrub: 1 }
    });
  });

  gsap.to(".intake span", {
    x: 190, scale: .35, opacity: 0, stagger: .08,
    scrollTrigger: { trigger: "#capture", start: "top 15%", end: "bottom 40%", scrub: 1 }
  });
  gsap.to(".portal", {
    scale: 1.15, filter: "brightness(1.45)",
    scrollTrigger: { trigger: "#capture", start: "top 20%", end: "bottom 35%", scrub: 1, yoyo: true }
  });

  gsap.from(".ocr-output code", {
    x: 50, opacity: 0, stagger: .15,
    scrollTrigger: { trigger: "#ocr", start: "top 30%", end: "bottom 45%", scrub: 1 }
  });

  gsap.from(".entity-card", {
    scale: .75, opacity: 0, stagger: .18,
    scrollTrigger: { trigger: "#ai", start: "top 30%", end: "bottom 45%", scrub: 1 }
  });
  gsap.to(".neural-core", {
    rotate: 180,
    scrollTrigger: { trigger: "#ai", start: "top 15%", end: "bottom 30%", scrub: 1 }
  });

  const classificationTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#classification",
      start: "top 28%",
      end: "bottom 38%",
      scrub: 1
    }
  });
  classificationTimeline
    .from(".class-document", {
      x: -90,
      y: (index) => (index - 1.5) * 45,
      rotate: (index) => index % 2 ? 14 : -14,
      opacity: 0,
      stagger: .08
    })
    .to(".class-document", {
      x: 150,
      scale: .32,
      opacity: 0,
      stagger: .07
    }, .32)
    .from(".classify-core", {
      scale: .65,
      rotate: -70,
      filter: "brightness(.7)"
    }, .25)
    .from(".confidence-ring", {
      scale: 0,
      opacity: 0
    }, .48)
    .from(".category-card", {
      x: -85,
      opacity: 0,
      stagger: .1
    }, .52)
    .from(".classification-status", {
      y: 28,
      opacity: 0
    }, .72);

  gsap.to(".classify-core", {
    rotate: 360,
    ease: "none",
    scrollTrigger: {
      trigger: "#classification",
      start: "top bottom",
      end: "bottom top",
      scrub: 1.2
    }
  });

  if (location.hash !== "#entities") {
    const extractionTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#entities",
        start: "top 28%",
        end: "bottom 38%",
        scrub: 1
      }
    });
    extractionTimeline
      .from("#entities .extraction-document", {
        x: -70,
        rotate: -3,
        opacity: 0
      })
      .from("#entities .extract-scan-line", {
        scaleX: 0,
        transformOrigin: "left center"
      }, .12)
      .from("#entities .extraction-engine", {
        scale: .55,
        rotate: -90,
        opacity: 0
      }, .25)
      .from("#entities .extracted-entity", {
        x: -75,
        opacity: 0,
        stagger: .09
      }, .42)
      .from("#entities .extraction-status", {
        y: 24,
        opacity: 0
      }, .78);
  }

  gsap.to("#entities .extraction-engine", {
    rotate: 360,
    ease: "none",
    scrollTrigger: {
      trigger: "#entities",
      start: "top bottom",
      end: "bottom top",
      scrub: 1.2
    }
  });

  if (location.hash !== "#metadata") {
    const metadataTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#metadata",
        start: "top 28%",
        end: "bottom 38%",
        scrub: 1
      }
    });
    metadataTimeline
      .from("#metadata .metadata-record", {
        scale: .65,
        rotateY: -35,
        opacity: 0
      })
      .from("#metadata .metadata-links path", {
        strokeDashoffset: 120,
        opacity: 0,
        stagger: .05
      }, .2)
      .from("#metadata .metadata-field", {
        scale: .78,
        x: (index) => index % 2 ? -55 : 55,
        opacity: 0,
        stagger: .08
      }, .34)
      .from("#metadata .metadata-status", {
        y: 24,
        opacity: 0
      }, .78);
  }

  gsap.to("#metadata .orbit-a", {
    rotate: 240,
    ease: "none",
    scrollTrigger: {
      trigger: "#metadata",
      start: "top bottom",
      end: "bottom top",
      scrub: 1.2
    }
  });

  if (location.hash !== "#knowledge-graph") {
    const graphTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#knowledge-graph",
        start: "top 28%",
        end: "bottom 38%",
        scrub: 1
      }
    });
    graphTimeline
      .from("#knowledge-graph .graph-event", {
        scale: .55,
        opacity: 0
      })
      .from("#knowledge-graph .graph-links path", {
        strokeDashoffset: 180,
        opacity: 0,
        stagger: .06
      }, .2)
      .from("#knowledge-graph .graph-node:not(.graph-event)", {
        scale: .65,
        opacity: 0,
        stagger: .08
      }, .34)
      .from("#knowledge-graph .relationship", {
        y: 8,
        opacity: 0,
        stagger: .05
      }, .58)
      .from("#knowledge-graph .graph-status", {
        y: 22,
        opacity: 0
      }, .8);
  }

  gsap.to("#knowledge-graph .halo-a", {
    rotate: 220,
    ease: "none",
    scrollTrigger: {
      trigger: "#knowledge-graph",
      start: "top bottom",
      end: "bottom top",
      scrub: 1.2
    }
  });

  gsap.from(".pipeline-grid article", {
    y: 60, opacity: 0, stagger: .08,
    scrollTrigger: { trigger: ".pipeline-grid", start: "top 78%" }
  });
}

const gsapReady = Boolean(window.gsap && window.ScrollTrigger);
if (gsapReady && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  initGsap();
} else {
  initFallbackAnimations();
}

if (location.hash === "#knowledge-graph") {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const smoother = window.ScrollSmoother?.get?.();
      if (smoother) {
        smoother.scrollTo("#knowledge-graph", false, "top top");
      } else {
        qs("#knowledge-graph")?.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
  });
}
