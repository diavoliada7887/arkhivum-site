/**
 * Customer-facing digitization paths, reused by the landing page and both
 * desktop and mobile navigation. Service detail URLs remain unchanged.
 */
export const digitizationTasks = [
  {
    id: "business",
    kicker: "01 / Для предприятий и организаций",
    title: "Оцифровка документов и архивов",
    description:
      "Медицинские карты, договоры, накладные, путевые листы и кадровые дела. Сканирование, поиск и загрузка в вашу систему.",
    image: "/assets/mass-canon-scanner.png",
  },
  {
    id: "books",
    kicker: "02 / Книги и периодика",
    title: "Оцифровка книг, газет, журналов",
    description:
      "Учебники, методички, научные работы, газеты и журналы. Бережное сканирование, PDF и распознавание текста.",
    image: "/assets/rare-book-open.webp",
  },
  {
    id: "collections",
    kicker: "03 / Специальные фонды",
    title: "Библиотеки и архивные коллекции",
    description:
      "Редкие издания, историческая периодика и архивные дела. Подготовка электронных фондов и коллекций.",
    image: "/assets/periodicals-1938-spread.jpeg",
  },
  {
    id: "formats",
    kicker: "04 / Сложные материалы",
    title: "Карты, чертежи и крупные форматы",
    description:
      "Схемы, техническая документация, рулонные материалы и нестандартные оригиналы.",
    image: "/assets/equipment/widetek-48cl.webp",
  },
] as const;
