export type VisualKey =
  | "sboeboy"
  | "pdfa-pipeline"
  | "document-extraction"
  | "pdf-bookmarks"
  | "image-processing"
  | "source-monitoring"
  | "hvati"
  | "profit"
  | "rpg-life"
  | "databases-integrations"
  | "server-solutions";

export type SolutionVisualAsset = {
  src: string;
  mobileSrc?: string;
  alt: string;
  caption: string;
  kind: "diagram" | "concept" | "screenshot";
};

// Replacing an illustration with a verified screenshot only changes this asset record.
// Keep kind/caption accurate; screenshots must be free of personal data.
const descriptions: Record<VisualKey, string> = {
  sboeboy:
    "В исходном массиве нет файла 003. Проверка отмечает пропуск, а предпросмотр показывает нормализацию обозначений сторон листа 004. Отсутствующий файл не создаётся.",
  "pdfa-pipeline":
    "Стопка изображений проходит проверку структуры и распознавание. На выходе — многостраничный PDF/A с текстовым слоем и журналом.",
  "document-extraction":
    "Условный приказ превращается в запись с типом документа, датой, номером и заголовком. Реквизиты доступны для проверки.",
  "pdf-bookmarks":
    "PDF и таблица содержания используются для создания иерархии разделов и вложенных закладок с учётом смещения страниц.",
  "image-processing":
    "Условная газетная страница до и после коррекции наклона и размеров. Схема объясняет геометрическую подготовку, а не обещает восстановление любых дефектов.",
  "source-monitoring":
    "Три условных источника проходят фильтры по названию, цене и параметрам. Отобранные сведения поступают в уведомление.",
  "databases-integrations":
    "Документ и справочники связаны с карточкой, содержащей реквизиты и ссылку на файл. Модель используется для поиска и обмена.",
  "server-solutions":
    "Источники поступают в рабочий контур хранения и программной обработки. Результат проходит контроль и передаётся для доступа или выдачи.",
  hvati:
    "Концепт мобильного сценария «Хвать»: медиассылка, выбор видео или аудио, параметры качества и загрузка файла.",
  profit:
    "Концепт «Профицита»: бюджет по периодам, сопоставление плана и факта, история и резервное копирование. Полосы условные и не отражают личные финансы.",
  "rpg-life":
    "Концепт RPG Life: активная задача, записанное действие, обновление прогресса и сохранение истории. Показан условный сценарий.",
};

export const solutionVisuals = Object.fromEntries(
  Object.entries(descriptions).map(([key, alt]) => {
    const concept = ["hvati", "profit", "rpg-life"].includes(key);
    return [
      key,
      {
        src: `/assets/solutions/${key}.svg`,
        mobileSrc: `/assets/solutions/${key}-mobile.svg`,
        alt,
        caption: concept
          ? "Концепт интерфейса · условные данные"
          : "Схема принципа работы · условные данные",
        kind: concept ? "concept" : "diagram",
      },
    ];
  }),
) as Record<VisualKey, SolutionVisualAsset>;
