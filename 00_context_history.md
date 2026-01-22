# 00 — CONTEXT HISTORY (MASTER CONTEXT)

> **ПРАВИЛО:** Любые изменения в проекте делаются ТОЛЬКО после чтения этого файла.
> Если изменение может нарушить инвариант — **STOP** и запрос уточнений.

---

## НАЗНАЧЕНИЕ ПРОЕКТА

Персональная clinical decision-support система для отслеживания здоровья, протоколов препаратов, анализов и тренировок.

---

## КОМПОНЕНТЫ СИСТЕМЫ

### 1. Markdown-система (Legacy)
Оригинальная система на основе Markdown файлов + Excel.

| Файл | Назначение |
|------|------------|
| `01_master_curator.md` | Промпт роли Master Curator |
| `02_red_team.md` | Промпт роли Red Team |
| `03_meta_supervisor.md` | Промпт роли Meta-Supervisor |
| `04_input_template.md` | Входные данные текущего цикла |
| `05_profile_constant.md` | Постоянный профиль пользователя |
| `06_change_log.md` | Журнал изменений |
| `07_labs_history.md` | История анализов (append-only) |
| `08_cycles_history.md` | История аналитических циклов |
| `PROTOCOL_v12.md` | Текущий протокол (актуальная версия) |
| `PROTOCOL_FULL_AUDIT.xlsx` | Excel версия протокола |

### 2. Health AI Portal (Web)
Веб-портал на Go + React, заменяющий Excel.

**Расположение:** `health-ai-portal/`

**Документация портала:**
- `health-ai-portal/ARCHITECTURE.md` — архитектура системы
- `health-ai-portal/IMPROVEMENTS.md` — журнал изменений (done/doing/todo)
- `health-ai-portal/WORKPLAN.md` — план работ (спринты, задачи)
- `health-ai-portal/README.md` — инструкции по запуску

---

## ИНВАРИАНТЫ (НАРУШЕНИЕ = STOP)

### Данные
1. **07_labs_history.md** — APPEND-ONLY. Старые записи НИКОГДА не редактируются.
2. **08_cycles_history.md** — APPEND-ONLY. Циклы не удаляются.
3. Новые данные добавляются СВЕРХУ в исторические файлы.

### Роли AI
4. Последовательность ролей: Master Curator → Red Team → Meta-Supervisor.
5. Описания ролей находятся ТОЛЬКО в файлах `01_*.md`, `02_*.md`, `03_*.md`.
6. PATCH-и возвращаются ТОЛЬКО после Meta-Supervisor.

### Портал
7. Портал НЕ заменяет Markdown-систему, а дополняет её.
8. Данные портала хранятся в PostgreSQL, миграции в `backend/internal/database/migrations/`.
9. Seed данные синхронизированы с `PROTOCOL_v12.md`.

### Безопасность
10. Не назначать препараты, дозировки или схемы напрямую.
11. Не давать опасных или незаконных инструкций.
12. При недостатке данных — помечать MISSING DATA.

---

## ПРАВИЛА РАБОТЫ

### При работе с Markdown-системой
```
1. Прочитать 00_context_history.md (этот файл)
2. Прочитать релевантные файлы ролей (01-03)
3. Прочитать 04_input_template.md для текущего цикла
4. Использовать 07_labs_history.md для анализа динамики
5. Возвращать изменения как PATCH-и
```

### При работе с порталом (health-ai-portal/)
```
1. Прочитать 00_context_history.md (этот файл)
2. Прочитать health-ai-portal/ARCHITECTURE.md
3. Прочитать health-ai-portal/IMPROVEMENTS.md
4. Прочитать health-ai-portal/WORKPLAN.md
5. После изменений — обновить IMPROVEMENTS.md и WORKPLAN.md
```

---

## ТЕКУЩЕЕ СОСТОЯНИЕ

| Компонент | Версия | Статус |
|-----------|--------|--------|
| Markdown-система | v12.0 | Активна |
| Health AI Portal | MVP 0.1.0 | В разработке |
| PostgreSQL схема | 001_initial | Готова |
| Frontend | React + Vite | MVP готов |
| Backend | Go + Chi | MVP готов |
| AI интеграция | — | Не начата |

---

## ИСТОРИЯ КОНТЕКСТА

### 2026-01-22
- Создан Health AI Portal (MVP)
- Структура: Go backend + React frontend + PostgreSQL
- Перенесены данные из PROTOCOL_v12.md в seed.sql
- Созданы страницы: Dashboard, Supplements, Labs, Cycles, Workouts, Profile

---

## СВЯЗАННЫЕ ДОКУМЕНТЫ

- [CLAUDE.md](CLAUDE.md) — инструкции для AI
- [health-ai-portal/ARCHITECTURE.md](health-ai-portal/ARCHITECTURE.md) — архитектура портала
- [health-ai-portal/WORKPLAN.md](health-ai-portal/WORKPLAN.md) — план разработки
