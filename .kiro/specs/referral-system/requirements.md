# Requirements Document

## Introduction

Система рекрутинга (Referral System) позволяет игрокам приглашать друзей в игру и получать награды за их активность и достижения. Система включает генерацию уникальных реферальных кодов, отслеживание приглашенных игроков, многоуровневую реферальную программу с прогрессией, и систему наград за совместные достижения.

## Glossary

- **Referral_System**: Система рекрутинга, управляющая приглашениями и наградами
- **Referrer**: Игрок, который приглашает других игроков
- **Referee**: Приглашенный игрок
- **Referral_Code**: Уникальный код для приглашения друзей
- **Referral_Tier**: Уровень реферальной программы (Bronze, Silver, Gold, Platinum, Diamond)
- **Activity_Bonus**: Бонус за активность приглашенных игроков
- **Referral_Achievement**: Достижение за рекрутинг игроков
- **Player_Object**: Объект игрока, содержащий все данные
- **Friends_System**: Существующая система друзей
- **UI_Panel**: Интерфейс системы рекрутинга

## Requirements

### Requirement 1: Генерация и управление реферальными кодами

**User Story:** Как игрок, я хочу иметь уникальный реферальный код, чтобы приглашать друзей в игру.

#### Acceptance Criteria

1. WHEN a player first accesses the referral system, THE Referral_System SHALL generate a unique referral code for that player
2. THE Referral_System SHALL ensure all generated referral codes are unique across all players
3. WHEN a player views their referral code, THE UI_Panel SHALL display the code in a copyable format
4. THE Referral_System SHALL persist the referral code in the Player_Object
5. WHEN a new player enters a valid referral code during registration, THE Referral_System SHALL link the new player to the referrer

### Requirement 2: Отслеживание приглашенных игроков

**User Story:** Как игрок, я хочу видеть список моих приглашенных друзей и их прогресс, чтобы отслеживать свои достижения в рекрутинге.

#### Acceptance Criteria

1. THE Referral_System SHALL maintain a list of all referees for each referrer in the Player_Object
2. WHEN a referee is added, THE Referral_System SHALL record their player ID, join date, and current level
3. WHEN a referee's level changes, THE Referral_System SHALL update the stored level information
4. THE UI_Panel SHALL display all referees with their names, levels, and join dates
5. THE Referral_System SHALL calculate and display the total count of active referees

### Requirement 3: Награды за регистрацию и уровни

**User Story:** Как игрок, я хочу получать награды, когда мои приглашенные друзья регистрируются и достигают определенных уровней, чтобы мотивировать меня приглашать больше игроков.

#### Acceptance Criteria

1. WHEN a referee completes registration using a referral code, THE Referral_System SHALL grant the referrer a registration bonus of 100 gold and 50 experience
2. WHEN a referee reaches level 5, THE Referral_System SHALL grant the referrer 200 gold and 100 experience
3. WHEN a referee reaches level 10, THE Referral_System SHALL grant the referrer 500 gold and 300 experience
4. WHEN a referee reaches level 20, THE Referral_System SHALL grant the referrer 1000 gold and 750 experience
5. WHEN a referee reaches level 50, THE Referral_System SHALL grant the referrer 5000 gold and 3000 experience
6. THE Referral_System SHALL grant each milestone reward only once per referee

### Requirement 4: Бонусы за активность приглашенных

**User Story:** Как игрок, я хочу получать процент от активности моих приглашенных друзей, чтобы иметь постоянную выгоду от рекрутинга.

#### Acceptance Criteria

1. WHEN a referee gains experience, THE Referral_System SHALL grant the referrer 5% of that experience as a bonus
2. WHEN a referee earns gold, THE Referral_System SHALL grant the referrer 3% of that gold as a bonus
3. WHEN a referee completes a quest, THE Referral_System SHALL grant the referrer a bonus of 50 experience
4. WHEN a referee completes a dungeon, THE Referral_System SHALL grant the referrer a bonus of 100 gold
5. THE Referral_System SHALL apply activity bonuses only for referees who are currently active (logged in within 30 days)

### Requirement 5: Многоуровневая реферальная программа

**User Story:** Как игрок, я хочу прогрессировать через уровни реферальной программы, чтобы получать более ценные награды за активный рекрутинг.

#### Acceptance Criteria

1. THE Referral_System SHALL define five referral tiers: Bronze, Silver, Gold, Platinum, and Diamond
2. WHEN a player has 0 referees, THE Referral_System SHALL assign them Bronze tier
3. WHEN a player has 5 referees with combined level of 25+, THE Referral_System SHALL promote them to Silver tier
4. WHEN a player has 10 referees with combined level of 100+, THE Referral_System SHALL promote them to Gold tier
5. WHEN a player has 25 referees with combined level of 500+, THE Referral_System SHALL promote them to Platinum tier
6. WHEN a player has 50 referees with combined level of 2000+, THE Referral_System SHALL promote them to Diamond tier
7. THE Referral_System SHALL persist the current tier in the Player_Object

### Requirement 6: Награды за уровни программы

**User Story:** Как игрок, я хочу получать награды при достижении новых уровней реферальной программы, чтобы видеть ценность моих усилий.

#### Acceptance Criteria

