# Requirements Document: Marriage System

## Introduction

Система свадеб позволяет игрокам создавать романтические отношения, жениться друг на друге, получать бонусы для пар и развивать долгосрочные партнерские связи в игре. Система включает механики отношений, свадебные церемонии, совместные бонусы, общий дом и систему годовщин.

## Glossary

- **Marriage_System**: Основная система управления браками и отношениями между игроками
- **Relationship_Manager**: Компонент управления уровнями отношений и очками
- **Proposal_Handler**: Компонент обработки предложений руки и сердца
- **Wedding_Organizer**: Компонент организации свадебных церемоний
- **Couple_Benefits**: Система бонусов для женатых пар
- **Shared_Home**: Общий дом для пары с совместным хранилищем
- **Gift_System**: Система подарков между партнерами
- **Anniversary_Tracker**: Отслеживание и награждение годовщин
- **Wedding_Quest_Manager**: Управление свадебными квестами
- **Divorce_Handler**: Обработка разводов (опциональная функция)
- **Player**: Игрок в системе
- **Partner**: Второй игрок в паре
- **Relationship_Points**: Очки отношений, накапливаемые парой
- **Relationship_Level**: Уровень отношений от 1 до 10
- **Wedding_Ring**: Обручальное кольцо различной редкости
- **Wedding_Venue**: Место проведения свадебной церемонии
- **Marriage_Status**: Статус брака (не женат, помолвлен, женат)
- **Couple_Bonus**: Бонус, применяемый к паре
- **Anniversary**: Годовщина свадьбы
- **Wedding_Guest**: Гость на свадебной церемонии
- **Shared_Bank**: Общий банк для пары
- **Gift**: Подарок для партнера
- **Wedding_Quest**: Квест для пары

## Requirements

### Requirement 1: Система уровней отношений

**User Story:** Как игрок, я хочу развивать отношения с другим игроком через совместные действия, чтобы достичь более высоких уровней близости и получить доступ к браку.

#### Acceptance Criteria

1. THE Relationship_Manager SHALL maintain exactly 10 relationship levels with names: "Незнакомцы" (level 1), "Знакомые" (level 2), "Друзья" (level 3), "Близкие друзья" (level 4), "Влюбленные" (level 5), "Помолвлены" (level 6), "Молодожены" (level 7), "Счастливая пара" (level 8), "Идеальная пара" (level 9), "Легендарная пара" (level 10)
2. WHEN players perform joint actions, THE Relationship_Manager SHALL increase Relationship_Points between those players
3. WHEN Relationship_Points reach the threshold for the next level, THE Relationship_Manager SHALL advance the Relationship_Level by one
4. THE Relationship_Manager SHALL display current Relationship_Points and progress to next level in the UI
5. THE Relationship_Manager SHALL store relationship data in the Player object

### Requirement 2: Предложение руки и сердца

**User Story:** Как игрок, я хочу сделать предложение руки и сердца своему партнеру, чтобы начать процесс создания брака.

#### Acceptance Criteria

1. WHEN a Player attempts to purchase a Wedding_Ring, THE Proposal_Handler SHALL verify the Player has sufficient gold
2. THE Proposal_Handler SHALL provide 5 types of Wedding_Ring with different costs and bonuses: "Простое" (100 gold, +5% XP), "Серебряное" (500 gold, +7% XP), "Золотое" (1000 gold, +10% XP), "Платиновое" (2500 gold, +12% XP), "Легендарное" (5000 gold, +15% XP)
3. WHEN a Player sends a proposal, THE Proposal_Handler SHALL verify the Player level is 10 or higher
4. WHEN a Player sends a proposal, THE Proposal_Handler SHALL verify the Relationship_Level with Partner is "Влюбленные" (level 5) or higher
5. WHEN a proposal is sent, THE Proposal_Handler SHALL notify the Partner and allow them to accept or decline
6. WHEN a Partner accepts a proposal, THE Proposal_Handler SHALL set both players' Marriage_Status to "Помолвлен" and advance Relationship_Level to "Помолвлены" (level 6)
7. WHEN a Partner declines a proposal, THE Proposal_Handler SHALL return the Wedding_Ring to the proposing Player

