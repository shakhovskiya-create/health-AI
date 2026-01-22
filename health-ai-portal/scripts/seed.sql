-- Seed data based on PROTOCOL_v12.md

-- Goals
INSERT INTO goals (user_id, name, current_value, target_value, strategy, priority, status)
VALUES
(1, 'Когнитивка (память, речь)', '3/10', '9/10', 'Yale протокол + нейропептиды + MAO-стек', 'critical', 'active'),
(1, 'Мотивация/ангедония', '4/10', '9/10', 'NOR-BNI + MAO-стек + DA-прекурсоры', 'critical', 'active'),
(1, 'Глубокий сон', '15-20%', '>25%', 'Оптимизация сон-стека + отмена мешающих', 'critical', 'active'),
(1, 'Туман в голове (Long COVID)', '6/10', '1/10', 'LDN + MCAS + ферменты + MB', 'critical', 'active'),
(1, 'Лептин', '<0.5 нг/мл', '>3 нг/мл', 'Мониторинг после отмены Суглата', 'critical', 'active'),
(1, 'Body Fat %', '18-20%', '9-10%', 'RC-стек', 'high', 'active'),
(1, 'Мышечная масса', '77 кг LBM', '82+ кг LBM', 'ГЗТ + ГР + тренировки + пептиды', 'medium', 'active'),
(1, 'Longevity', '—', 'Макс.', 'Рапамицин + FOXO4-DRI + сенолитики', 'background', 'active')
ON CONFLICT DO NOTHING;

-- Morning supplements (05:00)
INSERT INTO supplements (user_id, name, dose, time_of_day, category, mechanism, target, status, evidence_level)
VALUES
(1, 'ГР (Genotropin)', '5 IU', '05:00', 'morning', 'GH→IGF-1, липолиз', 'Рекомпозиция, longevity', 'active', 'clinical')
ON CONFLICT DO NOTHING;

-- Morning supplements (07:30) - Cognitive block
INSERT INTO supplements (user_id, name, dose, time_of_day, category, mechanism, target, status, evidence_level)
VALUES
(1, 'MB (метиленовый синий)', '15-20 мг', '07:30', 'morning', 'Митохондрии, антивирус', 'Long COVID, когнитивка', 'active', 'clinical'),
(1, 'ADCAPR', '50 мг', '07:30', 'morning', 'DA + NE + AMPA модуляция', 'Мотивация, фокус', 'active', 'preclinical'),
(1, 'Моклобемид', '150 мг', '07:30', 'morning', 'MAO-A RIMA', 'DA/NE/5-HT ↑', 'active', 'clinical'),
(1, 'D-Phenylalanine', '700 мг', '07:30', 'morning', 'PEA прекурсор', 'С MAO = длительный эффект', 'active', 'theoretical'),
(1, 'Meclofenoxate', '300 мг', '07:30', 'morning', 'ACh + антилипофусцин', 'Память, нейропротекция', 'active', 'clinical'),
(1, 'Eutropoflavin', '10 мг', '07:30', 'morning', 'TrkB агонист → BDNF', 'Нейрорегенерация', 'active', 'preclinical'),
(1, 'Ibudilast', '10 мг', '07:30', 'morning', 'PDE4/глия ингибитор', 'Нейровоспаление Long COVID', 'active', 'clinical'),
(1, 'Mg L-Threonate', '1000 мг', '07:30', 'morning', 'Mg в мозг', 'Когнитивка, нейропротекция', 'active', 'clinical'),
(1, 'Ac-Semax-NH2', '300-600 мкг', '07:30', 'morning', 'BDNF ↑, NGF ↑', 'Когнитивка, нейрорегенерация', 'active', 'clinical'),
(1, 'Dihexa', '1-2 мг', '07:30', 'morning', 'HGF/c-Met → синаптогенез', 'Память (курсами)', 'active', 'preclinical'),
(1, 'PE-22-28', '500 мкг', '07:30', 'morning', '5-HT4 → BDNF', 'Нейропластичность', 'active', 'preclinical'),
(1, 'Эриус', '5 мг', '07:30', 'morning', 'H1 блокада', 'MCAS, Long COVID', 'active', 'clinical'),
(1, 'Наттокиназа', '4000 FU', '07:30', 'morning', 'Фибринолиз, spike', 'Разрушение spike-протеина', 'active', 'clinical'),
(1, 'Серрапептаза', '120000 SPU', '07:30', 'morning', 'Протеолиз', 'Разрушение spike, воспаление', 'active', 'preclinical'),
(1, 'Бромелайн', '500 мг', '07:30', 'morning', 'Протеолиз', 'Синергия с NAC для spike', 'active', 'preclinical'),
(1, 'NAC', '600 мг', '07:30', 'morning', 'Глутатион ↑', 'Антиоксидант, spike', 'active', 'clinical'),
(1, 'Кверцетин', '500 мг', '07:30', 'morning', 'Mast cell стабилизатор', 'MCAS + цинк ионофор', 'active', 'clinical'),
(1, 'NMN', '500-1000 мг', '07:30', 'morning', 'NAD+ прекурсор', 'Longevity, энергия', 'active', 'clinical'),
(1, 'Спермидин', '10-15 мг', '07:30', 'morning', 'Аутофагия ↑', 'Longevity', 'active', 'clinical'),
(1, 'Урлитин А', '500 мг', '07:30', 'morning', 'Митофагия ↑', 'Mitopure, longevity', 'active', 'clinical'),
(1, 'Фисетин', '100 мг', '07:30', 'morning', 'Сенолитик', 'Longevity (курсами выше)', 'active', 'preclinical'),
(1, 'Селен', '200 мкг', '07:30', 'morning', 'T4→T3 конверсия', 'Щитовидка', 'active', 'clinical'),
(1, 'Йод', '150 мкг', '07:30', 'morning', 'Синтез T3/T4', 'Щитовидка', 'active', 'clinical'),
(1, 'Телмисартан', '40 мг', '07:30', 'morning', 'ARB + PPAR-γ', 'АД, метаболизм', 'active', 'clinical')
ON CONFLICT DO NOTHING;

