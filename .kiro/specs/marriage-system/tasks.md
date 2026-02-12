# Implementation Plan: Marriage System

## Overview

Реализация комплексной системы свадеб для RPG игры, включающей 10 уровней отношений, предложения руки и сердца, свадебные церемонии, бонусы для пар, общий дом, систему подарков, годовщины, квесты и разводы. Система интегрируется с существующей системой друзей и использует React для UI.

Подход к реализации:
1. Создание базовых утилит и констант
2. Реализация core-модулей (Relationship Manager, Proposal Handler, etc.)
3. Создание UI компонентов
4. Интеграция с существующей системой
5. Тестирование с property-based тестами

## Tasks

- [ ] 1. Setup project structure and core constants
  - Create `constants/marriageConstants.js` with all configuration data (rings, venues, gifts, anniversaries, relationship levels)
  - Create `utils/marriageUtils.js` for utility functions
  - Setup marriage data structure in player object
  - _Requirements: 1.1, 2.2, 3.1, 7.1, 8.1_

- [ ] 2. Implement Relationship Manager
  - [ ] 2.1 Create RelationshipManager class with core methods
    - Implement `addRelationshipPoints()`, `getRelationshipLevel()`, `getRelationshipPoints()`
    - Implement `getProgressToNextLevel()`, `getRelationshipLevelName()`
    - Implement `hasRequiredLevel()`, `resetRelationship()`
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [ ]* 2.2 Write property test for relationship level progression
    - **Property 3: Level advancement on threshold crossing**
    - **Validates: Requirements 1.3**
  
  - [ ]* 2.3 Write property test for relationship data persistence
    - **Property 4: Relationship data persistence**
    - **Validates: Requirements 1.5**
  
  - [ ]* 2.4 Write unit tests for relationship manager
    - Test level name retrieval
    - Test progress calculation
    - Test edge cases (max level, zero points)
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Implement Proposal Handler
  - [ ] 3.1 Create ProposalHandler class with proposal logic
    - Implement `purchaseRing()`, `sendProposal()`, `canSendProposal()`
    - Implement `handleProposalResponse()`, `simulatePartnerResponse()`
    - Implement ring validation and state transitions
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 3.2 Write property test for ring purchase validation
    - **Property 5: Ring purchase validation**
    - **Validates: Requirements 2.1**
  
  - [ ]* 3.3 Write property test for proposal requirements
    - **Property 7: Proposal level requirement**
    - **Property 8: Proposal relationship requirement**
    - **Validates: Requirements 2.3, 2.4**
  
  - [ ]* 3.4 Write property test for proposal acceptance state transition
    - **Property 9: Proposal acceptance state transition**
    - **Validates: Requirements 2.6**
  
  - [ ]* 3.5 Write property test for proposal decline ring return
    - **Property 10: Proposal decline ring return**
    - **Validates: Requirements 2.7**
  
  - [ ]* 3.6 Write unit tests for simulated partner responses
    - Test acceptance/decline logic
    - Test probability distributions
    - _Requirements: 12.2, 12.3, 12.4_

- [ ] 4. Checkpoint - Ensure relationship and proposal systems work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Wedding Organizer
  - [ ] 5.1 Create WeddingOrganizer class with wedding logic
    - Implement `startWeddingPlanning()`, `selectVenue()`, `inviteGuests()`
    - Implement `conductCeremony()`, `canOrganizeWedding()`
    - Implement venue validation and ceremony flow
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 5.2 Write property test for wedding organization requirements
    - **Property 12: Wedding organization engagement requirement**
    - **Property 13: Wedding organization gold requirement**
    - **Validates: Requirements 3.2, 3.3**
  
  - [ ]* 5.3 Write property test for guest invitation limit
    - **Property 14: Guest invitation limit**
    - **Validates: Requirements 3.4**
  
  - [ ]* 5.4 Write property test for venue cost deduction
    - **Property 15: Venue cost deduction**
    - **Validates: Requirements 3.5**
  
  - [ ]* 5.5 Write property test for ceremony state transition
    - **Property 17: Marriage ceremony state transition**
    - **Validates: Requirements 4.3, 4.4, 4.6**
  
  - [ ]* 5.6 Write property test for venue blessing application
    - **Property 18: Venue blessing application**
    - **Validates: Requirements 4.5**

