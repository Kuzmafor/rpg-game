# Design Document: Referral System

## Overview

The Referral System enables players to invite friends and earn rewards based on their activity and progression. The system consists of four main components: referral code management, referee tracking, a multi-tier progression system, and an achievement framework. The design integrates seamlessly with the existing Friends System and persists all data in the Player Object structure.

## Architecture

The system follows a modular architecture with clear separation of concerns:

```
ReferralSystem
├── ReferralCodeManager (code generation and validation)
├── RefereeTracker (tracking invited players and their activity)
├── TierManager (managing progression through referral tiers)
├── RewardCalculator (calculating and granting rewards)
├── AchievementManager (tracking and unlocking achievements)
├── SimulationEngine (simulating referees for single-player mode)
└── ReferralUI (user interface components)
```

### Integration Points

- **Friends System**: Automatic friend list updates when referees join
- **Player Object**: All referral data persisted in player save data
- **Experience/Gold Systems**: Bonus rewards applied through existing systems
- **Achievement System**: Referral achievements integrated with game achievements

## Components and Interfaces

### ReferralCodeManager

Handles generation and validation of unique referral codes.

```javascript
class ReferralCodeManager {
  /**
   * Generate a unique referral code for a player
   * @param {string} playerId - The player's unique identifier
   * @returns {string} A unique 8-character alphanumeric code
   */
  generateCode(playerId) {
    // Generate code using playerId hash + random component
    // Format: XXXX-XXXX (8 chars with hyphen for readability)
  }

  /**
   * Validate if a referral code exists and is valid
   * @param {string} code - The referral code to validate
   * @returns {Object|null} Referrer player data or null if invalid
   */
  validateCode(code) {
    // Check if code exists in global code registry
    // Return referrer information if valid
  }

  /**
   * Link a new player to a referrer using a code
   * @param {string} code - The referral code
   * @param {Object} newPlayer - The new player object
   * @returns {boolean} Success status
   */
  linkReferee(code, newPlayer) {
    // Validate code
    // Add referee to referrer's list
    // Grant registration bonus
  }
}
```

### RefereeTracker

Tracks all invited players and their activity.

```javascript
class RefereeTracker {
  /**
   * Add a new referee to the referrer's list
   * @param {Object} referrer - The referrer player object
   * @param {Object} referee - The referee player object
   */
  addReferee(referrer, referee) {
    // Create referee record with ID, name, join date, level
    // Add to referrer's referee list
    // Update statistics
  }

  /**
   * Update referee information when their level changes
   * @param {Object} referrer - The referrer player object
   * @param {string} refereeId - The referee's ID
   * @param {number} newLevel - The referee's new level
   */
  updateRefereeLevel(referrer, refereeId, newLevel) {
    // Find referee in list
    // Update level
    // Check for milestone rewards
  }

  /**
   * Check if a referee is currently active
   * @param {Object} referee - The referee record
   * @returns {boolean} True if active (logged in within 30 days)
   */
  isActive(referee) {
    // Check last login timestamp
    // Return true if within 30 days
  }

  /**
   * Get all active referees for a referrer
   * @param {Object} referrer - The referrer player object
   * @returns {Array} List of active referee records
   */
  getActiveReferees(referrer) {
    // Filter referee list by activity status
  }

  /**
   * Calculate combined level of all referees
   * @param {Object} referrer - The referrer player object
   * @returns {number} Sum of all referee levels
   */
  getCombinedLevel(referrer) {
    // Sum levels from all referees
  }
}
```

### TierManager

Manages progression through the five-tier referral program.