-- Day supplements (13:00)
INSERT INTO supplements (user_id, name, dose, time_of_day, category, mechanism, target, status, evidence_level)
VALUES
(1, 'Фамотидин', '20 мг', '13:00', 'day', 'H2 блокада', 'MCAS', 'active', 'clinical'),
(1, 'Берберин', '500 мг', '13:00', 'day', 'AMPK ↑', 'Метаболизм, глюкоза (НЕ в день рапамицина)', 'active', 'clinical')
ON CONFLICT DO NOTHING;

-- Evening supplements (22:00)
INSERT INTO supplements (user_id, name, dose, time_of_day, category, mechanism, target, status, evidence_level)
VALUES
(1, 'LDN', '4.5 мг', '22:00', 'evening', 'Опиоидная модуляция', 'Нейровоспаление, иммунитет', 'active', 'clinical'),
(1, 'Кетотифен', '1 мг', '22:00', 'evening', 'Mast cell стабилизатор', 'MCAS + седация', 'active', 'clinical'),
(1, 'Глицин', '2 г', '22:00', 'evening', 'NMDA ко-агонист', 'Сон, нейропротекция', 'active', 'clinical'),
(1, 'Апигенин', '50 мг', '22:00', 'evening', 'CD38 ингибитор', 'NAD+ ↑, сон', 'active', 'clinical'),
(1, 'Cycloastragenol', '10-25 мг', '22:00', 'evening', 'Теломераза ↑', 'Longevity', 'active', 'preclinical'),
(1, 'Гуанфацин XR', '1-2 мг', '22:00', 'evening', 'α2A агонист', 'Yale протокол, PFC', 'active', 'clinical')
ON CONFLICT DO NOTHING;

-- Course supplements
INSERT INTO supplements (user_id, name, dose, time_of_day, category, mechanism, target, status, evidence_level)
VALUES
(1, 'Рапамицин', '4 мг', 'Суббота', 'course', 'mTORC1 ингибитор', 'Longevity, аутофагия', 'active', 'clinical'),
(1, 'FOXO4-DRI', '2-5 мг п/к', '3×/неделю', 'course', 'Сенолитик (p53-FOXO4)', 'Удаление сенесцентных клеток', 'active', 'preclinical'),
(1, 'Эпиталон', '5-10 мг п/к', '10-20 дней 2×/год', 'course', 'Теломераза ↑', 'Longevity', 'active', 'preclinical'),
(1, 'NOR-BNI', '750 мкг п/к', '1×/4-6 недель', 'course', 'κ-опиоидный антагонист', 'Антиангедония', 'active', 'clinical'),
(1, 'VIP', 'По протоколу', 'Курсами', 'course', 'Нейропептид', 'Гипоталамус, воспаление', 'active', 'clinical'),
(1, 'BPC-157', '250-500 мкг п/к', '6-8 недель', 'course', 'Ангиогенез, репарация', 'Восстановление тканей', 'active', 'preclinical'),
(1, 'TB-500', '2-2.5 мг п/к', '2×/неделю 6-8 нед', 'course', 'Системная репарация', 'Восстановление', 'active', 'preclinical')
ON CONFLICT DO NOTHING;

-- On-demand supplements
INSERT INTO supplements (user_id, name, dose, time_of_day, category, mechanism, target, status, evidence_level)
VALUES
(1, 'PRL-8-53', '10 мг сублинг.', 'За 2ч до важного', 'on_demand', 'Холин + DA', 'Острый мнемоник', 'active', 'clinical'),
(1, 'ITPP', '100 мг', 'Перед тренировкой', 'on_demand', 'Оксигенация тканей', 'Performance', 'active', 'preclinical')
ON CONFLICT DO NOTHING;

