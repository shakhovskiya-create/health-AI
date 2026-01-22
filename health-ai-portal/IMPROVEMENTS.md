# IMPROVEMENTS.md — Журнал изменений

> **Назначение:** Фактический журнал всех изменений в портале.
> **Формат:** done (выполнено) / doing (в работе) / todo (запланировано)
> **Обновлять:** После каждого значимого изменения.

---

## DONE (Выполнено)

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

#### Forms & CRUD UI
- [ ] SupplementForm — создание/редактирование препарата
- [ ] GoalForm — создание/редактирование цели
- [ ] LabResultForm — ввод результатов анализов
- [ ] Modal компонент для форм
- [ ] Confirmation dialog для удаления

#### Charts
- [ ] LabChart компонент (Recharts)
- [ ] График трендов маркеров
- [ ] Прогресс по целям (progress bars)

#### Interactions
- [ ] InteractionsTable — матрица взаимодействий
- [ ] Фильтрация по типу (critical/warning/synergy)

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
| Файлов в frontend | ~25 | 2026-01-22 |
| Таблиц в БД | 12 | 2026-01-22 |
| API endpoints | 18 | 2026-01-22 |
| React компонентов | 15 | 2026-01-22 |
| Seed препаратов | 45+ | 2026-01-22 |
