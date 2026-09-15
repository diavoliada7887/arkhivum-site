"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { serviceMenuGroups } from "./content";

export function DesktopNav() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setServicesOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const closeServices = () => setServicesOpen(false);

  return (
    <nav className="desktop-nav" aria-label="Основная навигация">
      <div
        className={`desktop-services-menu${servicesOpen ? " is-open" : ""}`}
        ref={menuRef}
        onMouseEnter={() => setServicesOpen(true)}
        onMouseLeave={closeServices}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            closeServices();
          }
        }}
      >
        <button
          type="button"
          aria-expanded={servicesOpen}
          aria-controls="desktop-services-dropdown"
          onClick={() => setServicesOpen((open) => !open)}
        >
          Услуги
          <span aria-hidden="true">⌄</span>
        </button>
        <div
          className="desktop-services-dropdown"
          id="desktop-services-dropdown"
        >
          <Link
            className="desktop-services-all"
            href="/services"
            onClick={closeServices}
          >
            <span>Все услуги</span>
            <b aria-hidden="true">→</b>
          </Link>
          <div className="desktop-services-groups">
            {serviceMenuGroups.map((group) => (
              <section className="desktop-services-group" key={group.title}>
                <p>{group.title}</p>
                {group.services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    onClick={closeServices}
                  >
                    {service.title}
                  </Link>
                ))}
                {group.extraLinks.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeServices}>
                    {item.title}
                  </Link>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
      <Link href="/experience" onClick={closeServices}>
        Опыт работ
      </Link>
      <Link href="/equipment" onClick={closeServices}>
        Оборудование
      </Link>
      <Link href="/about" onClick={closeServices}>
        О компании
      </Link>
      <Link href="/prices" onClick={closeServices}>
        Цены
      </Link>
    </nav>
  );
}
