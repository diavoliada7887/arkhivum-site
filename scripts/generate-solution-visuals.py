"""Generate editorial SVG diagrams with fictional examples; no product screenshots."""
from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parents[1] / 'public/assets/solutions'
NAVY, PANEL, PAPER, GOLD, PALE, MUTED = '#101d31', '#1a2c41', '#faf8f2', '#d2b27c', '#f2ede3', '#9caaba'

class Scene:
    def __init__(self, mobile=False):
        self.m = mobile
        self.w, self.h = (360, 520) if mobile else (720, 420)
        self.s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" fill="none"><rect width="100%" height="100%" fill="{NAVY}"/>']
        for x in range(24, self.w, 36): self.line(x, 20, x, self.h-20, '#d2b27c', '.045')
    def rect(self,x,y,w,h,fill=PANEL,stroke=None,r=0):
        self.s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}"' if stroke else '')+'/>')
    def text(self,x,y,t,size=16,color=PALE,weight=400):
        self.s.append(f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial, Helvetica, sans-serif" font-size="{size}" font-weight="{weight}">{escape(t)}</text>')
    def line(self,x1,y1,x2,y2,color=GOLD,opacity=1):
        self.s.append(f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{color}" opacity="{opacity}"/>')
    def arrow(self,x1,y1,x2,y2):
        self.line(x1,y1,x2,y2)
        if y1==y2: self.s.append(f'<path d="M{x2-6} {y2-4} L{x2} {y2} L{x2-6} {y2+4}" stroke="{GOLD}"/>')
        else: self.s.append(f'<path d="M{x2-4} {y2-6} L{x2} {y2} L{x2+4} {y2-6}" stroke="{GOLD}"/>')
    def label(self,x,y,t): self.text(x,y,t,11,GOLD,600)
    def lines(self,x,y,w,n=4,color='#b9b3a8'):
        for i in range(n): self.line(x,y+i*13,x+w-(i%3)*w*.13,y+i*13,color,.7)
    def page(self,x,y,w=110,h=145,title='Документ',tilt=0):
        if tilt: self.s.append(f'<g transform="rotate({tilt} {x+w/2} {y+h/2})">')
        self.rect(x,y,w,h,PAPER)
        self.text(x+12,y+24,title,11,NAVY,600)
        self.lines(x+12,y+43,w-24,max(2,int((h-62)/13)))
        if tilt:self.s.append('</g>')
    def box(self,x,y,w,h,title,subtitle=None):
        self.rect(x,y,w,h,PANEL,'#68717a')
        self.text(x+14,y+25,title,min(16,round((w-28)/max(len(title)*.58,1),1)),PALE,600)
        if subtitle:self.text(x+14,y+47,subtitle,12,MUTED)
    def write(self,name):
        self.s.append('</svg>')
        (OUT/(name+('-mobile' if self.m else '')+'.svg')).write_text(''.join(self.s))

def sboeboy(a):
    a.label(24,30,'СТРУКТУРА ФАЙЛОВ / ПЛАН ИЗМЕНЕНИЙ')
    if a.m:
        a.box(24,53,312,170,'Исходный массив')
        for i,t in enumerate(['001.jpg','002.jpg','004.jpg','004_об.jpg']):a.text(44,113+i*27,t,17,GOLD if i>1 else PALE)
        a.label(25,254,'003: ПРОПУСК · НУЖНА СВЕРКА')
        a.arrow(180,270,180,302)
        a.box(24,316,312,150,'Предпросмотр именования')
        a.text(42,380,'004.jpg → 004_0.jpg',16)
        a.text(42,412,'004_об.jpg → 004_1.jpg',16,GOLD)
        a.text(26,493,'Изменения — после подтверждения',13,MUTED)
    else:
        a.box(26,76,205,251,'Исходный массив')
        for i,t in enumerate(['001.jpg','002.jpg','004.jpg','004_об.jpg']):a.text(44,144+i*37,t,18,GOLD if i>1 else PALE)
        a.arrow(240,201,286,201)
        a.rect(295,111,146,185,'#2b3541')
        a.label(310,137,'ПРОВЕРКА')
        for i,t in enumerate(['003: пропуск','004: лицо','004_об: оборот']):a.text(309,180+i*31,t,14,GOLD if i==0 else PALE)
        a.arrow(450,201,482,201)
        a.box(492,76,202,251,'План именования')
        for i,t in enumerate(['001.jpg','002.jpg','004_0.jpg','004_1.jpg']):a.text(510,144+i*37,t,18,GOLD if i>1 else PALE)
        a.text(28,374,'Нумерация не восстанавливает отсутствующий файл: пропуск нужно проверить.',13,MUTED)

def pdfa(a):
    a.label(24,30,'ИЗ ПАПКИ С ИЗОБРАЖЕНИЯМИ — В ДОКУМЕНТ')
    if a.m:
        for i in range(3):a.page(70+i*24,68+i*8,155,126,'Страница '+str(i+1))
        for y,t in [(250,'Проверка структуры'),(303,'OCR · текстовый слой')]:a.box(35,y,290,42,t)
        a.arrow(180,220,180,244);a.arrow(180,294,180,300)
        a.rect(75,381,210,100,PAPER);a.text(94,413,'PDF/A-1b',26,NAVY,600);a.text(94,450,'Страницы + поиск',15,NAVY)
        a.arrow(180,349,180,374)
    else:
        for i in range(3):a.page(36+i*23,87+i*15,130,160,'Страница '+str(i+1))
        a.arrow(235,189,275,189)
        a.box(289,98,176,68,'Структура','Порядок и комплектность')
        a.arrow(377,171,377,199)
        a.box(289,211,176,69,'Распознавание','Поисковый текст')
        a.arrow(475,189,516,189)
        a.page(540,77,146,210,'Готовый документ')
        a.rect(553,216,120,47,GOLD);a.text(562,246,'PDF/A-1b',21,NAVY,600)
        a.label(35,342,'ИЗОБРАЖЕНИЯ');a.label(289,342,'ПРОИЗВОДСТВЕННЫЕ ЭТАПЫ');a.label(540,342,'СБОРКА / ВЫХОД')
        a.text(35,380,'Части по логическим листам · исходники сохранены · JSON-журнал',14,MUTED)

def extraction(a):
    a.label(24,30,'ДОКУМЕНТ → ПРОВЕРЯЕМЫЕ ПОЛЯ')
    x,y,w,h=(35,58,290,160) if a.m else (34,68,270,276)
    a.rect(x,y,w,h,PAPER);a.text(x+18,y+35,'ПРИКАЗ',22,NAVY,600)
    a.text(x+18,y+65,'01.03.2026    № 12',15,NAVY)
    a.rect(x+13,y+82,w-26,36,'#e8dcc6');a.text(x+18,y+105,'Об учёте документов',16,NAVY)
    a.lines(x+18,y+134,w-36,1 if a.m else 8)
    if a.m:a.arrow(180,232,180,264);x,y,w=24,282,312
    else:a.arrow(320,203,375,203);x,y,w=396,68,294
    a.box(x,y,w,210,'Извлечённые реквизиты')
    for i,(k,v) in enumerate([('Тип','Приказ'),('Дата','01.03.2026'),('Номер','12'),('Заголовок','Об учёте документов')]):
        yy=y+64+i*36;a.text(x+15,yy,k,12,MUTED);a.text(x+94,yy,v,13 if a.m else 14,GOLD if i==3 else PALE)
    if not a.m:
        a.text(x,315,'OCR-PDF → правила → Excel',15,GOLD)
        a.text(35,385,'«Изя»: отдельная экспериментальная линия с EasyOCR и локальной моделью.',13,MUTED)

def bookmarks(a):
    a.label(24,30,'СОДЕРЖАНИЕ ТАБЛИЦЫ СТАНОВИТСЯ НАВИГАЦИЕЙ')
    if a.m:
        a.page(35,60,100,125,'PDF')
        a.box(155,60,170,125,'Excel','Раздел · страница')
        a.text(171,139,'01  Основы  ·  5',13,GOLD)
        a.arrow(180,204,180,244);x,y,w=24,264,312
    else:
        a.page(30,100,110,160,'PDF')
        a.text(156,190,'+',32,GOLD)
        a.box(200,100,206,160,'Таблица содержания')
        for i,t in enumerate(['01  Основы     5','02  Порядок   12','    Приложение  18']):a.text(218,164+i*28,t,14,GOLD)
        a.arrow(418,184,466,184);x,y,w=490,76,204
    a.box(x,y,w,200,'PDF с оглавлением')
    for i,(t,indent) in enumerate([('▾ Основы',0),('Общие положения',12),('▾ Порядок',0),('Приложение',12)]):
        a.line(x+16+indent,y+68+i*28,x+24+indent,y+68+i*28,GOLD)
        a.text(x+30+indent,y+73+i*28,t,13,GOLD if indent else PALE)
    a.text(25,a.h-25,'Разделы и вложенные элементы · учёт смещения страниц',12,MUTED)

def image_processing(a):
    a.label(24,30,'ГЕОМЕТРИЯ И РАЗМЕР СТРАНИЦЫ')
    positions=[(34,80,280,253),(405,80,280,253)] if not a.m else [(24,63,312,177),(24,301,312,177)]
    for i,(x,y,w,h) in enumerate(positions):
        a.rect(x,y,w,h,PANEL)
        a.label(x+14,y+25,'ИСХОДНОЕ ПОЛОТНО' if i==0 else 'ПОДГОТОВЛЕННОЕ ПОЛОТНО')
        px,py,pw,ph=(x+35,y+45,w-70,h-60)
        a.page(px,py,pw,ph,'Условная газета',-6 if i==0 else 0)
        if i==1:
            for yy in [py-5,py+ph+5]:a.line(px-8,yy,px+pw+8,yy,GOLD)
            a.line(px-5,py-5,px-5,py+ph+5,GOLD)
    if a.m:a.arrow(180,252,180,285)
    else:a.arrow(331,210,384,210)
    a.text(24,a.h-16,'Условный пример выравнивания; не гарантия исправления любых дефектов.',11,MUTED)

def monitoring(a):
    a.label(24,30,'ИЗ ПОТОКА ИНФОРМАЦИИ — В ОТБОР')
    if a.m:
        for i,t in enumerate(['Источник А','Источник Б','Источник В']):a.box(24+i*106,61,100,58,t)
        a.box(52,169,256,97,'Условия отбора','Название · цена · параметры')
        a.arrow(180,128,180,159);a.arrow(180,275,180,308)
        a.box(36,321,288,155,'Отобранные записи')
        a.text(54,390,'Сведения о лоте',16,GOLD);a.text(54,428,'→ Уведомление',17,PALE)
    else:
        for i,t in enumerate(['Источник А','Источник Б','Источник В']):
            a.box(25,76+i*83,156,62,t);a.line(182,107+i*83,216,107+i*83)
        a.line(216,107,216,273);a.arrow(216,190,256,190)
        a.box(268,126,188,130,'Фильтрация')
        for i,t in enumerate(['Название','Цена','Параметры']):a.text(286,187+i*24,t,14,GOLD)
        a.arrow(469,190,508,190)
        a.box(520,103,175,175,'Отобранные записи');a.text(537,174,'Сведения о лоте',14,GOLD);a.text(537,223,'→ Уведомление',15)
        a.text(25,378,'Состав источников и доступные интерфейсы согласуются под задачу.',13,MUTED)

def databases(a):
    a.label(24,30,'СВЯЗАННАЯ ПРЕДМЕТНАЯ МОДЕЛЬ')
    if a.m:
        a.box(24,58,145,80,'Документ','Файл: D-01.pdf');a.box(190,58,146,80,'Справочник','Вид документа')
        a.line(96,139,96,169);a.line(263,139,263,169);a.line(96,169,263,169);a.arrow(180,169,180,197)
        x,y,w=35,208,290
    else:
        a.box(24,91,184,92,'Документ','Файл: D-01.pdf');a.box(24,217,184,92,'Справочники','Виды · организации')
        a.arrow(220,137,268,137);a.arrow(220,263,268,263);x,y,w=280,91,240
    a.box(x,y,w,214,'Карточка D-01')
    for i,t in enumerate(['Вид: приказ','Дата: 01.03.2026','Связь: D-01.pdf','Заголовок документа']):a.text(x+18,y+67+i*33,t,15,GOLD if i==2 else PALE)
    if a.m:
        a.arrow(180,430,180,453);a.text(52,485,'Поиск  /  передача в систему',17,GOLD)
    else:
        a.arrow(531,191,563,191);a.box(574,114,124,157,'Использование');a.text(587,186,'Поиск',16,GOLD);a.text(587,227,'Обмен',16,GOLD)
        a.text(25,375,'Записи связаны с файлами и справочниками; схема предметной области условная.',12,MUTED)

def servers(a):
    a.label(24,30,'ХРАНЕНИЕ И ВЫПОЛНЕНИЕ ОБРАБОТКИ')
    if a.m:
        for y,title,sub in [(56,'Источники','Файлы · документы · реестры'),(155,'Хранение','Исходники / рабочая партия'),(254,'Обработка','Согласованный процесс'),(353,'Контроль','Проверка результата')]:
            a.box(28,y,304,72,title,sub)
            if y<353:a.arrow(180,y+77,180,y+93)
        a.arrow(180,432,180,454);a.text(64,486,'Доступ / передача результата',16,GOLD)
    else:
        a.box(25,138,142,102,'Источники','Файлы / реестры')
        a.arrow(177,190,213,190)
        a.rect(227,77,278,237,PANEL,'#68717a')
        a.label(244,104,'РАБОЧИЙ КОНТУР')
        a.box(246,126,240,65,'Хранение','Исходники / рабочая партия')
        a.arrow(365,196,365,217)
        a.box(246,226,240,65,'Обработка','Согласованный процесс')
        a.arrow(518,190,551,190)
        a.box(565,138,133,102,'Контроль','Выдача / доступ')
        a.text(25,374,'Принцип организации данных и операций. Не схема облачной платформы.',13,MUTED)

def hvati(a):
    a.label(24,30,'КОНЦЕПТ МОБИЛЬНОГО СЦЕНАРИЯ')
    x,y,w,h=(65,55,230,414) if a.m else (262,45,222,336)
    a.rect(x,y,w,h,'#23374b','#bba27c',25);a.rect(x+12,y+19,w-24,h-37,PAPER,r=14)
    a.rect(x+w/2-31,y+8,62,7,NAVY,r=4)
    a.text(x+31,y+65,'Хвать',27,NAVY,600)
    a.rect(x+27,y+90,w-54,48,'#e9e1d2');a.text(x+37,y+119,'Медиассылка',13,NAVY)
    a.text(x+29,y+169,'Видео  /  Аудио',15,NAVY)
    for i,t in enumerate(['Качество','Формат']):a.text(x+29,y+203+i*30,t,13,'#6e6b65')
    a.rect(x+28,y+h-66,w-56,32,NAVY,r=3);a.text(x+49,y+h-45,'Загрузить',14,PAPER)
    if not a.m:
        a.label(34,124,'ВХОД');a.text(34,153,'Ссылка',18);a.arrow(118,161,238,161)
        a.label(526,230,'ВЫХОД');a.text(526,262,'Видео / аудио',18);a.arrow(495,275,676,275)

def profit(a):
    a.label(24,30,'КОНЦЕПТ ПЛАНИРОВАНИЯ ПО ПЕРИОДАМ')
    x,y,w,h=(24,60,312,390) if a.m else (65,66,590,280)
    a.rect(x,y,w,h,PAPER)
    a.rect(x,y,w,40,'#e8e1d5');a.text(x+17,y+26,'ПРОФИЦИТ',14,NAVY,600)
    a.text(x+18,y+74,'Период  /  бюджет',19,NAVY)
    chartx,chartw=x+18,w-36
    for i,(title,ratio) in enumerate([('План',.88),('Факт',.61)]):
        yy=y+110+i*63;a.text(chartx,yy,title,13,'#6e6b65');a.rect(chartx,yy+12,chartw,20,'#e8e1d5');a.rect(chartx,yy+12,chartw*ratio,20,'#9c7948' if i==0 else '#31465b')
    if a.m:
        a.text(x+18,y+275,'История периодов',16,NAVY);a.text(x+18,y+315,'Резервная копия',16,NAVY);a.text(x+18,y+355,'Сохранение состояния',14,'#6e6b65')
    else:
        a.label(65,385,'ОПЕРАЦИИ  /  РАСЧЁТЫ  /  ИСТОРИЯ  /  РЕЗЕРВНАЯ КОПИЯ')

def rpg(a):
    a.label(24,30,'КОНЦЕПТ ДЕЙСТВИЙ, СОСТОЯНИЯ И ПРОГРЕССА')
    x,y,w,h=(24,57,312,410) if a.m else (61,65,598,282)
    a.rect(x,y,w,h,'#192d42','#657083')
    a.text(x+20,y+35,'RPG LIFE',22,GOLD,600)
    a.label(x+20,y+69,'АКТИВНЫЙ КВЕСТ')
    a.text(x+20,y+102,'Завершить этап проекта',18)
    a.rect(x+20,y+122,w-40,9,'#35475a');a.rect(x+20,y+122,(w-40)*.6,9,GOLD)
    for i,t in enumerate(['Действие записано','Состояние обновлено','История сохранена']):
        yy=y+171+i*(58 if a.m else 30);a.rect(x+21,yy-13,12,12,'#657d80');a.text(x+45,yy,t,14)
    if a.m:a.text(45,443,'Продолжить свой сценарий',14,GOLD)
    else:a.label(62,387,'ЗАДАЧА → ДЕЙСТВИЕ → ПРОГРЕСС → ПАМЯТЬ')

scenes={'sboeboy':sboeboy,'pdfa-pipeline':pdfa,'document-extraction':extraction,'pdf-bookmarks':bookmarks,'image-processing':image_processing,'source-monitoring':monitoring,'databases-integrations':databases,'server-solutions':servers,'hvati':hvati,'profit':profit,'rpg-life':rpg}
OUT.mkdir(parents=True,exist_ok=True)
for name,draw in scenes.items():
    for mobile in (False,True):
        scene=Scene(mobile);draw(scene);scene.write(name)
print(f'Generated {len(scenes)*2} SVG assets with desktop/mobile compositions.')
