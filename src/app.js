const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

const progress = qs(".progress span");
const sceneProgress = qs(".scene-progress");
const sceneProgressFill = qs(".scene-progress span");
const sceneTicks = qs(".scene-ticks");
const sceneNav = qs(".scene-nav");
const navLinks = qsa(".scene-nav a");
const scenes = qsa("[data-scene]");
const sceneTickLabels = ["H", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "J", "13"];
sceneTicks.innerHTML = scenes.map((scene, index) => `<i><b>${sceneTickLabels[index]}</b></i>`).join("");
const sceneTickItems = qsa("i", sceneTicks);
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function updateSceneTickPositions() {
  const pageHeight = document.documentElement.scrollHeight;
  const maxScroll = Math.max(pageHeight - innerHeight, 1);
  const estimatedThumbHeight = Math.max(36, innerHeight * (innerHeight / pageHeight));
  const thumbTravel = Math.max(innerHeight - estimatedThumbHeight, 1);

  scenes.forEach((scene, index) => {
    const sceneStart = Math.min(scene.offsetTop, maxScroll);
    sceneTickItems[index].style.top = `${sceneStart / maxScroll * thumbTravel}px`;
  });
}

function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const ratio = max > 0 ? scrollY / max : 0;
  progress.style.width = `${ratio * 100}%`;

  let activeScene = scenes[0];
  for (const scene of scenes) {
    if (scene.offsetTop <= scrollY + 1) activeScene = scene;
    else break;
  }

  const activeIndex = scenes.indexOf(activeScene);
  sceneTickItems.forEach((tick, index) => {
    tick.classList.toggle("completed", index < activeIndex);
    tick.classList.toggle("active", index === activeIndex);
  });
  const nextScene = scenes[activeIndex + 1];
  const sceneStart = activeScene?.offsetTop || 0;
  const sceneEnd = nextScene?.offsetTop ?? document.documentElement.scrollHeight;
  const sceneDistance = Math.max(sceneEnd - sceneStart, 1);
  const sceneRatio = Math.min(Math.max((scrollY - sceneStart) / sceneDistance, 0), 1);
  const scenePercent = Math.round(sceneRatio * 100);

  sceneProgressFill.style.transform = `scaleY(${sceneRatio})`;
  sceneProgress.setAttribute("aria-valuenow", scenePercent);
  sceneProgress.setAttribute("aria-label", `Progress through ${activeScene?.id || "current scene"}`);
}
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", () => {
  updateProgress();
  updateSceneTickPositions();
});
addEventListener("load", updateSceneTickPositions);
updateProgress();
updateSceneTickPositions();

qsa(".hero-stations button").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    target?.scrollIntoView({ behavior: "smooth" });
  });
});

const requestDialog = qs(".request-dialog");
const requestForm = qs(".request-form");
const requestTitle = qs("#request-title");
const requestIntro = qs(".request-intro");
const demoFields = qs(".request-demo");
const evaluationFields = qs(".request-evaluation");

function openRequestDialog(type) {
  const isDemo = type === "demo";
  requestForm.reset();
  requestForm.dataset.requestType = type;
  requestTitle.textContent = isDemo ? "Schedule a Demo" : "Request an Evaluation";
  requestIntro.textContent = isDemo
    ? "Tell us about your organization so we can prepare a useful demonstration."
    : "Tell us about your goals so we can prepare an appropriate evaluation.";
  demoFields.hidden = !isDemo;
  evaluationFields.hidden = isDemo;
  requestDialog.showModal();
  requestForm.elements.name.focus();
}

qsa("[data-request]").forEach((button) => {
  button.addEventListener("click", () => openRequestDialog(button.dataset.request));
});

qsa(".dialog-close, .request-cancel").forEach((button) => {
  button.addEventListener("click", () => requestDialog.close());
});

requestDialog.addEventListener("click", (event) => {
  const bounds = requestDialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) requestDialog.close();
});

