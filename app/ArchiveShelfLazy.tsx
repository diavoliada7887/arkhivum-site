"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";

const ArchiveShelf = lazy(() =>
  import("./ArchiveShelf").then((module) => ({ default: module.ArchiveShelf })),
);

export function ArchiveShelfLazy() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={triggerRef}>
      {shouldLoad ? (
        <Suspense fallback={<ArchiveShelfLoading />}>
          <ArchiveShelf />
        </Suspense>
      ) : (
        <ArchiveShelfLoading />
      )}
    </div>
  );
}

function ArchiveShelfLoading() {
  return (
    <section className="archive-shelf-loading" aria-label="Загрузка архивной полки">
      <div className="shell">
        <p className="eyebrow eyebrow-light">Выполненные проекты</p>
        <h2>Архивная полка</h2>
        <span>Собираем десять томов…</span>
      </div>
    </section>
  );
}
