import Link from "next/link";

export function DirectionNav({
  current,
}: {
  current: "digitization" | "software";
}) {
  if (current === "software")
    return (
      <nav
        className="software-nav shell"
        aria-label="Навигация программного направления"
      >
        <Link href="/software">Обзор</Link>
        <details className="competence-menu">
          <summary>
            Компетенции <span aria-hidden="true">⌄</span>
          </summary>
          <div className="competence-menu-panel">
            <Link href="/software/data-processing">Инженерия данных</Link>
            <Link href="/software/databases-integrations">
              Базы данных и интеграции
            </Link>
            <Link href="/software/server-solutions">Серверные решения</Link>
            <Link href="/software/document-automation">
              Документы и изображения
            </Link>
            <Link href="/software/workflow-automation">
              Процессы и мониторинг
            </Link>
          </div>
        </details>
        <Link href="/software/products">Разработки</Link>
        <Link
          className="software-nav-contact"
          href="/contact"
          aria-label="Обсудить задачу"
        >
          <span className="nav-contact-full">Обсудить задачу</span>
          <span className="nav-contact-short">Обсудить</span>{" "}
          <span className="nav-contact-arrow" aria-hidden="true">
            ↗
          </span>
        </Link>
      </nav>
    );
  return (
    <nav className="direction-nav shell" aria-label="Направления компании">
      <Link href="/">Компания</Link>
      <Link href="/digitization" aria-current="page">
        Оцифровка
      </Link>
      <Link href="/software">Данные и ПО</Link>
      <Link href="/services">Услуги</Link>
      <Link href="/equipment">Оборудование</Link>
      <Link href="/prices">Цены</Link>
    </nav>
  );
}

/** Editorial illustration of data structure, not a product interface. */
export function DataVisual() {
  return (
    <div className="data-visual" aria-hidden="true">
      <div className="data-orbit data-orbit-one" />
      <div className="data-orbit data-orbit-two" />
      <div className="data-sheet sheet-back">
        <span>01 / ИСТОЧНИКИ</span>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="data-sheet sheet-front">
        <span>02 / СТРУКТУРА</span>
        <div className="data-cells">
          {Array.from({ length: 12 }, (_, i) => (
            <b key={i} />
          ))}
        </div>
        <em>ДАННЫЕ → РЕЗУЛЬТАТ</em>
      </div>
    </div>
  );
}