- [ ] 6. Implement Couple Benefits
  - [ ] 6.1 Create CoupleBenefits class with bonus logic
    - Implement `getActiveBonuses()`, `applyMarriageBonuses()`, `applyPartyBonuses()`
    - Implement `applyRingBonus()`, `applyVenueBlessing()`, `teleportToPartner()`
    - Implement cooldown tracking for teleport
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ]* 6.2 Write property test for marriage bonuses application
    - **Property 19: Marriage bonuses application**
    - **Validates: Requirements 5.1, 5.2, 5.5, 5.6**
  
  - [ ]* 6.3 Write property test for party bonuses
    - **Property 20: Party bonuses application**
    - **Validates: Requirements 5.3, 5.4**
  
  - [ ]* 6.4 Write property test for teleport cooldown
    - **Property 21: Teleport cooldown**
    - **Validates: Requirements 5.7**

- [ ] 7. Implement Shared Home
  - [ ] 7.1 Create SharedHome class with shared resources
    - Implement `createSharedHome()`, `getSharedBank()`, `depositToSharedBank()`
    - Implement `withdrawFromSharedBank()`, `getSharedChest()`, `splitResources()`
    - Implement home customization methods
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 7.2 Write property test for shared home creation
    - **Property 22: Shared home creation**
    - **Validates: Requirements 6.1**
  
  - [ ]* 7.3 Write property test for shared bank operations
    - **Property 23: Shared bank accessibility**
    - **Property 24: Shared bank withdrawal**
    - **Validates: Requirements 6.2, 6.3, 6.4**
  
  - [ ]* 7.4 Write property test for shared chest capacity
    - **Property 25: Shared chest capacity**
    - **Validates: Requirements 6.5**

- [ ] 8. Checkpoint - Ensure wedding and benefits systems work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement Gift System
  - [ ] 9.1 Create GiftSystem class with gift logic
    - Implement `sendGift()`, `receiveGift()`, `applyGiftEffect()`
    - Implement gift validation and effect tracking
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 9.2 Write property test for gift purchase validation
    - **Property 27: Gift purchase validation**
    - **Validates: Requirements 7.2**
  
  - [ ]* 9.3 Write property test for gift relationship points
    - **Property 28: Gift relationship points increase**
    - **Validates: Requirements 7.3**
  
  - [ ]* 9.4 Write property test for gift effect application
    - **Property 29: Gift effect application**
    - **Validates: Requirements 7.4**

- [ ] 10. Implement Anniversary Tracker
  - [ ] 10.1 Create AnniversaryTracker class with anniversary logic
    - Implement `checkAnniversaries()`, `getNextAnniversary()`, `getTimeToNextAnniversary()`
    - Implement `grantAnniversaryReward()`, `hasReceivedReward()`
    - Implement in-game time calculation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_
  
  - [ ]* 10.2 Write property test for anniversary time calculation
    - **Property 32: Anniversary time calculation**
    - **Validates: Requirements 8.8**
  
  - [ ]* 10.3 Write unit tests for specific anniversary rewards
    - Test 1 year anniversary (gold reward)
    - Test 5 year anniversary (mount reward)
    - Test 10 year anniversary (weapon reward)
    - _Requirements: 8.3, 8.4, 8.5_

- [ ] 11. Implement Wedding Quest Manager
  - [ ] 11.1 Create WeddingQuestManager class with quest logic
    - Implement `getAvailableQuests()`, `startQuest()`, `updateQuestProgress()`
    - Implement `completeQuest()`, `grantQuestRewards()`, `canStartQuest()`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ]* 11.2 Write property test for quest completion rewards
    - **Property 33: Quest completion relationship points**
    - **Property 34: Quest completion rewards distribution**
    - **Validates: Requirements 9.4, 9.5**
  
  - [ ]* 11.3 Write property test for quest availability
    - **Property 35: Quest availability by level**
    - **Validates: Requirements 9.6**
  
  - [ ]* 11.4 Write unit tests for specific quests
    - Test "Первое свидание" quest
    - Test "Романтический ужин" quest
    - Test "Совместное приключение" quest
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 12. Implement Divorce Handler
  - [ ] 12.1 Create DivorceHandler class with divorce logic
    - Implement `initiateDivorce()`, `confirmDivorce()`, `calculateDivorcePenalty()`
    - Implement `processDivorce()`, `splitSharedResources()`, `removeMarriageStatus()`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_
  
  - [ ]* 12.2 Write property test for divorce penalty calculation
    - **Property 36: Divorce penalty calculation**
    - **Validates: Requirements 10.2**
  
  - [ ]* 12.3 Write property test for divorce state reset
    - **Property 37: Divorce state reset**
    - **Validates: Requirements 10.4, 10.5, 10.6, 10.7**
  
  - [ ]* 12.4 Write property test for divorce resource split
    - **Property 38: Divorce resource split**
    - **Validates: Requirements 10.8, 10.9**

