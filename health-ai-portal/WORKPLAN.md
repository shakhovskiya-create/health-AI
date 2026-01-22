# WORKPLAN.md — План работ

> **Назначение:** Структурированный план разработки портала.
> **Обновлять:** При начале/завершении спринта или значимой задачи.

---

## ROADMAP

```
Phase 1: MVP Core ✅ ──────────────────────────► DONE (2026-01-22)
Phase 2: Forms & Charts ◯ ────────────────────► IN PROGRESS
Phase 3: AI Integration ◯ ────────────────────► PLANNED
Phase 4: Notifications & Import ◯ ────────────► PLANNED
Phase 5: Polish & Mobile ◯ ───────────────────► PLANNED
```

---

## PHASE 1: MVP CORE ✅

**Статус:** ЗАВЕРШЕНО
**Дата:** 2026-01-22

### Задачи
- [x] Структура проекта
- [x] Go backend с chi router
- [x] PostgreSQL + миграции
- [x] React + Vite + Tailwind
- [x] CRUD API (supplements, goals, labs)
- [x] Все основные страницы
- [x] Docker Compose
- [x] Seed данные из протокола

### Результат
- Работающий MVP портала
- Отображение всех данных протокола
- Dark theme UI

---

## PHASE 2: FORMS & CHARTS

**Статус:** НЕ НАЧАТО
**Приоритет:** HIGH
**Оценка:** 3-5 дней

### Sprint 2.1 — Forms
| Задача | Приоритет | Оценка | Статус |
|--------|-----------|--------|--------|
| Modal component | High | 2h | ◯ |
| SupplementForm | High | 3h | ◯ |
| GoalForm | High | 2h | ◯ |
| LabResultForm | High | 3h | ◯ |
| Delete confirmation | Medium | 1h | ◯ |
| Form validation (react-hook-form) | Medium | 2h | ◯ |

### Sprint 2.2 — Charts
| Задача | Приоритет | Оценка | Статус |
|--------|-----------|--------|--------|
| Recharts setup | High | 1h | ◯ |
| LabChart component | High | 3h | ◯ |
| Trends page improvements | Medium | 2h | ◯ |
| Goal progress visualization | Medium | 2h | ◯ |

### Sprint 2.3 — Interactions
| Задача | Приоритет | Оценка | Статус |
|--------|-----------|--------|--------|
| InteractionsTable component | Medium | 3h | ◯ |
| Interaction filters | Low | 1h | ◯ |
| Interaction form | Low | 2h | ◯ |

---

## PHASE 3: AI INTEGRATION

**Статус:** НЕ НАЧАТО
**Приоритет:** MEDIUM
**Оценка:** 5-7 дней

### Sprint 3.1 — Claude API
| Задача | Приоритет | Оценка | Статус |
|--------|-----------|--------|--------|
| go-anthropic client setup | High | 2h | ◯ |
| AI handler | High | 3h | ◯ |
| Master Curator prompt | High | 2h | ◯ |
| Red Team prompt | High | 2h | ◯ |
| Meta-Supervisor prompt | High | 2h | ◯ |

### Sprint 3.2 — Cycle Wizard
| Задача | Приоритет | Оценка | Статус |
|--------|-----------|--------|--------|
| NewCycleWizard component | High | 4h | ◯ |
| Input data forms | High | 3h | ◯ |
| AI analysis trigger | Medium | 2h | ◯ |
| AIAnalysis display component | Medium | 3h | ◯ |

### Sprint 3.3 — Protocol Generator
| Задача | Приоритет | Оценка | Статус |
|--------|-----------|--------|--------|
| Protocol template | Medium | 2h | ◯ |
| PATCH generation | Medium | 3h | ◯ |
| Export to Markdown | Low | 2h | ◯ |

---

## PHASE 4: NOTIFICATIONS & IMPORT

**Статус:** НЕ НАЧАТО
**Приоритет:** LOW
**Оценка:** 5-7 дней

### Sprint 4.1 — PDF Import
| Задача | Приоритет | Оценка | Статус |
|--------|-----------|--------|--------|
| pdfcpu setup | Medium | 2h | ◯ |
| Text extraction | Medium | 3h | ◯ |
| Marker mapping | Medium | 4h | ◯ |
| Import UI (drag-n-drop) | Medium | 2h | ◯ |

### Sprint 4.2 — Notifications
| Задача | Приоритет | Оценка | Статус |
|--------|-----------|--------|--------|
| Reminders CRUD API | Medium | 2h | ◯ |
| Reminders UI | Medium | 2h | ◯ |
| Service Worker | Low | 3h | ◯ |
| Push notifications | Low | 3h | ◯ |

---

## PHASE 5: POLISH

**Статус:** НЕ НАЧАТО
**Приоритет:** LOW
**Оценка:** 3-5 дней

### Tasks
| Задача | Приоритет | Оценка | Статус |
|--------|-----------|--------|--------|
| Mobile responsive | Medium | 4h | ◯ |
| Loading states | Medium | 2h | ◯ |
| Error handling | Medium | 2h | ◯ |
| Toast notifications | Low | 1h | ◯ |
| Keyboard shortcuts | Low | 2h | ◯ |
| Performance optimization | Low | 3h | ◯ |
| E2E tests | Low | 4h | ◯ |

---

## BACKLOG

Идеи для будущих версий:

- [ ] Multi-user support
- [ ] Data sync with Markdown files
- [ ] Mobile app (React Native)
- [ ] Wearables integration (Apple Health, Garmin)
- [ ] Lab API integrations (INVITRO, Helix)
- [ ] Telegram bot for reminders
- [ ] Voice input for daily metrics
- [ ] Barcode scanner for supplements
- [ ] Export/Import data backup
- [ ] Offline mode (PWA)

---

## SPRINT LOG

### Sprint 1 (2026-01-22) — MVP
**Цель:** Создать работающий прототип портала
**Результат:** ✅ Успешно

| Метрика | План | Факт |
|---------|------|------|
| Backend endpoints | 15 | 18 |
| Frontend pages | 6 | 6 |
| Время | 1 день | 1 день |

---

## ОПРЕДЕЛЕНИЯ

- **◯** — Не начато
- **◐** — В процессе
- **●** — Завершено
- **⊘** — Отменено

**Приоритеты:**
- **High** — Блокирует другие задачи или критично для пользователя
- **Medium** — Важно, но можно отложить
- **Low** — Nice to have
