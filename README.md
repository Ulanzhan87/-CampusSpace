# CampusSpace

**CampusSpace — система поиска и бронирования свободных аудиторий в университете в реальном времени.**

Учебный MVP-проект для Lab 1 / Lab 2.

## Возможности

- просмотр аудиторий;
- поиск свободных аудиторий по дате и времени;
- фильтрация по корпусу, вместимости и оборудованию;
- бронирование аудитории;
- отмена бронирования;
- автоматическое хранение данных в SQLite;
- REST API;
- UML-диаграммы в PlantUML;
- SQL-схема базы данных.

## Технологии

- Python 3
- Flask
- SQLite
- HTML5 / CSS3
- JavaScript
- PlantUML

## Структура

```text
campusspace/
├── README.md
├── requirements.txt
├── .gitignore
├── LICENSE
├── app.py
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docs/
│   ├── requirements.md
│   └── uml/
│       ├── use-case.puml
│       ├── activity.puml
│       ├── class.puml
│       └── sequence.puml
└── src/
    ├── static/
    │   ├── app.js
    │   └── style.css
    └── templates/
        └── index.html
```

## Запуск

### 1. Создать виртуальное окружение

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

### 2. Установить зависимости

```bash
pip install -r requirements.txt
```

### 3. Запустить

```bash
python app.py
```

Открыть:

```text
http://127.0.0.1:5000
```

При первом запуске приложение создаёт SQLite-базу и тестовые аудитории.

## API

- `GET /api/rooms` — список аудиторий.
- `GET /api/rooms?building=A&min_capacity=20` — фильтрация.
- `GET /api/bookings` — список бронирований.
- `POST /api/bookings` — создать бронирование.
- `DELETE /api/bookings/<id>` — отменить бронирование.

## UML

Исходники UML находятся в `docs/uml/`. Их можно открыть в PlantUML или любом совместимом редакторе.

Диаграммы:

1. Use Case — взаимодействие студента и администратора с системой.
2. Activity — процесс поиска и бронирования.
3. Class — основные классы системы.
4. Sequence — последовательность действий при бронировании.

## Учебная цель

Проект демонстрирует переход от исследования проблемы к проектированию программного решения: требования → UML → база данных → API → пользовательский интерфейс → GitHub.