- [ ] 13. Checkpoint - Ensure all core systems work together
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Create UI components for relationship management
  - [ ] 14.1 Create RelationshipPanel component
    - Display relationship levels with all friends
    - Show progress bars and relationship points
    - Display relationship level names
    - _Requirements: 1.4, 11.2, 11.4_
  
  - [ ]* 14.2 Write unit tests for RelationshipPanel
    - Test rendering with various relationship levels
    - Test progress bar calculations
    - _Requirements: 1.4_

- [ ] 15. Create UI components for proposals
  - [ ] 15.1 Create ProposalScreen component
    - Display available wedding rings with previews
    - Show ring costs and bonuses
    - Implement ring purchase and proposal sending
    - _Requirements: 2.1, 2.2, 2.5, 13.4_
  
  - [ ] 15.2 Create ProposalNotification component
    - Display incoming proposals
    - Allow accept/decline actions
    - Show proposer information
    - _Requirements: 2.5, 13.8_
  
  - [ ]* 15.3 Write unit tests for proposal UI components
    - Test ring display and selection
    - Test proposal notification rendering
    - _Requirements: 2.5, 13.4_

- [ ] 16. Create UI components for wedding planning
  - [ ] 16.1 Create WeddingPlanningScreen component
    - Display available venues with previews
    - Show venue costs and blessings
    - Implement guest invitation interface
    - _Requirements: 3.1, 3.4, 3.6, 13.5_
  
  - [ ] 16.2 Create WeddingCeremonyScreen component
    - Display ceremony animation and vows
    - Show NPC priest and venue
    - Display ceremony completion effects
    - _Requirements: 4.1, 4.2, 13.1_
  
  - [ ]* 16.3 Write unit tests for wedding UI components
    - Test venue display and selection
    - Test guest invitation interface
    - _Requirements: 3.1, 13.5_

- [ ] 17. Create UI components for couple benefits
  - [ ] 17.1 Create CoupleBenefitsPanel component
    - Display all active bonuses with icons
    - Show bonus values and sources (ring, venue, party)
    - Display teleport button with cooldown timer
    - _Requirements: 5.1, 5.2, 5.7, 13.6_
  
  - [ ]* 17.2 Write unit tests for benefits panel
    - Test bonus display rendering
    - Test cooldown timer display
    - _Requirements: 13.6_

- [ ] 18. Create UI components for shared home
  - [ ] 18.1 Create SharedHomeScreen component
    - Display shared bank interface
    - Show shared chest with 100 slots
    - Implement deposit/withdraw actions
    - Display home customization options
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 18.2 Write unit tests for shared home UI
    - Test bank operations interface
    - Test chest slot rendering
    - _Requirements: 6.2, 6.5_

- [ ] 19. Create UI components for gifts and anniversaries
  - [ ] 19.1 Create GiftShopScreen component
    - Display available gifts with previews
    - Show gift costs and effects
    - Implement gift sending interface
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ] 19.2 Create AnniversaryPanel component
    - Display next anniversary countdown
    - Show anniversary milestones and rewards
    - Display received anniversary rewards
    - _Requirements: 8.1, 8.2, 13.7_
  
  - [ ]* 19.3 Write unit tests for gift and anniversary UI
    - Test gift display and selection
    - Test anniversary countdown rendering
    - _Requirements: 7.1, 13.7_

- [ ] 20. Create UI components for quests and divorce
  - [ ] 20.1 Create WeddingQuestsPanel component
    - Display available wedding quests
    - Show quest requirements and rewards
    - Display quest progress
    - _Requirements: 9.1, 9.2, 9.3, 9.6_
  
  - [ ] 20.2 Create DivorceConfirmationDialog component
    - Display divorce confirmation prompt
    - Show divorce penalty calculation
    - Implement confirm/cancel actions
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 20.3 Write unit tests for quest and divorce UI
    - Test quest display and availability
    - Test divorce confirmation dialog
    - _Requirements: 9.6, 10.1_