1. WHEN a player reaches Silver tier, THE Referral_System SHALL grant 1000 gold, 500 experience, and increase activity bonuses to 7% experience and 5% gold
2. WHEN a player reaches Gold tier, THE Referral_System SHALL grant 5000 gold, 2500 experience, and increase activity bonuses to 10% experience and 7% gold
3. WHEN a player reaches Platinum tier, THE Referral_System SHALL grant 15000 gold, 10000 experience, a special title "Master Recruiter", and increase activity bonuses to 15% experience and 10% gold
4. WHEN a player reaches Diamond tier, THE Referral_System SHALL grant 50000 gold, 30000 experience, a legendary title "Legendary Recruiter", a unique cosmetic item, and increase activity bonuses to 20% experience and 15% gold
5. THE Referral_System SHALL grant tier rewards only once per tier

### Requirement 7: Достижения за рекрутинг

**User Story:** Как игрок, я хочу получать достижения за рекрутинг друзей, чтобы демонстрировать свои успехи.

#### Acceptance Criteria

1. WHEN a player recruits 1 referee, THE Referral_System SHALL unlock achievement "First Friend" with 100 gold reward
2. WHEN a player recruits 5 referees, THE Referral_System SHALL unlock achievement "Social Butterfly" with 500 gold reward
3. WHEN a player recruits 10 referees, THE Referral_System SHALL unlock achievement "Community Builder" with 1500 gold reward
4. WHEN a player recruits 25 referees, THE Referral_System SHALL unlock achievement "Guild Master" with 5000 gold reward
5. WHEN a player recruits 50 referees, THE Referral_System SHALL unlock achievement "Legend of Recruitment" with 15000 gold reward
6. WHEN a player recruits 100 referees, THE Referral_System SHALL unlock achievement "Realm Ambassador" with 50000 gold reward and a unique title
7. WHEN the combined level of all referees reaches 500, THE Referral_System SHALL unlock achievement "Mentor of Champions" with 10000 gold reward

### Requirement 8: Интеграция с системой друзей

**User Story:** Как игрок, я хочу, чтобы система рекрутинга была интегрирована с системой друзей, чтобы легко управлять приглашениями.

#### Acceptance Criteria

1. THE Referral_System SHALL integrate with the existing Friends_System
2. WHEN a referee is added, THE Referral_System SHALL automatically add them to the referrer's friends list
3. THE UI_Panel SHALL be accessible from the Friends section as a new "Recruitment" tab
4. WHEN viewing the recruitment tab, THE UI_Panel SHALL display referral statistics alongside friend information
5. THE Referral_System SHALL use the same Player_Object structure as the Friends_System

### Requirement 9: Пользовательский интерфейс

**User Story:** Как игрок, я хочу иметь понятный и информативный интерфейс системы рекрутинга, чтобы легко отслеживать свой прогресс и награды.

#### Acceptance Criteria

1. THE UI_Panel SHALL display the player's referral code prominently with a copy button
2. THE UI_Panel SHALL show the current referral tier with progress to the next tier
3. THE UI_Panel SHALL display a list of all referees with their levels and activity status
4. THE UI_Panel SHALL show total accumulated bonuses from referee activity
5. THE UI_Panel SHALL display all unlocked referral achievements
6. THE UI_Panel SHALL show available tier rewards and requirements for next tier
7. WHEN displaying statistics, THE UI_Panel SHALL use clear visual indicators for progress bars and milestones

### Requirement 10: Симуляция для одиночной игры

**User Story:** Как игрок в одиночном режиме, я хочу иметь возможность симулировать приглашенных друзей, чтобы тестировать систему рекрутинга.

#### Acceptance Criteria

1. THE Referral_System SHALL provide a simulation mode for single-player testing
2. WHEN simulation mode is active, THE Referral_System SHALL allow manual creation of simulated referees
3. THE Referral_System SHALL simulate referee activity including level progression, quest completion, and dungeon runs
4. WHEN a simulated referee is created, THE Referral_System SHALL assign them a random name, starting level, and activity pattern
5. THE Referral_System SHALL apply all normal rewards and bonuses for simulated referees

### Requirement 11: Сохранение данных

**User Story:** Как игрок, я хочу, чтобы все мои данные рекрутинга сохранялись, чтобы не потерять прогресс.

#### Acceptance Criteria

1. THE Referral_System SHALL persist all referral data in the Player_Object
2. WHEN the game is saved, THE Referral_System SHALL save the referral code, referee list, current tier, accumulated bonuses, and unlocked achievements
3. WHEN the game is loaded, THE Referral_System SHALL restore all referral data from the Player_Object
4. THE Referral_System SHALL maintain data integrity across save/load cycles
5. WHEN data corruption is detected, THE Referral_System SHALL initialize with default values and log an error

### Requirement 12: Статистика и отчеты

**User Story:** Как игрок, я хочу видеть детальную статистику моей реферальной активности, чтобы понимать эффективность рекрутинга.

#### Acceptance Criteria

1. THE Referral_System SHALL track total referees recruited
2. THE Referral_System SHALL track total experience earned from referee activity
3. THE Referral_System SHALL track total gold earned from referee activity
4. THE Referral_System SHALL track total milestone rewards received
5. THE Referral_System SHALL calculate and display the combined level of all referees
6. THE UI_Panel SHALL display all statistics in a dedicated statistics section