### Requirement 3: Организация свадебной церемонии

**User Story:** Как помолвленный игрок, я хочу организовать свадебную церемонию, чтобы официально пожениться и получить бонусы.

#### Acceptance Criteria

1. THE Wedding_Organizer SHALL provide 5 Wedding_Venue options: "Храм" (cost: 500 gold, blessing: +5% healing), "Сад" (cost: 750 gold, blessing: +5% nature damage), "Пляж" (cost: 1000 gold, blessing: +5% water resistance), "Замок" (cost: 2000 gold, blessing: +10% defense), "Небесный остров" (cost: 5000 gold, blessing: +15% all stats)
2. WHEN organizing a wedding, THE Wedding_Organizer SHALL verify both players have Marriage_Status "Помолвлен"
3. WHEN organizing a wedding, THE Wedding_Organizer SHALL verify the organizing Player has sufficient gold for the chosen Wedding_Venue
4. WHEN a wedding is organized, THE Wedding_Organizer SHALL allow the couple to invite up to 20 Wedding_Guests from their friends list
5. WHEN a wedding is organized, THE Wedding_Organizer SHALL deduct the venue cost from the organizing Player's gold
6. WHEN a wedding is organized, THE Wedding_Organizer SHALL schedule the ceremony and notify all invited Wedding_Guests

### Requirement 4: Проведение свадебной церемонии

**User Story:** Как помолвленный игрок, я хочу провести свадебную церемонию, чтобы официально стать женатой парой.

#### Acceptance Criteria

1. WHEN a wedding ceremony begins, THE Wedding_Organizer SHALL spawn an NPC priest at the chosen Wedding_Venue
2. WHEN the ceremony is in progress, THE Wedding_Organizer SHALL display exchange of vows between the couple
3. WHEN vows are exchanged, THE Wedding_Organizer SHALL set both players' Marriage_Status to "Женат"
4. WHEN the ceremony completes, THE Wedding_Organizer SHALL advance Relationship_Level to "Молодожены" (level 7)
5. WHEN the ceremony completes, THE Wedding_Organizer SHALL apply the Wedding_Venue blessing to both players permanently
6. WHEN the ceremony completes, THE Wedding_Organizer SHALL record the wedding date for Anniversary_Tracker

### Requirement 5: Бонусы для женатых пар

**User Story:** Как женатый игрок, я хочу получать бонусы от брака, чтобы иметь преимущества при совместной игре с партнером.

#### Acceptance Criteria

1. WHEN a Player has Marriage_Status "Женат", THE Couple_Benefits SHALL apply a base bonus of +10% experience gain
2. WHEN a Player has Marriage_Status "Женат", THE Couple_Benefits SHALL apply a base bonus of +15% gold gain
3. WHEN both married players are in the same party, THE Couple_Benefits SHALL apply an additional +5% experience bonus
4. WHEN both married players are in the same party, THE Couple_Benefits SHALL apply an additional +5% gold bonus
5. WHEN a Player has Marriage_Status "Женат", THE Couple_Benefits SHALL apply the Wedding_Ring bonus to that Player
6. WHEN a Player has Marriage_Status "Женат", THE Couple_Benefits SHALL apply the Wedding_Venue blessing to that Player
7. THE Couple_Benefits SHALL provide a teleport ability to Partner location with 1 hour cooldown

### Requirement 6: Общий банк и дом для пары

**User Story:** Как женатый игрок, я хочу иметь общий дом и банк с партнером, чтобы мы могли совместно управлять ресурсами.

#### Acceptance Criteria

1. WHEN a couple gets married, THE Shared_Home SHALL create a shared house instance for the couple
2. THE Shared_Home SHALL provide a Shared_Bank accessible by both partners
3. WHEN a Player deposits items or gold into Shared_Bank, THE Shared_Home SHALL make those resources accessible to Partner
4. WHEN a Player withdraws items or gold from Shared_Bank, THE Shared_Home SHALL deduct those resources from the shared pool
5. THE Shared_Home SHALL provide a shared storage chest with 100 item slots
6. THE Shared_Home SHALL allow both partners to decorate and customize the house

