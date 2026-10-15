import Link from "next/link";
import { type SoftwareProduct } from "./products";

export function TechnicalFlow({
  steps,
  caption = "Иллюстрация принципа работы, не интерфейс программы",
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
    <Link
      className="product-teaser"
      href={`/software/products/${product.slug}`}
    >
      <p className="eyebrow">{product.label}</p>
      <h3>{product.title}</h3>
      <p>{product.problem}</p>
      <span className="text-link">Принцип и результат →</span>
    </Link>
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
    <article className="engineering-entry" id={product.slug}>
      <div className="engineering-entry-visual">
        <p className="eyebrow">
          {String(index + 1).padStart(2, "0")} / {product.label}
        </p>
        <TechnicalFlow steps={product.flow} />
        <p className="engineering-status">{product.status}</p>
        <p className="engineering-cooperation">{product.cooperation}</p>
      </div>
      <div className="engineering-entry-copy">
        <h2>{product.title}</h2>
        <p className="engineering-problem">{product.problem}</p>
        <p>{product.principle}</p>
        <dl className="product-io">
          <div>
            <dt>На входе</dt>
            <dd>{product.input}</dd>
          </div>
          <div>
            <dt>На выходе</dt>
            <dd>{product.output}</dd>
          </div>
        </dl>
        <Link className="text-link" href={`/software/products/${product.slug}`}>
          Функции, применение и ограничения →
        </Link>
      </div>
    </article>
  );
}
