# Implementation Plan: Referral System

## Overview

This implementation plan breaks down the Referral System into discrete coding tasks. The system will be built incrementally, starting with core data structures and code management, then adding referee tracking, tier progression, rewards, achievements, UI components, and finally simulation mode. Each task builds on previous work and includes testing sub-tasks to validate functionality early.

## Tasks

- [ ] 1. Set up referral system data structures and constants
  - Create `constants/referralConstants.js` with tier definitions, milestone rewards, achievements, and bonus configurations
  - Define the referral data structure to extend the Player Object
  - Create global referral code registry structure
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 6.1-6.4, 7.1-7.7_

- [ ] 2. Implement ReferralCodeManager
  - [ ] 2.1 Create `utils/referralCodeManager.js` with code generation logic
    - Implement `generateCode(playerId)` to create unique 8-character codes
    - Implement `validateCode(code)` to check code validity
    - Implement `linkReferee(code, newPlayer)` to connect referee to referrer
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 2.2 Write property test for code uniqueness
    - **Property 1: Referral Code Uniqueness**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 2.3 Write property test for referee linking
    - **Property 3: Referee Linking**
    - **Validates: Requirements 1.5, 3.1**

- [ ] 3. Implement RefereeTracker
  - [ ] 3.1 Create `utils/refereeTracker.js` with referee management logic
    - Implement `addReferee(referrer, referee)` to add new referees
    - Implement `updateRefereeLevel(referrer, refereeId, newLevel)` to sync levels
    - Implement `isActive(referee)` to check 30-day activity window
    - Implement `getActiveReferees(referrer)` to filter active referees
    - Implement `getCombinedLevel(referrer)` to calculate total levels
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 4.5, 12.5_
  
  - [ ]* 3.2 Write property test for referee data completeness
    - **Property 4: Referee Data Completeness**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ]* 3.3 Write property test for level synchronization
    - **Property 5: Referee Level Synchronization**
    - **Validates: Requirements 2.3**
  
  - [ ]* 3.4 Write property test for combined level calculation
    - **Property 25: Combined Level Calculation**
    - **Validates: Requirements 12.5**

- [ ] 4. Implement TierManager
  - [ ] 4.1 Create `utils/tierManager.js` with tier progression logic
    - Implement `calculateTier(refereeCount, combinedLevel)` to determine tier
    - Implement `checkPromotion(player)` to detect and handle promotions
    - Implement `getBonusRates(tierName)` to get tier-specific bonuses
    - Implement `getProgressToNextTier(player)` to calculate progress
    - _Requirements: 5.2-5.7, 6.1-6.5_
  
  - [ ]* 4.2 Write property test for tier calculation
    - **Property 11: Tier Calculation Correctness**
    - **Validates: Requirements 5.3, 5.4, 5.5, 5.6**
  
  - [ ]* 4.3 Write unit test for initial Bronze tier
    - Test that new players start with Bronze tier
    - _Requirements: 5.2_

- [ ] 5. Implement RewardCalculator
  - [ ] 5.1 Create `utils/rewardCalculator.js` with reward logic
    - Implement `grantRegistrationBonus(referrer)` for new referee rewards
    - Implement `checkMilestoneRewards(referrer, refereeId, newLevel)` for level milestones
    - Implement `grantActivityBonus(referrer, activityType, amount)` for ongoing bonuses
    - Implement `grantTierRewards(player, newTier)` for tier promotion rewards
    - _Requirements: 3.1-3.6, 4.1-4.4, 6.1-6.5_
  
  - [ ]* 5.2 Write property test for milestone rewards
    - **Property 7: Milestone Reward Correctness**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**
  
  - [ ]* 5.3 Write property test for activity bonus calculation
    - **Property 8: Activity Bonus Calculation**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 5.4 Write property test for quest and dungeon bonuses
    - **Property 9: Quest and Dungeon Bonuses**
    - **Validates: Requirements 4.3, 4.4**
  
  - [ ]* 5.5 Write property test for tier promotion rewards
    - **Property 13: Tier Promotion Rewards**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

- [ ] 6. Checkpoint - Ensure core referral logic works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement AchievementManager
  - [ ] 7.1 Create `utils/achievementManager.js` with achievement logic
    - Implement `checkAchievements(player)` to evaluate all achievements
    - Implement `isUnlocked(player, achievementId)` to check unlock status
    - Implement `unlockAchievement(player, achievementId)` to grant achievements
    - _Requirements: 7.1-7.7_
  
  - [ ]* 7.2 Write property test for achievement unlocking
    - **Property 14: Achievement Unlocking**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**
  
  - [ ]* 7.3 Write unit test for first friend achievement
    - Test that recruiting exactly 1 referee unlocks "First Friend"
    - _Requirements: 7.1_