```javascript
const TIERS = {
  BRONZE: {
    name: 'Bronze',
    requiredReferees: 0,
    requiredCombinedLevel: 0,
    expBonus: 0.05,
    goldBonus: 0.03,
    rewards: null
  },
  SILVER: {
    name: 'Silver',
    requiredReferees: 5,
    requiredCombinedLevel: 25,
    expBonus: 0.07,
    goldBonus: 0.05,
    rewards: { gold: 1000, exp: 500 }
  },
  GOLD: {
    name: 'Gold',
    requiredReferees: 10,
    requiredCombinedLevel: 100,
    expBonus: 0.10,
    goldBonus: 0.07,
    rewards: { gold: 5000, exp: 2500 }
  },
  PLATINUM: {
    name: 'Platinum',
    requiredReferees: 25,
    requiredCombinedLevel: 500,
    expBonus: 0.15,
    goldBonus: 0.10,
    rewards: { gold: 15000, exp: 10000, title: 'Master Recruiter' }
  },
  DIAMOND: {
    name: 'Diamond',
    requiredReferees: 50,
    requiredCombinedLevel: 2000,
    expBonus: 0.20,
    goldBonus: 0.15,
    rewards: { 
      gold: 50000, 
      exp: 30000, 
      title: 'Legendary Recruiter',
      cosmetic: 'legendary_recruiter_badge'
    }
  }
};

class TierManager {
  /**
   * Calculate the appropriate tier for a player
   * @param {number} refereeCount - Number of referees
   * @param {number} combinedLevel - Combined level of all referees
   * @returns {string} Tier name (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND)
   */
  calculateTier(refereeCount, combinedLevel) {
    // Check requirements from highest to lowest tier
    // Return appropriate tier name
  }

  /**
   * Check if player should be promoted and grant rewards
   * @param {Object} player - The player object
   * @returns {Object|null} Promotion info or null if no promotion
   */
  checkPromotion(player) {
    // Calculate current tier based on stats
    // Compare with stored tier
    // If promoted, grant tier rewards
    // Return promotion details
  }

  /**
   * Get bonus percentages for current tier
   * @param {string} tierName - The tier name
   * @returns {Object} {expBonus, goldBonus}
   */
  getBonusRates(tierName) {
    // Return bonus rates for tier
  }

  /**
   * Get progress to next tier
   * @param {Object} player - The player object
   * @returns {Object} Progress information
   */
  getProgressToNextTier(player) {
    // Calculate current tier
    // Get next tier requirements
    // Calculate progress percentage
  }
}
```

### RewardCalculator

Calculates and grants all types of rewards.

```javascript
const MILESTONE_REWARDS = {
  5: { gold: 200, exp: 100 },
  10: { gold: 500, exp: 300 },
  20: { gold: 1000, exp: 750 },
  50: { gold: 5000, exp: 3000 }
};

const REGISTRATION_BONUS = { gold: 100, exp: 50 };
const QUEST_BONUS = { exp: 50 };
const DUNGEON_BONUS = { gold: 100 };

class RewardCalculator {
  /**
   * Grant registration bonus to referrer
   * @param {Object} referrer - The referrer player object
   */
  grantRegistrationBonus(referrer) {
    // Add gold and exp from REGISTRATION_BONUS
    // Record bonus in statistics
  }

  /**
   * Check and grant milestone rewards when referee levels up
   * @param {Object} referrer - The referrer player object
   * @param {string} refereeId - The referee's ID
   * @param {number} newLevel - The referee's new level
   */
  checkMilestoneRewards(referrer, refereeId, newLevel) {
    // Check if newLevel matches any milestone (5, 10, 20, 50)
    // Check if milestone already granted for this referee
    // Grant rewards if applicable
    // Mark milestone as granted
  }

  /**
   * Calculate and grant activity bonus
   * @param {Object} referrer - The referrer player object
   * @param {string} activityType - 'exp', 'gold', 'quest', or 'dungeon'
   * @param {number} amount - Amount of exp/gold (for exp/gold types)
   */
  grantActivityBonus(referrer, activityType, amount = 0) {
    // Get current tier bonus rates
    // Calculate bonus based on activity type
    // Grant bonus to referrer
    // Update statistics
  }

  /**
   * Grant tier promotion rewards
   * @param {Object} player - The player object
   * @param {string} newTier - The new tier name
   */
  grantTierRewards(player, newTier) {
    // Get rewards for tier
    // Grant gold, exp, title, cosmetics
    // Mark tier rewards as granted
  }
}
```

### AchievementManager

Manages referral-specific achievements.

