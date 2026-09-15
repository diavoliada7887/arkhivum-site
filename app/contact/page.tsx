import { PageShell } from "../components";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="contact-page">
        <div className="shell contact-page-grid">
          <div>
            <p className="eyebrow">Обсудить проект</p>
            <h1>Начнём с нескольких характерных материалов</h1>
            <p className="contact-lead">
              Пришлите 5–10 страниц, примерную оценку объёма и опишите, что
              должно получиться: мастер-копии, PDF, OCR, база или интеграция.
            </p>
          </div>
          <div className="contact-card">
            <p className="eyebrow">Контакты</p>
            <a className="contact-link" href="mailto:sale@predikt.ru">
              sale@predikt.ru
            </a>
            <a className="contact-link" href="tel:+79321211027">
              +7 932 121-10-27
            </a>
            <div className="contact-details">
              <p>
                <strong>География</strong>
                Работаем по всей России, при необходимости разворачиваем
                производство у заказчика.
              </p>
              <p>
                <strong>Что указать в письме</strong>
                Тип материалов, объём, формат оригиналов, сроки и желаемый
                результат.
              </p>
            </div>
            <a
              className="button"
              href="mailto:sale@predikt.ru?subject=Оценка%20проекта%20оцифровки"
            >
              Написать нам
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