- [ ] 8. Implement data persistence
  - [ ] 8.1 Add referral data save/load functions
    - Extend player save logic to include referral data
    - Extend player load logic to restore referral data
    - Add data validation and corruption handling
    - _Requirements: 11.1-11.5_
  
  - [ ]* 8.2 Write property test for save/load round trip
    - **Property 2: Referral Code Persistence**
    - **Property 12: Tier Persistence**
    - **Property 23: Save/Load Round Trip**
    - **Validates: Requirements 1.4, 5.7, 11.1, 11.2, 11.3, 11.4**
  
  - [ ]* 8.3 Write unit test for data corruption handling
    - Test that corrupted data initializes with defaults
    - _Requirements: 11.5_

- [ ] 9. Implement statistics tracking
  - [ ] 9.1 Create `utils/referralStats.js` with statistics logic
    - Implement functions to track total referees, exp earned, gold earned
    - Implement functions to update statistics on each reward
    - Implement `calculateStatistics(player)` to compute all stats
    - _Requirements: 12.1-12.6_
  
  - [ ]* 9.2 Write property test for statistics accumulation
    - **Property 6: Referee Count Accuracy**
    - **Property 24: Statistics Accumulation**
    - **Validates: Requirements 2.5, 12.1, 12.2, 12.3_

- [ ] 10. Implement SimulationEngine
  - [ ] 10.1 Create `utils/simulationEngine.js` with simulation logic
    - Implement `createSimulatedReferee(referrer)` to generate fake referees
    - Implement `simulateActivity(referee, timeElapsed)` to simulate progression
    - Implement `updateSimulatedReferees(player)` to update all simulated referees
    - _Requirements: 10.1-10.5_
  
  - [ ]* 10.2 Write property test for simulated referee creation
    - **Property 21: Simulated Referee Creation**
    - **Validates: Requirements 10.2, 10.4**
  
  - [ ]* 10.3 Write property test for simulated rewards
    - **Property 22: Simulated Referee Rewards**
    - **Validates: Requirements 10.3, 10.5**

- [ ] 11. Checkpoint - Ensure all backend logic is complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement UI components - Referral Code Display
  - [ ] 12.1 Create `components/Referral/ReferralCodeDisplay.jsx`
    - Display referral code prominently
    - Add copy-to-clipboard button with feedback
    - Style according to game UI theme
    - _Requirements: 1.3, 9.1_
  
  - [ ]* 12.2 Write property test for UI code display
    - **Property 17: UI Code Display**
    - **Validates: Requirements 1.3, 9.1**

- [ ] 13. Implement UI components - Tier Progress
  - [ ] 13.1 Create `components/Referral/TierProgress.jsx`
    - Display current tier with icon/badge
    - Show progress bar to next tier
    - Display requirements for next tier
    - _Requirements: 9.2_
  
  - [ ]* 13.2 Write property test for UI tier display
    - **Property 18: UI Tier Display**
    - **Validates: Requirements 9.2**

- [ ] 14. Implement UI components - Referee List
  - [ ] 14.1 Create `components/Referral/RefereeList.jsx`
    - Display table/list of all referees
    - Show name, level, join date, activity status for each
    - Add sorting options (by level, by date)
    - Handle empty state
    - _Requirements: 2.4, 9.3_
  
  - [ ]* 14.2 Write property test for UI referee display
    - **Property 16: UI Referee Display Completeness**
    - **Validates: Requirements 2.4, 9.3**

- [ ] 15. Implement UI components - Statistics Panel
  - [ ] 15.1 Create `components/Referral/StatisticsPanel.jsx`
    - Display total referees count
    - Show total exp and gold earned from referrals
    - Display combined referee level
    - Show milestone rewards received count
    - _Requirements: 9.4, 12.6_
  
  - [ ]* 15.2 Write property test for UI statistics display
    - **Property 19: UI Statistics Display**
    - **Validates: Requirements 9.4**