function buildRequestMailto(form) {
  const data = new FormData(form);
  const isDemo = form.dataset.requestType === "demo";
  const subject = isDemo ? "Schedule a Demo" : "Request an Evaluation";
  const lines = [
    `EDS ${subject}`,
    "",
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Phone: ${data.get("phone") || "Not provided"}`,
    `Firm / Organization: ${data.get("firm")}`,
    `Organization Type: ${data.get("firmType")}`,
    `Estimated Users: ${data.get("users")}`,
    `Office Footprint: ${data.get("offices")}`,
    `States / Regions: ${data.get("regions")}`,
    `Referral Source: ${data.get("referral")}`,
    ""
  ];

  if (isDemo) {
    lines.push(
      `Demo Interest: ${data.get("demoInterest")}`,
      `Preferred Timing: ${data.get("demoTiming") || "Not specified"}`,
      ""
    );
  } else {
    lines.push(
      `Evaluation Timeframe: ${data.get("evaluationTiming")}`,
      `Preferred Deployment: ${data.get("deployment")}`,
      ""
    );
  }

  lines.push("Challenge / Goals:", data.get("challenge"));
  return `mailto:dmcelroy@securediscovery.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

requestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!requestForm.reportValidity()) return;
  const mailto = buildRequestMailto(requestForm);
  requestDialog.close();
  window.location.href = mailto;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${entry.target.id}`;
      link.classList.toggle("active", isActive);
      if (isActive && sceneNav?.scrollWidth > sceneNav.clientWidth) {
        sceneNav.scrollTo({
          left: link.offsetLeft - (sceneNav.clientWidth - link.clientWidth) / 2,
          behavior: prefersReducedMotion.matches ? "auto" : "smooth"
        });
      }
    });
  });
}, { threshold: 0.42 });

scenes.forEach((scene) => observer.observe(scene));

if (!prefersReducedMotion.matches) {
  const motionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("motion-active", entry.isIntersecting);
    });
  }, { rootMargin: "18% 0px", threshold: 0 });
  qsa(".hero, .process-scene").forEach((scene) => motionObserver.observe(scene));
}

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

function initReducedMotion() {
  qsa(".reveal").forEach((el) => el.classList.remove("reveal"));
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
  window.ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true
  });
  window.ScrollTrigger.getAll()
    .filter((trigger) => trigger.vars.id?.startsWith("eds-"))
    .forEach((trigger) => trigger.kill());

  if (window.ScrollSmoother) {
    window.ScrollSmoother.get() || window.ScrollSmoother.create({
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
    let completed = false;
    const triggerElement = typeof trigger === "string" ? qs(trigger) : trigger;
    const triggerName = triggerElement?.id || "sequence";
    const triggerIndex = window.ScrollTrigger.getAll().length;

    const resetEntrance = () => {
      completed = false;
      animation.pause(0);
      if (typeof animation.getChildren === "function") {
        animation.getChildren(true, true, false).forEach((child) => child.totalProgress(0));
      }
      animation.totalProgress(0).pause();
    };
    const completeEntrance = () => {
      completed = true;
      buildingForward = false;
      animation.totalProgress(1).pause();
    };
    const renderForwardProgress = (scrollProgress) => {
      const animationProgress = Math.min(scrollProgress / buildEnd, 1);
      animation.totalProgress(animationProgress).pause();
      if (animationProgress >= 1) {
        completed = true;
      }
    };

    resetEntrance();
    window.ScrollTrigger.create({
      id: `eds-${triggerName}-build-${triggerIndex}`,
      trigger,
      start,
      end,
      fastScrollEnd: true,
      onEnter: (self) => {
        buildingForward = true;
        renderForwardProgress(self.progress);
      },
      onUpdate: (self) => {
        if (self.direction > 0 && buildingForward) {
          renderForwardProgress(self.progress);
        } else if (self.direction < 0 && self.isActive) {
          completeEntrance();
        }
      },
      onLeave: completeEntrance,
      onEnterBack: completeEntrance,
      onLeaveBack: completeEntrance,
      onRefresh: (self) => {
        if (completed || self.progress >= buildEnd) {
          completeEntrance();
        } else if (buildingForward && self.isActive) {
          animation.invalidate();
          renderForwardProgress(self.progress);
        }
      }
    });
    window.ScrollTrigger.create({
      id: `eds-${triggerName}-reset-${triggerIndex}`,
      trigger,
      start: "top 96%",
      onLeaveBack: () => {
        buildingForward = false;
        resetEntrance();
      },
      onUpdate: (self) => {
        if (self.direction < 0 && self.progress === 0) {
          buildingForward = false;
          resetEntrance();
        }
      },
      onRefresh: (self) => {
        if (!self.isActive && self.progress === 0) {
          buildingForward = false;
          resetEntrance();
        }
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

  const responsiveMotion = gsap.matchMedia();
  responsiveMotion.add("(min-width: 1001px) and (min-height: 721px)", () => {
    gsap.to(".hero-art", {
      yPercent: 10, scale: 1.12, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    const heroDocuments = qsa(".document-cloud .doc");
    const intakeDocuments = qsa("#capture .intake span");
    const handoffLayer = document.createElement("div");
    handoffLayer.className = "document-handoff";
    document.body.append(handoffLayer);
    const flyingDocuments = heroDocuments.map((documentIcon) => {
      const clone = documentIcon.cloneNode(true);
      handoffLayer.append(clone);
      gsap.set(clone, { clearProps: "opacity,visibility,transform", opacity: 1 });
      return clone;
    });
    const starts = [];
    const destinations = [];
    const measureHandoff = () => {
      heroDocuments.forEach((documentIcon, index) => {
        const source = documentIcon.getBoundingClientRect();
        const destination = intakeDocuments[index].getBoundingClientRect();
        starts[index] = { x: source.left, y: source.top, width: source.width, height: source.height };
        destinations[index] = {
          x: destination.left,
          y: destination.top + scrollY - qs("#capture").offsetTop,
          width: destination.width,
          height: destination.height
        };
      });
    };
    measureHandoff();
    let handoffTimeline;
    handoffTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: 1,
        endTrigger: "#capture",
        end: "top top",
        scrub: 1,
        invalidateOnRefresh: true,
        onEnter: () => {
          measureHandoff();
          handoffTimeline?.invalidate();
          gsap.set(handoffLayer, { display: "block" });
          gsap.set(heroDocuments, { autoAlpha: 0 });
          gsap.set(intakeDocuments, { autoAlpha: 0 });
          document.documentElement.classList.add("document-handoff-active");
        },
        onEnterBack: () => {
          measureHandoff();
          handoffTimeline?.invalidate();
          gsap.set(handoffLayer, { display: "block" });
          gsap.set(heroDocuments, { autoAlpha: 0 });
          gsap.set(intakeDocuments, { autoAlpha: 0 });
          document.documentElement.classList.add("document-handoff-active");
        },
        onLeave: () => {
          gsap.set(handoffLayer, { display: "none" });
          gsap.set(intakeDocuments, { clearProps: "visibility,opacity" });
          document.documentElement.classList.remove("document-handoff-active");
        },
        onLeaveBack: () => {
          gsap.set(handoffLayer, { display: "none" });
          gsap.set(heroDocuments, { clearProps: "visibility,opacity" });
          gsap.set(intakeDocuments, { clearProps: "visibility,opacity" });
          document.documentElement.classList.remove("document-handoff-active");
        },
        onRefresh: measureHandoff
      }
    });
    handoffTimeline.fromTo(flyingDocuments, {
      left: (index) => starts[index].x,
      top: (index) => starts[index].y,
      width: (index) => starts[index].width,
      height: (index) => starts[index].height,
      rotate: (index) => index % 2 ? 8 : -8
    }, {
      left: (index) => destinations[index].x,
      top: (index) => destinations[index].y,
      width: (index) => destinations[index].width,
      height: (index) => destinations[index].height,
      rotate: 0,
      duration: 1,
      ease: "power1.inOut"
    });
    if (scrollY === 0) {
      gsap.set(intakeDocuments, { clearProps: "visibility,opacity" });
    }
    return () => {
      handoffLayer.remove();
      gsap.set(heroDocuments, { clearProps: "visibility,opacity" });
      gsap.set(intakeDocuments, { clearProps: "visibility,opacity" });
      document.documentElement.classList.remove("document-handoff-active");
    };
  });

  qsa(".process-scene").forEach((section, index) => {
    const copy = qs(".scene-copy", section);
    const visual = qs(".scene-visual", section);
    const isAlternating = index % 2 === 1 && innerWidth > 1000;
    if (location.hash === `#${section.id}`) return;
    bindScrollChoreography(gsap.from(copy, {
      x: isAlternating ? 80 : -80, opacity: 0, ease: "power3.out",
      paused: true
    }), section, { start: "top 92%", end: "top 56%", buildEnd: .88 });
    bindScrollChoreography(gsap.from(visual, {
      x: isAlternating ? -100 : 100, opacity: 0, scale: .94, ease: "power3.out",
      paused: true
    }), section, { start: "top 88%", end: "top 48%", buildEnd: .9 });
  });

  const capturePortal = qs("#capture .portal");
  const captureFlow = qs("#capture .flow-line");
  responsiveMotion.add("(max-width: 700px)", () => {
    const visualBounds = qs("#capture .scene-visual").getBoundingClientRect();
    const portalBounds = capturePortal.getBoundingClientRect();
    const portalShift = visualBounds.top + visualBounds.height / 2
      - portalBounds.top - portalBounds.height / 2;
    gsap.set([capturePortal, captureFlow], { y: portalShift });
    return () => gsap.set([capturePortal, captureFlow], { clearProps: "y" });
  });

  const intakeOffsets = [[-48, -44], [0, -54], [48, -44], [-54, 18], [0, 30], [54, 18], [0, 58]];
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

  if (location.hash !== "#collaboration") {
    const collaborationTimeline = gsap.timeline({
      defaults: { duration: .88, ease: "power3.out" },
      paused: true
    });
    collaborationTimeline
      .from("#collaboration .collab-binder", {
        y: 48,
        scale: .72,
        rotateY: -18,
        opacity: 0
      })
      .from("#collaboration .workspace-boundary", {
        scale: .94,
        opacity: 0
      }, .28)
      .from("#collaboration .participant", {
        x: (index) => index === 1 ? 46 : -46,
        y: (index) => index === 2 ? 24 : 0,
        opacity: 0,
        stagger: .13
      }, .52)
      .from("#collaboration .collaboration-links path", {
        strokeDashoffset: 150,
        opacity: 0,
        stagger: .1
      }, .9)
      .from("#collaboration .annotation", {
        scale: .65,
        opacity: 0,
        stagger: .1,
        ease: "back.out(1.35)"
      }, 1.18)
      .fromTo("#collaboration .collaboration-tasks span", {
        y: 14,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        stagger: .08
      }, 1.48)
      .from("#collaboration .activity-trail", {
        x: 34,
        opacity: 0
      }, 1.68)
      .from("#collaboration .activity-trail li", {
        x: 14,
        opacity: 0,
        stagger: .09
      }, 1.82)
      .from("#collaboration .collaboration-river i", {
        scaleX: 0,
        transformOrigin: "left center",
        stagger: .08
      }, 2.02)
      .from("#collaboration .collaboration-river span", {
        x: -90,
        opacity: 0,
        stagger: .1
      }, 2.08)
      .from("#collaboration .collaboration-complete", {
        y: 16,
        opacity: 0
      }, 2.34);
    bindScrollChoreography(collaborationTimeline, "#collaboration", {
      start: "top 72%",
      end: "bottom 28%",
      buildEnd: .82
    });
  }

  if (location.hash !== "#deployment") {
    const deploymentTimeline = gsap.timeline({
      defaults: { duration: .92, ease: "power3.out" },
      paused: true
    });
    deploymentTimeline
      .from("#deployment .deployment-core", {
        scale: 1.65,
        opacity: 0,
        filter: "brightness(1.25)"
      })
      .from("#deployment .deployment-boundary", {
        scale: .8,
        opacity: 0
      }, .3)
      .from("#deployment .deployment-destination", {
        x: (index) => index === 0 ? 65 : -65,
        y: (index) => index === 0 ? 18 : index === 1 ? 48 : -48,
        scale: .88,
        opacity: 0,
        stagger: .16
      }, .62)
      .from("#deployment .infra-racks i, #deployment .infra-private i, #deployment .infra-cloud i", {
        scaleY: 0,
        transformOrigin: "center bottom",
        opacity: 0,
        stagger: .06
      }, .96)
      .from("#deployment .deployment-paths path", {
        strokeDashoffset: 165,
        opacity: 0,
        stagger: .13
      }, 1.18)
      .fromTo("#deployment .deployment-badges span", {
        y: 13,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        stagger: .08
      }, 1.62)
      .from("#deployment .deployment-status", {
        y: 16,
        opacity: 0
      }, 2.08);
    bindScrollChoreography(deploymentTimeline, "#deployment", {
      start: "top 72%",
      end: "bottom 28%",
      buildEnd: .8
    });
  }

  const finalTimeline = gsap.timeline({
    defaults: { duration: .92, ease: "power3.out" },
    paused: true
  });
  finalTimeline
      .to("#final-experience .deployment-echo", {
        scale: .68,
        opacity: .08
      })
      .from("#final-experience .final-horizon", {
        scaleX: 0,
        opacity: 0,
        transformOrigin: "center center"
      }, .14)
      .from("#final-experience .final-river path", {
        strokeDashoffset: 260,
        opacity: 0,
        stagger: .08
      }, .3)
      .from("#final-experience .final-particles i", {
        x: (index) => index < 3 ? -150 : 150,
        opacity: 0,
        stagger: .08
      }, .52)
      .from("#final-experience .final-binder", {
        y: -48,
        scale: .8,
        opacity: 0
      }, .72)
      .from("#final-experience .final-content .eyebrow, #final-experience .final-content h2", {
        y: 28,
        opacity: 0,
        stagger: .12
      }, 1.12)
      .from("#final-experience .final-subheading, #final-experience .final-support", {
        y: 18,
        opacity: 0,
        stagger: .12
      }, 1.42)
      .fromTo("#final-experience .final-actions button", {
        y: 18,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        stagger: .12
      }, 1.72)
      .fromTo("#final-experience .final-indicators span", {
        y: 12,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        stagger: .08
      }, 2.02);
  if (location.hash === "#final-experience") {
    finalTimeline.progress(1).pause();
  } else {
    bindScrollChoreography(finalTimeline, "#final-experience", {
      start: "top 76%",
      end: "bottom bottom",
      buildEnd: .76
    });
  }

  bindScrollChoreography(gsap.from(".pipeline-grid article", {
    y: 60, opacity: 0, stagger: .12, ease: "power3.out",
    paused: true
  }), ".pipeline-grid", { start: "top 90%", end: "top 42%", buildEnd: .82 });
}

const gsapReady = Boolean(window.gsap && window.ScrollTrigger);
if (prefersReducedMotion.matches) {
  initReducedMotion();
} else if (gsapReady) {
  initGsap();
} else {
  initFallbackAnimations();
}

const directScene = location.hash ? document.getElementById(location.hash.slice(1)) : null;
if (directScene?.matches("[data-scene]")) {
  const positionDirectScene = () => {
    window.ScrollTrigger?.refresh();
    requestAnimationFrame(() => {
      const smoother = window.ScrollSmoother?.get?.();
      if (smoother) {
        smoother.scrollTo(directScene, false, "top top");
      } else {
        directScene.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
  };
  if (document.readyState === "complete") {
    positionDirectScene();
  } else {
    addEventListener("load", positionDirectScene, { once: true });
  }
}

let refreshTimer;
addEventListener("resize", () => {
  updateProgress();
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => window.ScrollTrigger?.refresh(), 180);
}, { passive: true });
