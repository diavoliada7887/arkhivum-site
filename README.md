# Архивум

Сайт: https://diavoliada7887.github.io/arkhivum-site/

Исходные файлы восстановлены из `Arkhivum-backup-2026-09-15.zip`, версия 48.
Дизайн, тексты, изображения и структура страниц сохранены. Изображения находятся
обычными файлами в `public/assets/`; исходный код — в `app/`.

## Локальная работа

Нужен Node.js 22.13 или новее и Python 3 для проверки результата сборки.

```sh
npm ci
npm run dev
```

Открыть http://localhost:3000/arkhivum-site/ .

## Статическая сборка

```sh
npm run build
npm run verify:export
```

Готовый сайт находится в `out/`. Для просмотра с правильным префиксом разместите
эту папку по адресу `/arkhivum-site/` на статическом HTTP-сервере. Команда
`next start` для статического экспорта не используется.

## Автоматическая публикация

`.github/workflows/deploy-pages.yml` собирает и публикует сайт при каждом push
в `main`, а также при ручном запуске через Actions. Источник Pages в настройках
репозитория должен быть **GitHub Actions**. Секреты и отдельный токен не нужны:
workflow использует штатный `GITHUB_TOKEN` с правами `pages: write` и `id-token: write`.

Технические изменения для GitHub Pages:

- Next.js `output: export`, `basePath: /arkhivum-site`, `trailingSlash: true`;
- все динамические страницы перечислены через `generateStaticParams`;
- обычные изображения, favicon и Three.js-текстуры используют `sitePath`;
- внутренние ссылки используют Next Link с автоматическим base path;
- старые адреса `/cases`, `/cases/[slug]`, `/it` и
  `/services/organization-binding` сохраняются статическими перенаправлениями;
- проверка HTML, CSS и локальных файлов выполняется перед публикацией.

Исходные служебные файлы прежнего Sites/Vinext-развёртывания сохранены для
полноты резервной копии, но GitHub Pages их не запускает. Публикация не зависит
от ChatGPT Sites и не изменяет прежний сайт.
