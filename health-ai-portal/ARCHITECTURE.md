# ARCHITECTURE.md — Health AI Portal

> **Назначение:** Карта системы — компоненты, границы ответственности, потоки данных.
> **При конфликте с CONTEXT.md** → побеждает `00_context_history.md`

---

## ОБЗОР СИСТЕМЫ

```
┌─────────────────────────────────────────────────────────────────┐
│                        Health AI Portal                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────┐ │
│  │   Frontend   │  HTTP   │   Backend    │   SQL   │ PostgreSQL│ │
│  │  React+Vite  │◄───────►│   Go+Chi     │◄───────►│    16    │ │
│  │  Port 3000   │   API   │  Port 8080   │         │ Port 5432│ │
│  └──────────────┘         └──────────────┘         └──────────┘ │
│                                  │                               │
│                                  │ API                           │
│                                  ▼                               │
│                          ┌──────────────┐                        │
│                          │  Claude API  │                        │
│                          │  (Anthropic) │                        │
│                          └──────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## КОМПОНЕНТЫ

### Frontend (React)

**Стек:** React 18 + Vite + TypeScript + Tailwind CSS + TanStack Query

```
frontend/src/
├── api/
│   └── client.ts           # Axios клиент, все API вызовы
├── components/
│   ├── layout/
│   │   ├── Layout.tsx      # Главный layout (Sidebar + Header + Outlet)
│   │   ├── Sidebar.tsx     # Навигация
│   │   └── Header.tsx      # Шапка с поиском и действиями
│   ├── dashboard/
│   │   ├── GoalsWidget.tsx     # Виджет целей
│   │   ├── ScheduleWidget.tsx  # Расписание приёма
│   │   └── AlertsWidget.tsx    # Критические напоминания
│   ├── common/
│   │   └── Card.tsx        # Базовый компонент карточки
│   └── [feature]/          # Компоненты по фичам
├── pages/
│   ├── DashboardPage.tsx   # Главная страница
│   ├── SupplementsPage.tsx # Стек препаратов
│   ├── LabsPage.tsx        # Анализы
│   ├── CyclesPage.tsx      # История циклов
│   ├── WorkoutsPage.tsx    # Тренировки
│   └── ProfilePage.tsx     # Профиль
├── types/
│   └── index.ts            # TypeScript типы
├── lib/
│   └── utils.ts            # Утилиты (cn для классов)
└── hooks/                  # React hooks
```

**Роутинг:**
| Путь | Страница | Описание |
|------|----------|----------|
| `/` | DashboardPage | Главный дашборд |
| `/supplements` | SupplementsPage | Управление стеком |
| `/labs` | LabsPage | История анализов |
| `/cycles` | CyclesPage | Аналитические циклы |
| `/workouts` | WorkoutsPage | План тренировок |
| `/profile` | ProfilePage | Профиль пользователя |

---

### Backend (Go)

**Стек:** Go 1.22 + Chi Router + sqlx + golang-migrate

```
backend/
├── cmd/server/
│   └── main.go             # Entry point, роутер, middleware
├── internal/
│   ├── config/
│   │   └── config.go       # Загрузка конфигурации из ENV
│   ├── database/
│   │   ├── postgres.go     # Подключение к БД, миграции
│   │   └── migrations/
│   │       ├── 001_initial.up.sql
│   │       └── 001_initial.down.sql
│   ├── models/
│   │   ├── user.go
│   │   ├── supplement.go
│   │   ├── goal.go
│   │   ├── lab_result.go
│   │   ├── interaction.go
│   │   └── cycle.go
│   ├── handlers/
│   │   ├── helpers.go      # respondJSON, respondError
│   │   ├── supplements.go  # CRUD для препаратов
│   │   ├── goals.go        # CRUD для целей
│   │   └── labs.go         # CRUD для анализов
│   ├── services/           # Бизнес-логика (TODO)
│   ├── ai/                 # Claude API интеграция (TODO)
│   │   └── prompts/        # Промпты для ролей
│   └── middleware/
│       └── cors.go         # CORS настройки
└── pkg/
    ├── pdf/                # PDF парсинг (TODO)
    └── scheduler/          # Уведомления (TODO)
```

**API Endpoints:**

```
GET    /health                      # Health check

# Supplements
GET    /api/supplements             # Список (фильтры: status, category)
POST   /api/supplements             # Создать
GET    /api/supplements/:id         # Получить
PUT    /api/supplements/:id         # Обновить
DELETE /api/supplements/:id         # Soft delete
GET    /api/supplements/schedule    # Расписание по времени
GET    /api/supplements/by-category # Группировка по категориям