- [ ] 21. Create main Marriage Screen component
  - [ ] 21.1 Create MarriageScreen component with tabs
    - Implement tab navigation (relationships, proposals, wedding, benefits, home, gifts, anniversaries, quests)
    - Integrate all sub-components
    - Apply gradient backgrounds and animations
    - _Requirements: 13.1, 13.2_
  
  - [ ]* 21.2 Write unit tests for main marriage screen
    - Test tab navigation
    - Test component integration
    - _Requirements: 13.1_

- [ ] 22. Checkpoint - Ensure all UI components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Integrate with friends system
  - [ ] 23.1 Connect marriage system to existing friends list
    - Import friends data into relationship manager
    - Display friends in partner selection
    - Prioritize friends in partner list
    - _Requirements: 11.1, 11.5_
  
  - [ ]* 23.2 Write integration tests for friends system
    - Test friends list integration
    - Test partner prioritization
    - _Requirements: 11.1, 11.5_

- [ ] 24. Implement data persistence
  - [ ] 24.1 Add marriage data to player object structure
    - Define marriageData schema in player object
    - Implement serialization for all marriage data
    - Implement deserialization on game load
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10_
  
  - [ ]* 24.2 Write property test for data serialization round-trip
    - **Property 44: Marriage data serialization round-trip**
    - **Validates: Requirements 14.9, 14.10**
  
  - [ ]* 24.3 Write unit tests for data persistence
    - Test save/load operations
    - Test data migration
    - _Requirements: 14.9, 14.10_

- [ ] 25. Implement simulated multiplayer behavior
  - [ ] 25.1 Create partner simulation logic
    - Generate random simulated partners
    - Implement AI response logic for proposals
    - Simulate partner presence for bonuses
    - _Requirements: 12.1, 12.2, 12.5, 12.6_
  
  - [ ]* 25.2 Write property tests for simulated behavior
    - **Property 41: Simulated partner response generation**
    - **Property 42: Simulated acceptance probability**
    - **Property 43: Simulated decline probability**
    - **Validates: Requirements 12.2, 12.3, 12.4**

- [ ] 26. Add error handling and validation
  - [ ] 26.1 Implement error handling for all operations
    - Add validation errors (insufficient gold, requirements not met, capacity exceeded)
    - Add state errors (invalid transitions, partner not found, cooldown active)
    - Add data errors (corrupted data, missing configuration)
    - Display user-friendly error messages
    - _Requirements: All validation requirements_
  
  - [ ]* 26.2 Write unit tests for error handling
    - Test all error conditions
    - Test error message display
    - Test state preservation on errors

- [ ] 27. Implement notifications system
  - [ ] 27.1 Create notification system for marriage events
    - Implement notifications for proposals, weddings, gifts, anniversaries
    - Display notifications in UI
    - Track notification read status
    - _Requirements: 2.5, 3.6, 7.5, 8.2, 13.8_
  
  - [ ]* 27.2 Write unit tests for notifications
    - Test notification creation
    - Test notification display
    - _Requirements: 13.8_

- [ ] 28. Final integration and polish
  - [ ] 28.1 Wire all components together in App.jsx
    - Add marriage screen to main navigation
    - Connect all data flows
    - Ensure all features work end-to-end
    - _Requirements: All requirements_
  
  - [ ] 28.2 Add animations and visual polish
    - Implement gradient backgrounds
    - Add smooth transitions
    - Polish UI components
    - _Requirements: 13.2_
  
  - [ ]* 28.3 Write end-to-end integration tests
    - Test complete wedding flow (relationship → proposal → wedding → benefits)
    - Test complete divorce flow
    - Test gift exchange flow
    - Test anniversary milestone flow

- [ ] 29. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Use `fast-check` library for property-based testing in JavaScript
- All property tests must include tag comment: `// Feature: marriage-system, Property N: [property text]`
- Integration with existing friends system is critical for partner selection
- Simulated multiplayer allows testing without real players
- Data persistence ensures marriage state survives game restarts