```javascript
const ACHIEVEMENTS = {
  FIRST_FRIEND: {
    id: 'first_friend',
    name: 'First Friend',
    description: 'Recruit your first friend',
    requirement: { referees: 1 },
    reward: { gold: 100 }
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Recruit 5 friends',
    requirement: { referees: 5 },
    reward: { gold: 500 }
  },
  COMMUNITY_BUILDER: {
    id: 'community_builder',
    name: 'Community Builder',
    description: 'Recruit 10 friends',
    requirement: { referees: 10 },
    reward: { gold: 1500 }
  },
  GUILD_MASTER: {
    id: 'guild_master',
    name: 'Guild Master',
    description: 'Recruit 25 friends',
    requirement: { referees: 25 },
    reward: { gold: 5000 }
  },
  LEGEND_OF_RECRUITMENT: {
    id: 'legend_of_recruitment',
    name: 'Legend of Recruitment',
    description: 'Recruit 50 friends',
    requirement: { referees: 50 },
    reward: { gold: 15000 }
  },
  REALM_AMBASSADOR: {
    id: 'realm_ambassador',
    name: 'Realm Ambassador',
    description: 'Recruit 100 friends',
    requirement: { referees: 100 },
    reward: { gold: 50000, title: 'Realm Ambassador' }
  },
  MENTOR_OF_CHAMPIONS: {
    id: 'mentor_of_champions',
    name: 'Mentor of Champions',
    description: 'Your referees reach combined level 500',
    requirement: { combinedLevel: 500 },
    reward: { gold: 10000 }
  }
};

class AchievementManager {
  /**
   * Check and unlock achievements based on current stats
   * @param {Object} player - The player object
   */
  checkAchievements(player) {
    // Get current referee count and combined level
    // Check each achievement requirement
    // Unlock and grant rewards for newly met achievements
  }

  /**
   * Check if an achievement is unlocked
   * @param {Object} player - The player object
   * @param {string} achievementId - The achievement ID
   * @returns {boolean} True if unlocked
   */
  isUnlocked(player, achievementId) {
    // Check player's unlocked achievements list
  }

  /**
   * Unlock an achievement and grant rewards
   * @param {Object} player - The player object
   * @param {string} achievementId - The achievement ID
   */
  unlockAchievement(player, achievementId) {
    // Add to unlocked list
    // Grant rewards
    // Trigger UI notification
  }
}
```

### SimulationEngine

Simulates referee behavior for single-player testing.

```javascript
class SimulationEngine {
  /**
   * Create a simulated referee
   * @param {Object} referrer - The referrer player object
   * @returns {Object} Simulated referee data
   */
  createSimulatedReferee(referrer) {
    // Generate random name
    // Assign random starting level (1-10)
    // Create activity pattern (active/inactive probability)
    // Add to referrer's referee list
  }

  /**
   * Simulate referee activity over time
   * @param {Object} referee - The referee record
   * @param {number} timeElapsed - Time elapsed in game ticks
   */
  simulateActivity(referee, timeElapsed) {
    // Based on activity pattern, simulate:
    // - Level progression
    // - Quest completions
    // - Dungeon runs
    // - Gold/exp gains
  }

  /**
   * Update all simulated referees for a player
   * @param {Object} player - The player object
   */
  updateSimulatedReferees(player) {
    // For each simulated referee
    // Simulate activity since last update
    // Trigger appropriate reward calculations
  }
}
```

### ReferralUI

User interface components for the referral system.

```jsx
// Main referral panel component
const ReferralPanel = ({ player }) => {
  return (
    <div className="referral-panel">
      <ReferralCodeDisplay code={player.referralCode} />
      <TierProgress player={player} />
      <RefereeList referees={player.referees} />
      <StatisticsPanel stats={player.referralStats} />
      <AchievementsList achievements={player.referralAchievements} />
    </div>
  );
};

// Component to display and copy referral code
const ReferralCodeDisplay = ({ code }) => {
  // Display code prominently
  // Include copy-to-clipboard button
};

// Component showing current tier and progress
const TierProgress = ({ player }) => {
  // Display current tier with icon
  // Show progress bar to next tier
  // Display next tier requirements
};

// Component listing all referees
const RefereeList = ({ referees }) => {
  // Display table/list of referees
  // Show name, level, join date, activity status
  // Sort by level or join date
};

// Component showing referral statistics
const StatisticsPanel = ({ stats }) => {
  // Display total referees
  // Show total bonuses earned (gold/exp)
  // Display combined referee level
  // Show milestone rewards received
};

// Component displaying unlocked achievements
const AchievementsList = ({ achievements }) => {
  // Display grid of achievement cards
  // Show locked/unlocked status
  // Display progress for locked achievements
};
```

## Data Models

### Player Object Extensions