### Requirement 7: Система подарков

**User Story:** Как игрок в отношениях, я хочу дарить подарки своему партнеру, чтобы увеличивать очки отношений и получать особые эффекты.

#### Acceptance Criteria

1. THE Gift_System SHALL provide 4 types of Gift: "Цветы" (cost: 50 gold, +10 Relationship_Points, +5% happiness 1 hour), "Шоколад" (cost: 100 gold, +20 Relationship_Points, +10% energy regen 2 hours), "Украшения" (cost: 500 gold, +50 Relationship_Points, +5% all stats 4 hours), "Питомец" (cost: 2000 gold, +200 Relationship_Points, permanent companion)
2. WHEN a Player sends a Gift, THE Gift_System SHALL verify the Player has sufficient gold
3. WHEN a Partner receives a Gift, THE Gift_System SHALL increase Relationship_Points by the Gift's value
4. WHEN a Partner receives a Gift, THE Gift_System SHALL apply the Gift's special effect to the Partner
5. WHEN a Partner receives a Gift, THE Gift_System SHALL notify the Partner with a message

### Requirement 8: Система годовщин

**User Story:** Как женатый игрок, я хочу отмечать годовщины свадьбы, чтобы получать уникальные награды за долгосрочные отношения.

#### Acceptance Criteria

1. THE Anniversary_Tracker SHALL track 5 Anniversary milestones: 1 year, 5 years, 10 years, 25 years, 50 years
2. WHEN an Anniversary milestone is reached, THE Anniversary_Tracker SHALL notify both partners
3. WHEN 1 year Anniversary is reached, THE Anniversary_Tracker SHALL grant title "Годовалая пара" and reward 1000 gold
4. WHEN 5 year Anniversary is reached, THE Anniversary_Tracker SHALL grant title "Пятилетняя пара" and reward unique mount
5. WHEN 10 year Anniversary is reached, THE Anniversary_Tracker SHALL grant title "Десятилетняя пара" and reward legendary weapon
6. WHEN 25 year Anniversary is reached, THE Anniversary_Tracker SHALL grant title "Серебряная пара" and reward epic armor set
7. WHEN 50 year Anniversary is reached, THE Anniversary_Tracker SHALL grant title "Золотая пара" and reward mythic companion pet
8. THE Anniversary_Tracker SHALL use in-game time for calculating anniversaries

### Requirement 9: Свадебные квесты

**User Story:** Как игрок в отношениях, я хочу выполнять специальные квесты для пар, чтобы развивать отношения и получать награды.

#### Acceptance Criteria

1. THE Wedding_Quest_Manager SHALL provide quest "Первое свидание" requiring couple to visit romantic location together
2. THE Wedding_Quest_Manager SHALL provide quest "Романтический ужин" requiring couple to cook and share a meal
3. THE Wedding_Quest_Manager SHALL provide quest "Совместное приключение" requiring couple to complete a dungeon together
4. WHEN a Wedding_Quest is completed, THE Wedding_Quest_Manager SHALL grant +100 Relationship_Points to the couple
5. WHEN a Wedding_Quest is completed, THE Wedding_Quest_Manager SHALL grant rewards (gold, items, or experience) to both partners
6. THE Wedding_Quest_Manager SHALL make quests available based on Relationship_Level

### Requirement 10: Система развода

**User Story:** Как женатый игрок, я хочу иметь возможность развестись, чтобы завершить брак, если отношения не сложились.

#### Acceptance Criteria

1. WHEN a married Player initiates divorce, THE Divorce_Handler SHALL require confirmation from that Player
2. WHEN divorce is confirmed, THE Divorce_Handler SHALL calculate 10% of the couple's total gold (personal + Shared_Bank)
3. WHEN divorce is confirmed, THE Divorce_Handler SHALL deduct the calculated penalty from the Shared_Bank or split between players if insufficient
4. WHEN divorce is confirmed, THE Divorce_Handler SHALL set both players' Marriage_Status to "Не женат"
5. WHEN divorce is confirmed, THE Divorce_Handler SHALL reset Relationship_Level to "Незнакомцы" (level 1)
6. WHEN divorce is confirmed, THE Divorce_Handler SHALL reset Relationship_Points to 0
7. WHEN divorce is confirmed, THE Divorce_Handler SHALL remove all Couple_Bonus effects from both players
8. WHEN divorce is confirmed, THE Divorce_Handler SHALL split Shared_Bank contents equally between players
9. WHEN divorce is confirmed, THE Divorce_Handler SHALL remove access to Shared_Home for both players

