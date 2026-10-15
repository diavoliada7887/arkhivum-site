import Link from "next/link";
import { type SoftwareProduct } from "./products";
import { SolutionVisual } from "./SolutionVisual";

export function TechnicalFlow({
  steps,
  caption = "Схема принципа работы",
}: {
  steps: readonly string[];
  caption?: string;
}) {
  return (
    <figure className="technical-flow">
      <ol aria-label="Последовательность обработки">
        {steps.map((step, i) => (
          <li key={`${i}-${step}`}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
          </li>
        ))}
      </ol>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function ProductTeaser({ product }: { product: SoftwareProduct }) {
  return (
    <article className="product-teaser product-teaser-illustrated">
      <Link
        href={`/software/products/${product.slug}`}
        className="product-visual-link"
        aria-label={`Подробнее: ${product.title}`}
      >
        <SolutionVisual kind={product.slug} compact />
      </Link>
      <div className="product-teaser-copy">
        <p className="eyebrow">{product.label}</p>
        <h3>
          <Link href={`/software/products/${product.slug}`}>
            {product.title}
          </Link>
        </h3>
        <p>{product.benefit}</p>
        <Link className="text-link" href={`/software/products/${product.slug}`}>
          Как работает →
        </Link>
      </div>
    </article>
  );
}

export function EngineeringEntry({
  product,
  index,
}: {
  product: SoftwareProduct;
  index: number;
}) {
  return (
    <article
      className={`portfolio-solution${index < 2 ? " portfolio-solution-leading" : ""}`}
      id={product.slug}
    >
      <Link
        href={`/software/products/${product.slug}`}
        className="product-visual-link"
        aria-label={`Подробнее: ${product.title}`}
      >
        <SolutionVisual kind={product.slug} compact />
      </Link>
      <div className="portfolio-solution-copy">
        <p className="eyebrow">{product.label}</p>
        <h2>
          <Link href={`/software/products/${product.slug}`}>
            {product.title}
          </Link>
        </h2>
        <p>{product.benefit}</p>
        <p className="engineering-status">{product.status}</p>
        <Link className="text-link" href={`/software/products/${product.slug}`}>
          Решение и возможности адаптации →
        </Link>
      </div>
    </article>
  );
}

export function CaseEvidence() {
  return (
    <div className="case-evidence">
      <Link href="/experience/shalya">
        <span>Реальный проект / Шаля</span>
        <strong>От цифровых копий до записей в АИС</strong>
        <span>Карточки, связи с файлами и атрибутивный поиск →</span>
      </Link>
      <Link href="/experience/database-flow">
        <span>Реальный проект / наполнение базы</span>
        <strong>До 5 000 карточек документов в месяц</strong>
        <span>Показатель конкретного проекта, не универсальная норма →</span>
      </Link>
    </div>
  );
}
