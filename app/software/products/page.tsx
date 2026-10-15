import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, ContactBand, PageShell } from "../../components";
import { DirectionNav } from "../../DirectionNav";
import { softwareProducts } from "../content";

export const metadata: Metadata = { title: "Собственные разработки и прикладные программы", description: "Инструменты PDF и OCR, индексация и файловые операции, прототипы автоматизации закупок и Android-приложение «Хвать»." };
export default function ProductsPage() {
  return <PageShell><DirectionNav current="software" />
    <section className="page-hero"><div className="shell"><Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Данные и ПО", href: "/software" }, { label: "Разработки" }]} /><div className="page-hero-grid"><div><p className="eyebrow">04 / Практическая разработка</p><h1>Собственные инструменты и прикладные программы</h1></div><p>Часть решений используется в собственных процессах, часть проходит разработку и проверку. Здесь показываем назначение и текущий статус. Это витрина опыта; публичных загрузок и продажи лицензий пока нет.</p></div></div></section>
    <section className="section section-paper"><div className="shell software-products-grid">{softwareProducts.map((item, i) => <article className="software-product" id={item.slug} key={item.slug}><div className="software-product-top"><span className="card-number">{String(i + 1).padStart(2, "0")}</span><span className="product-status">{item.status}</span></div><h2>{item.title}</h2><p>{item.description}</p><ul>{item.functions.map(fn => <li key={fn}>{fn}</li>)}</ul><Link className="text-link" href={item.href}>{item.slug === "hvati" ? "Уточнить состояние проекта" : "Подробнее о задачах направления"} →</Link></article>)}</div></section>
    <ContactBand title="Нужен инструмент под ваш процесс?" text="Обсудим, можно ли использовать имеющийся подход или потребуется отдельная разработка. Состав решения, сроки и стоимость определяем после разбора задачи." />
  </PageShell>;
}