### Requirement 11: Интеграция с системой друзей

**User Story:** Как игрок, я хочу, чтобы система свадеб интегрировалась с системой друзей, чтобы я мог легко находить потенциальных партнеров.

#### Acceptance Criteria

1. THE Marriage_System SHALL access the existing friends list to display potential partners
2. WHEN viewing a friend's profile, THE Marriage_System SHALL display current Relationship_Level with that friend
3. WHEN viewing a friend's profile, THE Marriage_System SHALL display an option to send a proposal if requirements are met
4. THE Marriage_System SHALL allow players to view Relationship_Points with all friends
5. THE Marriage_System SHALL prioritize friends in the partner selection interface

### Requirement 12: Симуляция мультиплеера

**User Story:** Как разработчик, я хочу симулировать мультиплеерное взаимодействие, чтобы система работала в однопользовательской среде для тестирования.

#### Acceptance Criteria

1. THE Marriage_System SHALL generate simulated Partner responses when real players are unavailable
2. WHEN a proposal is sent to a simulated Partner, THE Marriage_System SHALL generate an accept/decline response based on Relationship_Level
3. WHEN Relationship_Level is "Влюбленные" or higher, THE Marriage_System SHALL generate acceptance with 80% probability
4. WHEN Relationship_Level is below "Влюбленные", THE Marriage_System SHALL generate decline with 90% probability
5. THE Marriage_System SHALL simulate Partner presence for joint activities and bonuses
6. THE Marriage_System SHALL generate random simulated partners with varied characteristics for testing

### Requirement 13: Пользовательский интерфейс

**User Story:** Как игрок, я хочу иметь красивый и интуитивный интерфейс для системы свадеб, чтобы легко управлять отношениями и браком.

#### Acceptance Criteria

1. THE Marriage_System SHALL display a main marriage screen with tabs for: relationships, proposals, wedding planning, couple benefits, shared home, gifts, anniversaries, quests
2. THE Marriage_System SHALL use gradient backgrounds and smooth animations for all UI elements
3. WHEN displaying Relationship_Level progress, THE Marriage_System SHALL show a visual progress bar with percentage
4. WHEN displaying Wedding_Ring options, THE Marriage_System SHALL show preview of ring appearance and bonus stats
5. WHEN displaying Wedding_Venue options, THE Marriage_System SHALL show preview images and blessing descriptions
6. THE Marriage_System SHALL display active Couple_Bonus effects with icons and timers
7. THE Marriage_System SHALL display Anniversary countdown and next milestone information
8. THE Marriage_System SHALL provide notifications for important events (proposal received, wedding invitation, anniversary, gift received)

### Requirement 14: Хранение данных

**User Story:** Как разработчик, я хочу хранить все данные о браке в объекте игрока, чтобы обеспечить персистентность и легкий доступ.

#### Acceptance Criteria

1. THE Marriage_System SHALL store all marriage-related data in the Player object
2. THE Marriage_System SHALL persist Marriage_Status in Player object
3. THE Marriage_System SHALL persist Partner reference in Player object
4. THE Marriage_System SHALL persist Relationship_Level and Relationship_Points in Player object
5. THE Marriage_System SHALL persist Wedding_Ring type and bonuses in Player object
6. THE Marriage_System SHALL persist wedding date and Anniversary data in Player object
7. THE Marriage_System SHALL persist Shared_Bank contents in a shared data structure accessible by both partners
8. THE Marriage_System SHALL persist Shared_Home customization data
9. WHEN game is saved, THE Marriage_System SHALL serialize all marriage data to storage
10. WHEN game is loaded, THE Marriage_System SHALL deserialize all marriage data from storage
