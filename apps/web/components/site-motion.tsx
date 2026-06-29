"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

const MOTION_SELECTOR = [
  "main > section",
  "main > article",
  "main > div",
  "main section",
  "main article",
  "main header",
  "main footer",
  "main form",
  "main [class*='card']",
  "main [class*='panel']",
  "main [class*='grid'] > *",
  "main [class*='list'] > *",
  "main [class*='row']",
  "main [class*='item']",
  "main [class*='actions']",
  "main [class*='hero__copy']",
  "main [class*='section__head']",
].join(",");

const animatedElements = new WeakSet<Element>();
const preparedElements = new WeakSet<Element>();

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMotionTarget(element: Element) {
  if (!(element instanceof HTMLElement)) return false;
  if (animatedElements.has(element)) return false;
  if (element.closest("[data-motion-ignore], .motion-ignore")) return false;
  if (element.querySelector("[data-motion-ignore], .motion-ignore")) return false;
  if (element.closest("[aria-hidden='true']")) return false;
  if (["SCRIPT", "STYLE", "CANVAS", "SVG", "PATH"].includes(element.tagName)) return false;

  const rect = element.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return false;

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || style.position === "fixed") return false;

  return true;
}

function prepareElement(element: HTMLElement) {
  if (preparedElements.has(element)) return;
  preparedElements.add(element);
  element.classList.add("site-motion-target");
  gsap.set(element, { autoAlpha: 0, y: 18 });
}

function isInRevealViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

function markElementVisible(element: HTMLElement) {
  if (animatedElements.has(element)) return;
  animatedElements.add(element);
  preparedElements.add(element);
  element.classList.add("site-motion-target", "site-motion-visible");
  gsap.set(element, { clearProps: "opacity,visibility,transform" });
}

function revealElement(element: HTMLElement, index = 0) {
  if (animatedElements.has(element)) return;
  animatedElements.add(element);
  element.classList.add("site-motion-visible");

  gsap.to(element, {
    autoAlpha: 1,
    y: 0,
    duration: 0.55,
    delay: Math.min(index * 0.035, 0.18),
    ease: "power2.out",
    clearProps: "opacity,visibility,transform",
  });
}

function collectMotionTargets(root: ParentNode = document) {
  return Array.from(root.querySelectorAll(MOTION_SELECTOR)).filter(isMotionTarget) as HTMLElement[];
}

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let scanFrame = 0;
    const visibleTargets = new WeakMap<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) return;
          revealElement(entry.target, visibleTargets.get(entry.target) ?? 0);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const scan = () => {
      cancelAnimationFrame(scanFrame);
      scanFrame = window.requestAnimationFrame(() => {
        const targets = collectMotionTargets();
        targets.forEach((target, index) => {
          visibleTargets.set(target, index);

          if (isInRevealViewport(target)) {
            if (preparedElements.has(target)) {
              revealElement(target, index);
            } else {
              markElementVisible(target);
            }
            return;
          }

          prepareElement(target);
          observer.observe(target);
        });
      });
    };

    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    scan();

    return () => {
      cancelAnimationFrame(scanFrame);
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
