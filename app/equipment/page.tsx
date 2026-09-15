import { sitePath } from "../site-path";
import { ContactBand, PageShell } from "../components";

type EquipmentItem = {
  category: string;
  model: string;
  image: string;
  imageAlt: string;
  imageMode?: "cover";
  technical: string;
  tasks: string;
  features: string[];
};

const equipment: EquipmentItem[] = [
  {
    category: "Планетарные книжные сканеры",
    model: "Image Access Bookeye",
    image: "/assets/equipment/bookeye.webp",
    imageAlt:
      "Планетарный книжный сканер Image Access Bookeye с V-образной колыбелью",
    technical:
      "Сканирует оригинал сверху, без протяжки через механизм. Рабочая зона — до A3+, разрешение — до 600 dpi. V-образная колыбель поддерживает книгу при раскрытии примерно на 120°, а система коррекции выравнивает строки и изгиб разворота.",
    tasks:
      "Редкие и ветхие книги, журналы, сшитые архивные дела, альбомы и документы с жёстким переплётом. Выбираем его, когда оригинал нельзя распустить на листы или безопасно раскрыть на 180°.",
    features: ["до A3+", "до 600 dpi", "V-образная колыбель"],
  },
  {
    category: "Поточный сканер",
    model: "Canon imageFORMULA DR-G1100",
    image: "/assets/equipment/canon-dr-g1100.webp",
    imageAlt: "Промышленный поточный сканер Canon imageFORMULA DR-G1100",
    technical:
      "Производственный сканер формата до A3: до 100 страниц или 200 изображений в минуту при двусторонней съёмке. Автоподатчик вмещает до 500 листов; ультразвуковой контроль отслеживает двойную подачу, отдельный датчик — скреплённые листы.",
    tasks:
      "Крупные партии расшитых архивных дел, бухгалтерских и кадровых документов, анкет и офисной россыпи. Это основная машина для стабильного потока, но ветхие, надорванные и скреплённые оригиналы на неё не отправляем.",
    features: ["до A3", "100 стр./мин", "автоподатчик 500 листов"],
  },
  {
    category: "Поточный сканер A3",
    model: "Canon imageFORMULA DR-M1060",
    image: "/assets/equipment/canon-dr-m1060.webp",
    imageAlt: "Компактный поточный сканер Canon imageFORMULA DR-M1060",
    technical:
      "Компактный двусторонний сканер до A3 со скоростью до 60 страниц или 120 изображений в минуту. Автоподатчик рассчитан на 80 листов; прямой и U-образный тракты позволяют обрабатывать бумагу разной плотности и длинные документы.",
    tasks:
      "Смешанные партии, где рядом встречаются A4 и A3, формы, приложения, карточки и листы нестандартной длины. Удобен для небольших и средних массивов, которые требуют больше гибкости, чем тяжёлый промышленный поток.",
    features: ["до A3", "60 стр./мин", "прямой и U-образный тракт"],
  },
  {
    category: "Планшетный сканер",
    model: "Image Access WideTEK 25",
    image: "/assets/equipment/widetek-25.webp",
    imageAlt: "Широкоформатный планшетный сканер Image Access WideTEK 25",
    technical:
      "Планшетный сканер с рабочей областью 635 × 470 мм — немного больше A2. Оптическое разрешение до 1200 × 600 dpi, внутренняя глубина цвета 48 бит; полный планшет при 300 dpi снимается менее чем за 3 секунды.",
    tasks:
      "Карты, чертежи, фотографии, плакаты, листовые издания и хрупкие плоские оригиналы. Материал лежит неподвижно на стекле, поэтому геометрия и мелкие линии сохраняются точнее, чем при протяжке.",
    features: ["A2+ · 635 × 470 мм", "до 1200 × 600 dpi", "48-битный цвет"],
  },
  {
    category: "Широкоформатный сканер",
    model: "Image Access WideTEK 48CL",
    image: "/assets/equipment/widetek-48cl.webp",
    imageAlt:
      "Протяжный широкоформатный сканер Image Access WideTEK 48CL с чертежом",
    technical:
      "Цветной протяжный сканер с рабочей шириной 1220 мм, то есть 48 дюймов. Оригинал подаётся лицевой стороной вверх; CIS-система снимает его с разрешением до 1200 dpi и внутренней глубиной цвета 48 бит.",
    tasks:
      "Длинные рулонные чертежи, инженерные схемы, кадастровые планы, карты и техническая документация формата A0 и шире. Используем только для достаточно прочных оригиналов, которые можно безопасно провести через роликовый тракт.",
    features: ["ширина 1220 мм", "до 1200 dpi", "A0+ и рулонные материалы"],
  },
  {
    category: "Хранение данных",
    model: "Серверные системы хранения",
    image: "/assets/equipment/server-storage.webp",
    imageAlt: "Серверные системы хранения данных",
    imageMode: "cover",
    technical:
      "Собственная серверная инфраструктура общим объёмом более 50 ТБ позволяет одновременно хранить мастер-копии, производные файлы, результаты OCR и служебные данные проекта в единой структуре.",
    tasks:
      "Проекты на сотни тысяч страниц, поэтапная обработка и передача больших партий. Массив не приходится дробить между случайными дисками: файлы можно проверять, пересобирать и готовить к загрузке в систему заказчика.",
    features: ["более 50 ТБ", "мастер-копии и OCR", "большие массивы"],
  },
];

export default function EquipmentPage() {
  return (
    <PageShell>
      <section className="page-hero page-hero-dark equipment-hero">
        <div className="shell page-hero-grid">
          <div>
            <p className="eyebrow">Наше оборудование</p>
            <h1>
              <span>Техника под задачу</span>
              <br />
              <em>а не задача под технику</em>
            </h1>
          </div>
          <p>
            Подбираем технологию под материал, формат и объём — бережно
            оцифровываем редкие издания и уверенно обрабатываем большие массивы
            документов.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell equipment-grid">
          {equipment.map((item, index) => (
            <article className="equipment-card" key={item.model}>
              <div className={`equipment-photo${item.imageMode === "cover" ? " equipment-photo-cover" : ""}`}>
                <img src={sitePath(item.image)} alt={item.imageAlt} />
                <span className="equipment-placeholder-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="equipment-copy">
                <p className="eyebrow">{item.category}</p>
                <h2>{item.model}</h2>
                <div className="equipment-explanation">
                  <div>
                    <strong>Технологически</strong>
                    <p>{item.technical}</p>
                  </div>
                  <div>
                    <strong>Под какие задачи</strong>
                    <p>{item.tasks}</p>
                  </div>
                </div>
                <div className="equipment-tags" aria-label="Характеристики">
                  {item.features.map((feature) => (
                    <span key={feature}>{feature}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section equipment-capacity">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow eyebrow-light">Производственный участок</p>
            <h2>Мощности, которые масштабируются под проект</h2>
          </div>
          <div className="equipment-capacity-grid">
            <article>
              <strong>до 1 000</strong>
              <span>страниц в час на потоковой оцифровке</span>
            </article>
            <article>
              <strong>50+ ТБ</strong>
              <span>собственных серверных систем хранения</span>
            </article>
            <article>
              <strong>на площадке</strong>
              <span>можем развернуть работы у заказчика</span>
            </article>
          </div>
        </div>
      </section>

      <ContactBand
        title="Подберём оборудование под ваш массив"
        text="Покажите несколько типовых оригиналов — предложим технологию, производительность и состав работ."
      />
    </PageShell>
  );
}
