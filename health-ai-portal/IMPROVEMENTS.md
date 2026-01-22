# IMPROVEMENTS.md — Журнал изменений

> **Назначение:** Фактический журнал всех изменений в портале.
> **Формат:** done (выполнено) / doing (в работе) / todo (запланировано)
> **Обновлять:** После каждого значимого изменения.

---

## DONE (Выполнено)

### 2026-01-22 — Phase 2: Forms & Charts

#### Frontend Components
- [x] Modal component с анимацией и backdrop
- [x] ConfirmDialog для подтверждения удаления
- [x] Input, Textarea, Select — форм-компоненты
- [x] SupplementForm — создание/редактирование препаратов
- [x] GoalForm — создание/редактирование целей
- [x] LabForm — ввод результатов анализов с автокомплитом маркеров
- [x] LabChart, SingleMarkerChart — графики трендов (Recharts)
- [x] MarkerSelector — выбор маркеров для отображения
- [x] InteractionsTable — таблица взаимодействий с фильтрами
- [x] InteractionMatrix — матрица взаимодействий препаратов

#### Pages Updated
- [x] SupplementsPage — интеграция формы, edit/delete
- [x] LabsPage — интеграция формы, графики, edit/delete
- [x] GoalsWidget — добавление/редактирование/удаление целей

#### Features
- [x] CRUD UI для всех основных сущностей
- [x] Визуализация трендов лабораторных показателей
- [x] Reference range на графиках (зелёная зона)
- [x] Hover-эффекты для edit/delete кнопок
- [x] Фильтрация взаимодействий по типу

---

### 2026-01-22 — MVP Release

#### Backend
- [x] Инициализация Go модуля с chi router
- [x] Конфигурация через ENV (`internal/config/config.go`)
- [x] Подключение PostgreSQL с sqlx (`internal/database/postgres.go`)
- [x] Миграции (`001_initial.up.sql`, `001_initial.down.sql`)
- [x] Модели: User, Supplement, Goal, LabResult, Interaction, Cycle
- [x] Handlers: supplements (CRUD + schedule + by-category)
- [x] Handlers: goals (CRUD)
- [x] Handlers: labs (CRUD + trends + by-marker)
- [x] CORS middleware
- [x] Dockerfile для backend

#### Frontend
- [x] Инициализация React + Vite + TypeScript
- [x] Tailwind CSS с dark theme
- [x] API клиент с axios
- [x] TanStack Query setup
- [x] Layout: Sidebar + Header
- [x] DashboardPage с виджетами (Goals, Schedule, Alerts)
- [x] SupplementsPage с группировкой по категориям
- [x] LabsPage с историей и required labs
- [x] CyclesPage с timeline
- [x] WorkoutsPage с недельным планом
- [x] ProfilePage с данными пользователя
- [x] Dockerfile + nginx.conf

#### DevOps
- [x] docker-compose.yml (postgres + backend + frontend)
- [x] Makefile с командами (up, down, dev, etc.)
- [x] .env.example

#### Data
- [x] Seed SQL из PROTOCOL_v12.md
- [x] 45+ препаратов
- [x] 8 целей с приоритетами
- [x] Взаимодействия
- [x] Риски
- [x] Пример цикла

---

## DOING (В работе)

_Нет активных задач_

---

## TODO (Запланировано)

### High Priority

#### Goal Progress Visualization
- [ ] Progress bars для целей
- [ ] Процент достижения цели

#### Interaction Form
- [ ] Форма для добавления новых взаимодействий

### Medium Priority

#### Auth
- [ ] PIN-based авторизация
- [ ] JWT tokens
- [ ] Auth middleware

#### Cycles
- [ ] NewCycleWizard — пошаговое создание цикла
- [ ] Формы для input_data (wellbeing, training, nutrition)
- [ ] CycleDetail — полный вид цикла

#### Schedule
- [ ] Drag-n-drop reorder для расписания
- [ ] Checkbox для отметки приёма
- [ ] Сохранение состояния дня

### Low Priority

#### AI Integration
- [ ] Claude API клиент (`internal/ai/claude.go`)
- [ ] Промпты для Master Curator
- [ ] Промпты для Red Team
- [ ] Промпты для Meta-Supervisor
- [ ] AIAnalysis компонент
- [ ] ProtocolGenerator

#### PDF Import
- [ ] PDF парсер (`pkg/pdf/parser.go`)
- [ ] OCR fallback
- [ ] Маппинг маркеров лабораторий
- [ ] LabImport UI (drag-n-drop)

#### Notifications
- [ ] Reminders CRUD
- [ ] Browser push notifications
- [ ] Service Worker setup
- [ ] Telegram bot (optional)

#### Polish
- [ ] Mobile responsive improvements
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Keyboard shortcuts
- [ ] Export to PDF

---

## CHANGELOG FORMAT

При добавлении записи использовать формат:

```markdown
### YYYY-MM-DD — Название релиза/изменения

#### Категория (Backend/Frontend/DevOps/Data)
- [x] Описание выполненного изменения
- [x] Ещё одно изменение
```

---

## МЕТРИКИ

| Метрика | Значение | Дата |
|---------|----------|------|
| Файлов в backend | ~15 | 2026-01-22 |
| Файлов в frontend | ~35 | 2026-01-22 |
| Таблиц в БД | 12 | 2026-01-22 |
| API endpoints | 18 | 2026-01-22 |
| React компонентов | 25+ | 2026-01-22 |
| Form компонентов | 6 | 2026-01-22 |
| Chart компонентов | 3 | 2026-01-22 |
| Seed препаратов | 45+ | 2026-01-22 |