-- HRT
INSERT INTO supplements (user_id, name, dose, time_of_day, category, mechanism, target, status, evidence_level)
VALUES
(1, 'Тестостерон энантат', '150 мг', '2×/неделю (Пн+Чт)', 'hrt', 'AR агонист', 'ГЗТ база', 'active', 'clinical'),
(1, 'Примоболан', '200 мг', '2×/неделю', 'hrt', 'AR агонист', 'Анаболизм', 'active', 'clinical'),
(1, 'HCG', '500 IU', '2×/неделю', 'hrt', 'Стимуляция Лейдига', 'Яички, прегненолон', 'active', 'clinical')
ON CONFLICT DO NOTHING;

-- Removed supplement
INSERT INTO supplements (user_id, name, dose, time_of_day, category, mechanism, target, status, evidence_level, removed_at)
VALUES
(1, 'Суглат (ипраглифлозин)', '50 мг', '07:30', 'morning', 'SGLT2 → глюкозурия', 'Метаболизм, longevity', 'removed', 'clinical', NOW())
ON CONFLICT DO NOTHING;

-- Interactions
INSERT INTO interactions (supplement_1_id, supplement_2_id, interaction_type, description, solution)
SELECT s1.id, s2.id, 'warning', 'Оба ингибируют MAO-A', 'MB снижен до 15-20 мг'
FROM supplements s1, supplements s2
WHERE s1.name = 'Моклобемид' AND s2.name = 'MB (метиленовый синий)' AND s1.user_id = 1 AND s2.user_id = 1
ON CONFLICT DO NOTHING;

INSERT INTO interactions (supplement_1_id, supplement_2_id, interaction_type, description, solution)
SELECT s1.id, s2.id, 'synergy', 'MAO-A ↑ время жизни PEA', 'Желаемый эффект'
FROM supplements s1, supplements s2
WHERE s1.name = 'Моклобемид' AND s2.name = 'D-Phenylalanine' AND s1.user_id = 1 AND s2.user_id = 1
ON CONFLICT DO NOTHING;

INSERT INTO interactions (supplement_1_id, supplement_2_id, interaction_type, description, solution)
SELECT s1.id, s2.id, 'warning', 'Кверцетин ↑ уровень рапамицина 30-50%', 'Доза рапамицина 4мг = эфф. 5.5-7мг'
FROM supplements s1, supplements s2
WHERE s1.name = 'Рапамицин' AND s2.name = 'Кверцетин' AND s1.user_id = 1 AND s2.user_id = 1
ON CONFLICT DO NOTHING;

INSERT INTO interactions (supplement_1_id, supplement_2_id, interaction_type, description, solution)
SELECT s1.id, s2.id, 'warning', 'Берберин ↑ уровень рапамицина', 'Пропустить берберин в день рапамицина'
FROM supplements s1, supplements s2
WHERE s1.name = 'Рапамицин' AND s2.name = 'Берберин' AND s1.user_id = 1 AND s2.user_id = 1
ON CONFLICT DO NOTHING;

-- Risks
INSERT INTO risks (name, cause, symptoms, action, severity, is_active)
VALUES
('Серотониновый синдром', 'MAO + триптофан/5-HTP/СИОЗС', 'Тремор, гипертермия, тахикардия', 'СКОРАЯ. Избегать комбинаций', 'critical', true),
('Гипертонический криз', 'Рапамицин + грейпфрут', 'Сильная головная боль, тахикардия', 'СКОРАЯ. Грейпфрут ЗАПРЕЩЁН', 'critical', true),
('Иммуносупрессия', 'Рапамицин при инфекции', 'Затяжная болезнь', 'Пропустить рапамицин при болезни', 'high', true),
('Гипотония', 'Телмисартан', 'Головокружение, слабость', 'Мониторить АД', 'medium', true),
('Полипрагмазия', '45+ препаратов ежедневно', 'Непредсказуемые эффекты', 'Диагностика → упрощение', 'critical', true)
ON CONFLICT DO NOTHING;

-- Create a sample cycle
INSERT INTO cycles (user_id, cycle_date, cycle_type, verdict, input_data, master_curator_output, decisions, required_labs, next_review_date)
VALUES
(1, '2026-01-22', 'control', 'stop',
'{"goals": "Контроль", "wellbeing": {"sleep": "Средний", "energy": "Отсутствует", "cognitive_clarity": "Очень плохо"}}',
'ТОП-3 ограничителя: когнитивная дисфункция (3/10), полное отсутствие энергии, недостаток глубокого сна (15-20%)',
'{"removed": ["Суглат", "IF 16:8"], "added": ["Обязательная диагностика"]}',
'["Лептин", "fT3, fT4, ТТГ", "Кортизол утром", "АКТГ", "IGF-1"]',
'2026-02-19')
ON CONFLICT DO NOTHING;

SELECT 'Seed data inserted successfully' as result;
