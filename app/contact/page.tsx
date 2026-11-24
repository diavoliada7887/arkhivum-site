import { PageShell } from "../components";
import { QuoteForm } from "./QuoteForm";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="contact-page">
        <div className="shell contact-page-grid">
          <div>
            <p className="eyebrow">Обсудить проект</p>
            <h1>Получите расчёт проекта</h1>
            <p className="contact-lead">
              Для оцифровки пришлите 5–10 характерных страниц и оценку объёма.
              Для программного решения — пример файлов или описание процесса,
              который хотите автоматизировать. Расскажите, какой результат нужен.
            </p>
            <QuoteForm />
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
                Направление, исходные материалы или данные, объём, сроки
                и желаемый результат. Для разработки — также текущие ручные
                операции и ограничения используемых систем.
              </p>
            </div>
            <a className="button" href="mailto:sale@predikt.ru?subject=Обсуждение%20проекта%20Архивум">Написать напрямую</a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