- [ ] 16. Implement UI components - Achievements List
  - [ ] 16.1 Create `components/Referral/AchievementsList.jsx`
    - Display grid of achievement cards
    - Show locked/unlocked status
    - Display progress for locked achievements
    - Show rewards for each achievement
    - _Requirements: 9.5_
  
  - [ ]* 16.2 Write property test for UI achievement display
    - **Property 20: UI Achievement Display**
    - **Validates: Requirements 9.5**

- [ ] 17. Implement main Referral Panel
  - [ ] 17.1 Create `components/Referral/ReferralPanel.jsx`
    - Compose all sub-components (code, tier, referees, stats, achievements)
    - Add tab navigation if needed
    - Handle loading states
    - _Requirements: 9.1-9.6_
  
  - [ ]* 17.2 Write integration tests for full panel
    - Test that all sections render with various data states
    - Test user interactions (copy code, sort referees)
    - _Requirements: 9.1-9.6_

- [ ] 18. Integrate with Friends System
  - [ ] 18.1 Add Referral tab to Friends screen
    - Modify existing Friends UI to include "Recruitment" tab
    - Wire up ReferralPanel component
    - Ensure referee auto-add to friends list works
    - _Requirements: 8.1-8.5_
  
  - [ ]* 18.2 Write property test for friends list integration
    - **Property 15: Friends List Integration**
    - **Validates: Requirements 8.2**

- [ ] 19. Implement referee registration flow
  - [ ] 19.1 Add referral code input to player registration/creation
    - Add input field for referral code during new player setup
    - Validate code on submission
    - Link referee to referrer if code is valid
    - Show appropriate error messages
    - _Requirements: 1.5, 3.1_
  
  - [ ]* 19.2 Write unit tests for registration flow
    - Test valid code acceptance
    - Test invalid code rejection
    - Test self-referral prevention
    - Test already-referred prevention

- [ ] 20. Wire up activity event listeners
  - [ ] 20.1 Connect referral system to game events
    - Listen for referee level-up events and trigger milestone checks
    - Listen for referee exp/gold gains and grant activity bonuses
    - Listen for referee quest completions and grant bonuses
    - Listen for referee dungeon completions and grant bonuses
    - Ensure only active referees trigger bonuses
    - _Requirements: 2.3, 3.2-3.5, 4.1-4.5_
  
  - [ ]* 20.2 Write property test for active referee filtering
    - **Property 10: Active Referee Filtering**
    - **Validates: Requirements 4.5**

- [ ] 21. Implement tier promotion checks
  - [ ] 21.1 Add tier promotion evaluation
    - Check for tier promotions after each referee addition
    - Check for tier promotions after referee level changes
    - Grant tier rewards when promoted
    - Update bonus rates for new tier
    - _Requirements: 5.3-5.7, 6.1-6.5_

- [ ] 22. Implement achievement checks
  - [ ] 22.1 Add achievement evaluation triggers
    - Check achievements after each referee addition
    - Check achievements after referee level changes
    - Unlock and grant rewards for newly met achievements
    - _Requirements: 7.1-7.7_

- [ ] 23. Add simulation mode controls
  - [ ] 23.1 Create simulation UI controls
    - Add "Add Simulated Referee" button to ReferralPanel
    - Add simulation toggle in settings/debug menu
    - Wire up SimulationEngine to UI controls
    - _Requirements: 10.1-10.5_
  
  - [ ]* 23.2 Write unit tests for simulation controls
    - Test simulated referee creation from UI
    - Test simulation toggle functionality

- [ ] 24. Checkpoint - Final integration testing
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Add error handling and edge cases
  - [ ] 25.1 Implement comprehensive error handling
    - Add try-catch blocks for all reward calculations
    - Handle invalid referral codes gracefully
    - Handle data corruption with defaults and logging
    - Add error messages for all failure cases
    - _Requirements: 11.5_
  
  - [ ]* 25.2 Write unit tests for error scenarios
    - Test invalid code handling
    - Test self-referral prevention
    - Test data corruption recovery
    - Test reward calculation errors

- [ ] 26. Polish and optimize
  - [ ] 26.1 Final polish
    - Add loading states to UI components
    - Optimize referee list rendering for large lists
    - Add animations for tier promotions and achievement unlocks
    - Ensure all UI text is clear and consistent
    - Add tooltips for complex features
  
  - [ ]* 26.2 Write performance tests
    - Test UI performance with 100+ referees
    - Test simulation performance with many simulated referees

- [ ] 27. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation throughout development
- The system integrates with existing Friends System and Player Object structure
- Simulation mode enables single-player testing without real multiplayer
