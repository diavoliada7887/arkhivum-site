"use client";

import type { FormEvent } from "react";

const labels: Record<string, string> = {
  direction: "Направление",
  city: "Город",
  volume: "Объём",
  material: "Что нужно обработать",
  result: "Какой результат нужен",
  deadline: "Срок",
  contact: "Контакт для ответа",
};

export function QuoteForm() {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = [...form.entries()]
      .filter(([, value]) => String(value).trim())
      .map(([name, value]) => `${labels[name] ?? name}: ${String(value).trim()}`)
      .join("\n\n");
    window.location.href = `mailto:sale@predikt.ru?subject=${encodeURIComponent("Расчёт проекта Архивум")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="quote-form" onSubmit={submit}>
      <div className="quote-form-row">
        <label>
          Направление
          <select name="direction" required defaultValue="">
            <option value="" disabled>Выберите задачу</option>
            <option>Оцифровка документов</option>
            <option>Комплексная архивная обработка</option>
            <option>Книги, газеты и редкие издания</option>
            <option>Карты и чертежи</option>
            <option>Базы данных и интеграции</option>
            <option>Разработка ПО и автоматизация</option>
          </select>
        </label>
        <label>
          Город
          <input name="city" placeholder="Где находятся материалы" required />
        </label>
      </div>
      <div className="quote-form-row">
        <label>
          Примерный объём
          <input name="volume" placeholder="Листы, дела, коробки, файлы" />
        </label>
        <label>
          Желаемый срок
          <input name="deadline" placeholder="Если он уже определён" />
        </label>
      </div>
      <label>
        Что нужно обработать
        <textarea name="material" rows={4} placeholder="Опишите документы, книги, данные или рабочий процесс" required />
      </label>
      <label>
        Какой результат нужен
        <textarea name="result" rows={4} placeholder="PDF, база данных, поиск, архивные дела, программа или другой результат" />
      </label>
      <label>
        Телефон или электронная почта
        <input name="contact" placeholder="Как с вами связаться" required />
      </label>
      <div className="quote-form-submit">
        <button className="button" type="submit">Сформировать письмо</button>
        <p>Откроется письмо с заполненными данными. К нему можно приложить 5–10 характерных страниц.</p>
      </div>
    </form>
  );
}