```javascript
player = {
  // ... existing player fields ...
  
  referral: {
    // Referral code for this player
    code: "ABCD-1234",
    
    // Current tier
    tier: "BRONZE",
    
    // Tiers that have granted rewards (prevent duplicates)
    tiersRewarded: ["BRONZE"],
    
    // List of referees
    referees: [
      {
        id: "player_123",
        name: "FriendName",
        joinDate: "2024-01-15T10:30:00Z",
        currentLevel: 15,
        isSimulated: false,
        lastActive: "2024-01-20T14:22:00Z",
        // Track which milestones have been rewarded
        milestonesGranted: [5, 10]
      }
    ],
    
    // Statistics
    stats: {
      totalReferees: 5,
      totalExpEarned: 2500,
      totalGoldEarned: 1800,
      totalMilestones: 8,
      combinedLevel: 75
    },
    
    // Unlocked achievements
    achievements: [
      "first_friend",
      "social_butterfly"
    ],
    
    // Simulation data (for single-player mode)
    simulation: {
      enabled: true,
      lastUpdate: "2024-01-20T14:22:00Z"
    }
  }
};
```

### Global Referral Code Registry

```javascript
// Stored separately to enable code lookups
referralCodeRegistry = {
  "ABCD-1234": "player_456",  // code -> playerId mapping
  "EFGH-5678": "player_789",
  // ...
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Referral Code Uniqueness

*For any* set of players, all generated referral codes should be unique (no two players should have the same code).

**Validates: Requirements 1.1, 1.2**

### Property 2: Referral Code Persistence

*For any* player with a referral code, saving and then loading the player data should preserve the exact same referral code.

**Validates: Requirements 1.4, 11.1, 11.4**

### Property 3: Referee Linking

*For any* valid referral code and new player, using the code during registration should add the new player to the referrer's referee list and grant the registration bonus.

**Validates: Requirements 1.5, 3.1**

### Property 4: Referee Data Completeness

*For any* referee added to a referrer's list, the referee record should contain all required fields: player ID, name, join date, and current level.

**Validates: Requirements 2.1, 2.2**

### Property 5: Referee Level Synchronization

*For any* referee whose level changes, the stored level in the referrer's referee list should be updated to match the new level.

**Validates: Requirements 2.3**

### Property 6: Referee Count Accuracy

*For any* referrer, the displayed total count of referees should equal the length of the referee list.

**Validates: Requirements 2.5, 12.1**

### Property 7: Milestone Reward Correctness

*For any* referee reaching a milestone level (5, 10, 20, or 50), the referrer should receive the exact rewards specified for that milestone, and only once per referee per milestone.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**

### Property 8: Activity Bonus Calculation

*For any* referee activity (experience gain or gold earn), the referrer should receive a bonus calculated as the exact percentage specified by their current tier (5-20% for exp, 3-15% for gold).

**Validates: Requirements 4.1, 4.2**

### Property 9: Quest and Dungeon Bonuses

*For any* quest completion by a referee, the referrer should receive exactly 50 experience; for any dungeon completion, the referrer should receive exactly 100 gold.

**Validates: Requirements 4.3, 4.4**

### Property 10: Active Referee Filtering

*For any* referee, activity bonuses should only be applied if the referee's last active timestamp is within 30 days of the current time.

**Validates: Requirements 4.5**

### Property 11: Tier Calculation Correctness

*For any* player with a given number of referees and combined level, the calculated tier should match the highest tier whose requirements are met.

**Validates: Requirements 5.3, 5.4, 5.5, 5.6**

### Property 12: Tier Persistence

*For any* player with a referral tier, saving and then loading the player data should preserve the exact same tier.

**Validates: Requirements 5.7**

### Property 13: Tier Promotion Rewards

*For any* player promoted to a new tier (Silver, Gold, Platinum, or Diamond), they should receive the exact rewards specified for that tier (gold, experience, titles, cosmetics, and bonus rate increases), and only once per tier.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

### Property 14: Achievement Unlocking

*For any* player whose referee count or combined level meets an achievement threshold (5, 10, 25, 50, 100 referees, or 500 combined level), the corresponding achievement should be unlocked and rewards granted exactly once.

**Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

### Property 15: Friends List Integration

*For any* referee added through the referral system, that referee should automatically appear in the referrer's friends list.

**Validates: Requirements 8.2**

### Property 16: UI Referee Display Completeness

*For any* referee in a referrer's list, the UI should display all required information: name, level, join date, and activity status.

**Validates: Requirements 2.4, 9.3**

### Property 17: UI Code Display

*For any* player viewing the referral UI, the rendered output should contain their referral code and a copy button.

**Validates: Requirements 1.3, 9.1**

### Property 18: UI Tier Display

*For any* player viewing the referral UI, the rendered output should contain their current tier and progress information toward the next tier.

**Validates: Requirements 9.2**

### Property 19: UI Statistics Display

*For any* player viewing the referral UI, the rendered output should contain all accumulated bonus totals (experience and gold from referee activity).

**Validates: Requirements 9.4**

### Property 20: UI Achievement Display

*For any* player viewing the referral UI, the rendered output should contain all unlocked referral achievements.

**Validates: Requirements 9.5**

### Property 21: Simulated Referee Creation

*For any* simulated referee created in simulation mode, the referee should have all required fields: random name, starting level, and activity pattern.

**Validates: Requirements 10.2, 10.4**

### Property 22: Simulated Referee Rewards

*For any* simulated referee activity (level up, quest, dungeon), the referrer should receive the same rewards as they would for a real referee performing the same activity.

**Validates: Requirements 10.3, 10.5**

### Property 23: Save/Load Round Trip

*For any* player with referral data (code, referee list, tier, stats, achievements), saving and then loading should produce equivalent referral data with all fields preserved.

**Validates: Requirements 11.2, 11.3, 11.4**

### Property 24: Statistics Accumulation

*For any* sequence of referee activities, the total experience and gold statistics should equal the sum of all individual bonuses granted.

**Validates: Requirements 12.2, 12.3**

### Property 25: Combined Level Calculation

*For any* referee list, the combined level should equal the sum of all individual referee levels.

**Validates: Requirements 12.5**

## Error Handling

### Invalid Referral Codes

- When a player enters an invalid or non-existent referral code, display error message: "Invalid referral code. Please check and try again."
- When a player tries to use their own referral code, display error: "You cannot use your own referral code."
- When a player tries to use a code after already being referred, display error: "You have already been referred by another player."

### Data Corruption

- When loading player data, validate referral structure
- If corruption detected:
  - Log error with details
  - Initialize with default values (Bronze tier, empty referee list, zero stats)
  - Notify player: "Referral data was reset due to corruption."

### Simulation Errors

- When simulation mode fails to create referee, log error and continue
- When simulation activity calculation fails, skip that update cycle
- Ensure simulation errors don't affect real referee data

### Reward Calculation Errors

- When bonus calculation produces invalid values (negative, NaN, Infinity):
  - Log error with context
  - Skip that specific reward
  - Continue with other rewards
- When milestone already granted, silently skip (not an error)

### UI Errors

- When referee data is missing fields, display placeholder values
- When tier calculation fails, default to Bronze
- When achievement data is corrupted, show only valid achievements

## Testing Strategy

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage.

### Unit Tests

Unit tests focus on specific examples, edge cases, and integration points:

- **Code Generation**: Test that codes are 8 characters, alphanumeric, properly formatted
- **Initial State**: Test that new players start with Bronze tier and empty referee list
- **Edge Cases**: Test behavior with 0 referees, maximum referees, corrupted data
- **Integration**: Test Friends System integration, UI rendering with various data states
- **Simulation**: Test simulated referee creation and activity generation

### Property-Based Tests

Property-based tests verify universal properties across all inputs using a PBT library (fast-check for JavaScript/React):

- **Configuration**: Each property test runs minimum 100 iterations
- **Tagging**: Each test tagged with format: `Feature: referral-system, Property {number}: {property_text}`
- **Coverage**: One property test per correctness property (25 total)

**Example Property Test Structure**:

```javascript
// Feature: referral-system, Property 1: Referral Code Uniqueness
test('all generated referral codes are unique', () => {
  fc.assert(
    fc.property(
      fc.array(fc.string(), { minLength: 2, maxLength: 100 }),
      (playerIds) => {
        const codes = playerIds.map(id => generateCode(id));
        const uniqueCodes = new Set(codes);
        return codes.length === uniqueCodes.size;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Goals

- All 25 correctness properties implemented as property tests
- Edge cases covered by unit tests
- Integration points validated
- UI components tested with various data states
- Simulation mode thoroughly tested

### Testing Tools

- **Jest**: Test runner and assertion library
- **React Testing Library**: UI component testing
- **fast-check**: Property-based testing library
- **Mock Data**: Generators for player objects, referee lists, activity events
