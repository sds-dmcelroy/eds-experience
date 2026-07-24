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

  const bindScrollChoreography = (animation, trigger, {
    start = "top 68%",
    end = "bottom 38%",
    buildEnd = .72
  } = {}) => {
    let buildingForward = false;

    const resetEntrance = () => {
      animation.pause(0);
      if (typeof animation.getChildren === "function") {
        animation.getChildren(true, true, false).forEach((child) => child.totalProgress(0));
      }
      animation.totalProgress(0).pause();
    };

    resetEntrance();
    window.ScrollTrigger.create({
      trigger,
      start,
      end,
      onEnter: (self) => {
        buildingForward = true;
        animation.totalProgress(Math.min(self.progress / buildEnd, 1)).pause();
      },
      onUpdate: (self) => {
        if (self.direction > 0 && buildingForward) {
          animation.totalProgress(Math.min(self.progress / buildEnd, 1)).pause();
        } else if (self.direction < 0) {
          animation.totalProgress(1).pause();
        }
      },
      onLeave: () => animation.progress(1).pause(),
      onEnterBack: () => {
        buildingForward = false;
        animation.progress(1).pause();
      },
      onLeaveBack: () => animation.progress(1).pause()
    });
    window.ScrollTrigger.create({
      trigger,
      start: "top 96%",
      onLeaveBack: () => {
        buildingForward = false;
        resetEntrance();
      }
    });
    return animation;
  };

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
    if (location.hash === `#${section.id}`) return;
    bindScrollChoreography(gsap.from(copy, {
      x: -80, opacity: 0, ease: "power3.out",
      paused: true
    }), section, { start: "top 92%", end: "top 56%", buildEnd: .88 });
    bindScrollChoreography(gsap.from(visual, {
      x: 100, opacity: 0, scale: .94, ease: "power3.out",
      paused: true
    }), section, { start: "top 88%", end: "top 48%", buildEnd: .9 });
  });

  const capturePortal = qs("#capture .portal");
  const captureFlow = qs("#capture .flow-line");
  if (matchMedia("(max-width: 700px)").matches) {
    const visualBounds = qs("#capture .scene-visual").getBoundingClientRect();
    const portalBounds = capturePortal.getBoundingClientRect();
    const portalShift = visualBounds.top + visualBounds.height / 2
      - portalBounds.top - portalBounds.height / 2;
    gsap.set([capturePortal, captureFlow], { y: portalShift });
  }

  const intakeOffsets = [[-38, -38], [0, -48], [38, -38], [-32, 28], [32, 28]];
  gsap.set("#capture .intake", { zIndex: 4 });
  gsap.set("#capture .portal strong", { position: "relative", zIndex: 5 });

  const captureTimeline = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    paused: true
  });
  captureTimeline
    .from("#capture .intake span", {
      x: -70,
      opacity: 0,
      stagger: .12,
      duration: .7,
      ease: "power3.out"
    })
    .to("#capture .portal", {
      scale: 1.08,
      filter: "brightness(1.25)",
      duration: .7
    }, .34)
    .to("#capture .intake span", {
      x: (index, element) => {
        const source = element.getBoundingClientRect();
        const destination = capturePortal.getBoundingClientRect();
        return destination.left + destination.width / 2 - source.left - source.width / 2 + intakeOffsets[index][0];
      },
      y: (index, element) => {
        const source = element.getBoundingClientRect();
        const destination = capturePortal.getBoundingClientRect();
        return destination.top + destination.height / 2 - source.top - source.height / 2 + intakeOffsets[index][1];
      },
      scale: .22,
      stagger: .15,
      duration: 1.35,
      ease: "power2.inOut"
    }, .72)
    .to("#capture .portal", {
      scale: 1,
      filter: "brightness(1.12)",
      duration: .55
    }, 1.75);

  if (location.hash === "#capture") {
    captureTimeline.progress(1).pause();
  } else {
    bindScrollChoreography(captureTimeline, "#capture", {
      start: "top 62%",
      end: "bottom 34%",
      buildEnd: .74
    });
  }

  bindScrollChoreography(gsap.from(".ocr-output code", {
    x: 50, opacity: 0, stagger: .18, ease: "power3.out",
    paused: true
  }), "#ocr", { start: "top 64%", end: "bottom 40%", buildEnd: .67 });

  bindScrollChoreography(gsap.from(".entity-card", {
    scale: .75, opacity: 0, stagger: .2, ease: "back.out(1.4)",
    paused: true
  }), "#ai", { start: "top 64%", end: "bottom 40%", buildEnd: .68 });
  gsap.to(".neural-core", {
    rotate: 180,
    scrollTrigger: { trigger: "#ai", start: "top 15%", end: "bottom 30%", scrub: 1 }
  });

  const classificationTimeline = gsap.timeline({
    defaults: { duration: .88, ease: "power3.out" },
    paused: true
  });
  classificationTimeline
    .from(".class-document", {
      x: -90,
      y: (index) => (index - 1.5) * 45,
      rotate: (index) => index % 2 ? 14 : -14,
      opacity: 0,
      stagger: .08
    })
    .from(".classify-core", {
      scale: .65,
      rotate: -70,
      filter: "brightness(.7)"
    }, .36)
    .from(".confidence-ring", {
      scale: 0,
      opacity: 0
    }, .62)
    .from(".category-card", {
      x: -85,
      opacity: 0,
      stagger: .1
    }, .7)
    .from(".classification-status", {
      y: 28,
      opacity: 0
    }, 1.02);
  bindScrollChoreography(classificationTimeline, "#classification", {
    start: "top 66%",
    end: "bottom 36%",
    buildEnd: .74
  });

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
      defaults: { duration: .86, ease: "power3.out" },
      paused: true
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
      }, 1.08);
    bindScrollChoreography(extractionTimeline, "#entities", {
      start: "top 66%",
      end: "bottom 36%",
      buildEnd: .75
    });
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
      defaults: { duration: .88, ease: "power3.out" },
      paused: true
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
      }, 1.08);
    bindScrollChoreography(metadataTimeline, "#metadata", {
      start: "top 68%",
      end: "bottom 34%",
      buildEnd: .76
    });
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
      defaults: { duration: .92, ease: "power3.out" },
      paused: true
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
      }, 1.12);
    bindScrollChoreography(graphTimeline, "#knowledge-graph", {
      start: "top 70%",
      end: "bottom 32%",
      buildEnd: .78
    });
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

  if (location.hash !== "#timeline") {
    const mobileTimeline = matchMedia("(max-width: 700px)").matches;
    const timeline = gsap.timeline({
      defaults: { duration: .9, ease: "power3.out" },
      paused: true
    });
    timeline
      .from("#timeline .timeline-line", {
        scaleX: mobileTimeline ? 1 : 0,
        scaleY: mobileTimeline ? 0 : 1
      })
      .from("#timeline .timeline-marker", {
        scale: 0,
        opacity: 0,
        stagger: .08
      }, .12)
      .from("#timeline .timeline-card", {
        y: (index) => index % 2 ? 34 : -34,
        opacity: 0,
        stagger: .08
      }, .22)
      .from("#timeline .timeline-causality span, #timeline .timeline-causality i", {
        x: -10,
        opacity: 0,
        stagger: .04
      }, .58)
      .from("#timeline .timeline-status", {
        y: 22,
        opacity: 0
      }, 1.14);
    bindScrollChoreography(timeline, "#timeline", {
      start: "top 68%",
      end: "bottom 34%",
      buildEnd: .78
    });
  }

  if (location.hash !== "#case-building") {
    const caseTimeline = gsap.timeline({
      defaults: { duration: .92, ease: "power3.out" },
      paused: true
    });
    caseTimeline
      .from("#case-building .case-header", {
        y: -24,
        opacity: 0
      })
      .from("#case-building .case-evidence", {
        x: -42,
        opacity: 0,
        stagger: .08
      }, .16)
      .from("#case-building .case-links path", {
        strokeDashoffset: 120,
        opacity: 0,
        stagger: .06
      }, .28)
      .from("#case-building .case-finding", {
        x: 34,
        opacity: 0,
        stagger: .08
      }, .38)
      .from("#case-building .case-metrics", {
        scale: .82,
        opacity: 0
      }, .52)
      .from("#case-building .sequence-line i", {
        scaleX: 0
      }, .64)
      .from("#case-building .case-sequence span", {
        y: 10,
        opacity: 0,
        stagger: .05
      }, 1.08);
    bindScrollChoreography(caseTimeline, "#case-building", {
      start: "top 70%",
      end: "bottom 32%",
      buildEnd: .8
    });
  }

  if (location.hash !== "#investigation-results") {
    const resultsTimeline = gsap.timeline({
      defaults: { duration: .94, ease: "power3.out" },
      paused: true
    });
    resultsTimeline
      .from("#investigation-results .results-header", {
        y: -24,
        opacity: 0
      })
      .from("#investigation-results .executive-summary", {
        x: -38,
        opacity: 0
      }, .14)
      .from("#investigation-results .results-findings article", {
        x: 28,
        opacity: 0,
        stagger: .07
      }, .28)
      .from("#investigation-results .results-metrics", {
        scale: .8,
        opacity: 0
      }, .42)
      .from("#investigation-results .action-list article", {
        y: 18,
        opacity: 0,
        stagger: .07
      }, .56)
      .from("#investigation-results .completed-seal", {
        scale: .55,
        opacity: 0
      }, .66)
      .from("#investigation-results .results-complete", {
        y: 20,
        opacity: 0
      }, 1.16);
    bindScrollChoreography(resultsTimeline, "#investigation-results", {
      start: "top 72%",
      end: "bottom 30%",
      buildEnd: .8
    });
  }

  bindScrollChoreography(gsap.from(".pipeline-grid article", {
    y: 60, opacity: 0, stagger: .12, ease: "power3.out",
    paused: true
  }), ".pipeline-grid", { start: "top 90%", end: "top 42%", buildEnd: .82 });
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

if (location.hash === "#timeline") {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const smoother = window.ScrollSmoother?.get?.();
      if (smoother) {
        smoother.scrollTo("#timeline", false, "top top");
      } else {
        qs("#timeline")?.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
  });
}

if (location.hash === "#case-building") {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const smoother = window.ScrollSmoother?.get?.();
      if (smoother) {
        smoother.scrollTo("#case-building", false, "top top");
      } else {
        qs("#case-building")?.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
  });
}

if (location.hash === "#investigation-results") {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const smoother = window.ScrollSmoother?.get?.();
      if (smoother) {
        smoother.scrollTo("#investigation-results", false, "top top");
      } else {
        qs("#investigation-results")?.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
  });
}
