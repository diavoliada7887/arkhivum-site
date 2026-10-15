import Link from "next/link";

export function DirectionNav({ current }: { current: "digitization" | "software" }) {
  return (
    <nav className="direction-nav shell" aria-label="Направления компании">
      <Link href="/">Компания</Link>
      <Link href="/digitization" aria-current={current === "digitization" ? "page" : undefined}>Оцифровка</Link>
      <Link href="/software" aria-current={current === "software" ? "page" : undefined}>Данные и ПО</Link>
      {current === "digitization" ? <>
        <Link href="/services">Услуги</Link><Link href="/equipment">Оборудование</Link><Link href="/prices">Цены</Link>
      </> : <>
        <Link href="/software/data-processing">Данные</Link><Link href="/software/document-automation">Документы</Link><Link href="/software/workflow-automation">Процессы</Link><Link href="/software/products">Разработки</Link>
      </>}
    </nav>
  );
}

/** Editorial illustration of data structure, not a product interface. */
export function DataVisual() {
  return (
    <div className="data-visual" aria-hidden="true">
      <div className="data-orbit data-orbit-one" /><div className="data-orbit data-orbit-two" />
      <div className="data-sheet sheet-back"><span>01 / ИСТОЧНИКИ</span><i /><i /><i /><i /></div>
      <div className="data-sheet sheet-front"><span>02 / СТРУКТУРА</span><div className="data-cells">{Array.from({ length: 12 }, (_, i) => <b key={i} />)}</div><em>ДАННЫЕ → РЕЗУЛЬТАТ</em></div>
    </div>
  );
}