# Goals
GET    /api/goals                   # Список (сортировка по приоритету)
POST   /api/goals                   # Создать
GET    /api/goals/:id               # Получить
PUT    /api/goals/:id               # Обновить
DELETE /api/goals/:id               # Удалить

# Labs
GET    /api/labs                    # Список (фильтр: category)
POST   /api/labs                    # Создать
GET    /api/labs/:id                # Получить
PUT    /api/labs/:id                # Обновить
DELETE /api/labs/:id                # Удалить
GET    /api/labs/marker/:name       # История по маркеру
GET    /api/labs/trends             # Тренды всех маркеров
```

---

### Database (PostgreSQL)

**Схема:** `001_initial.up.sql`

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│ supplements │────<│interactions │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐     ┌─────────────┐
       ├───────────<│    goals    │     │    risks    │
       │            └─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐     ┌─────────────┐
       ├───────────<│ lab_results │     │  reminders  │
       │            └─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐     ┌─────────────┐
       ├───────────<│   cycles    │────<│ ai_analyses │
       │            └─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐     ┌─────────────┐
       └───────────<│  workouts   │────<│  exercises  │
                    └─────────────┘     └─────────────┘

                    ┌──────────────┐
                    │daily_metrics │
                    └──────────────┘
```

**Ключевые таблицы:**

| Таблица | Назначение | Ключевые поля |
|---------|------------|---------------|
| users | Пользователи | name, birth_date, height, weight |
| supplements | Препараты/добавки | name, dose, time_of_day, category, status |
| goals | Цели | name, current_value, target_value, priority |
| lab_results | Результаты анализов | marker_name, value, reference_min/max |
| cycles | Аналитические циклы | cycle_type, verdict, AI outputs |
| interactions | Взаимодействия препаратов | supplement_1_id, supplement_2_id, type |
| risks | Риски | name, cause, symptoms, severity |

---

## ПОТОКИ ДАННЫХ

### 1. Отображение стека препаратов
```
User → SupplementsPage → useQuery('supplements') →
     → GET /api/supplements/by-category →
     → SupplementHandler.GetByCategory() →
     → SELECT FROM supplements GROUP BY category →
     → JSON response → React state → UI
```

### 2. Добавление результата анализа
```
User → LabForm → POST /api/labs →
     → LabHandler.Create() →
     → INSERT INTO lab_results →
     → JSON response → invalidateQueries → refetch → UI update
```

### 3. AI анализ цикла (TODO)
```
User → NewCycleWizard → POST /api/ai/analyze →
     → AIHandler.Analyze() →
     → Claude API (Master Curator prompt) →
     → Claude API (Red Team prompt) →
     → Claude API (Meta-Supervisor prompt) →
     → INSERT INTO ai_analyses →
     → UPDATE cycles SET outputs →
     → JSON response → CycleDetail → UI
```

---

## ТЕХНИЧЕСКИЕ РЕШЕНИЯ

### Почему Chi Router?
- Легковесный, idiomatic Go
- Хорошо поддерживает middleware
- Простой API, без магии

### Почему TanStack Query?
- Кеширование запросов
- Автоматический refetch
- Optimistic updates
- Хорошо работает с TypeScript

### Почему Tailwind CSS?
- Dark theme из коробки (CSS variables)
- Utility-first подход
- Легко кастомизировать через config

### Почему PostgreSQL?
- JSONB для гибких данных (input_data, decisions)
- Хорошая поддержка миграций
- Надёжность для медицинских данных

---

## ОГРАНИЧЕНИЯ И TODO

### MVP (текущее состояние)
- [x] CRUD для supplements, goals, labs
- [x] Базовый UI для всех страниц
- [x] Dark theme
- [x] Seed данные из протокола
- [ ] Формы создания/редактирования (только отображение)
- [ ] Авторизация (PIN)

### Phase 2
- [ ] Полноценные формы
- [ ] Графики трендов (Recharts)
- [ ] Матрица взаимодействий
- [ ] Drag-n-drop расписание

### Phase 3
- [ ] Claude API интеграция
- [ ] Промпты для 3 ролей
- [ ] Генерация протоколов

### Phase 4
- [ ] PDF импорт анализов
- [ ] Уведомления (push/email)
- [ ] Telegram бот

---

## КОНФИГУРАЦИЯ

### Переменные окружения
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=healthai
DB_PASSWORD=healthai123
DB_NAME=healthai

# Server
SERVER_PORT=8080

# Security
JWT_SECRET=your-secret-key

# AI (optional)
CLAUDE_API_KEY=sk-ant-xxxxx
```

### Порты
| Сервис | Порт | Описание |
|--------|------|----------|
| Frontend | 3000 | React dev server / nginx |
| Backend | 8080 | Go API server |
| PostgreSQL | 5432 | Database |
