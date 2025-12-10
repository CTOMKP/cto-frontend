# CTO Frontend - Challenges and Resolutions

This document serves as the single source of truth for all challenges encountered during development and how they were resolved. New challenges should be added to this document instead of creating separate files.

---

## Table of Contents
1. [Multiple Wallet Creation Issue](#multiple-wallet-creation-issue)
2. [Future Challenges](#future-challenges)

---

## Multiple Wallet Creation Issue

### Problem Description
When users authenticated with a new email address, the application was creating multiple Ethereum and Aptos/Movement wallets instead of creating just one of each. The issue manifested as:
- Multiple wallet creation attempts running in parallel
- "Creating your wallet" screen hanging indefinitely
- Multiple wallets appearing in both the user dashboard and Privy dashboard
- Console logs showing the same sync/wallet creation flow executing 3-4 times simultaneously

### Root Cause Analysis

#### Key Differences Between Test Frontend and Main Frontend

1. **Component Lifecycle**:
   - **Test Frontend (React)**: After successful authentication and backend sync, the component navigates away (`navigate(ROUTES.profile)`), which **unmounts the component**. This prevents the `useEffect` from re-running.
   - **Main Frontend (Next.js)**: The `usePrivyAuth` hook stays mounted throughout the session. When Privy updates the `user` object (e.g., after wallet creation), the `useEffect` dependency array triggers a re-run.

2. **Dependency Array Issue**:
   - Initially used `[authenticated, user]` as dependencies
   - When Privy creates a wallet, it updates the `user` object (specifically `user.linkedAccounts`), causing the entire `user` object reference to change
   - This triggered the `useEffect` to run again, even though the user ID hadn't changed

3. **Race Condition**:
   - Multiple `useEffect` instances could start executing in parallel before any of them could set the guard flags (`isProcessingRef`, `syncedUserIdRef`)
   - Each instance would see the guards as "not set" and proceed with wallet creation
   - This happened because React can batch multiple effect runs, and they all execute their synchronous checks before any async operations complete

### Solution Implemented

#### 1. Module-Level Set for Global Locking
```typescript
// Module-level Set to track processing user IDs across ALL hook instances
// This prevents multiple parallel runs even if hook is instantiated multiple times
const processingUserIds = new Set<string>();
```

**Why this works**: A module-level variable is shared across ALL instances of the hook, not just within a single component instance. This provides true global locking.

#### 2. Synchronous Check Before Async Operations
```typescript
// CRITICAL: Check module-level Set FIRST to prevent parallel runs across ALL hook instances
if (processingUserIds.has(userId)) {
  console.log('⏭️ User ID already being processed (module-level check), skipping');
  return;
}

// Add to Set IMMEDIATELY (synchronously) BEFORE any async operations
processingUserIds.add(userId);
```

**Why this works**: The check and add operations happen synchronously, before any async code runs. This prevents multiple instances from all passing the check simultaneously.

#### 3. Dependency Array Optimization
```typescript
// Changed from [authenticated, user] to [authenticated, user?.id]
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [authenticated, user?.id]);
```

**Why this works**: Only re-runs when the user ID actually changes (new user logs in), not when the `user` object reference changes due to wallet additions.

#### 4. localStorage Token Check
```typescript
// Check if token already exists for this user
const existingToken = localStorage.getItem('cto_auth_token');
const existingUserId = localStorage.getItem('cto_user_id');
if (existingToken && existingUserId === userId) {
  // Token exists = we've already completed sync
  syncedUserIdRef.current = userId;
  hasSyncedRef.current = true;
  setIsAuthenticated(true);
  return;
}
```

**Why this works**: Mimics the test frontend's behavior of "stopping" after successful authentication by checking if we've already completed the flow.

#### 5. Cleanup in Finally Block
```typescript
} finally {
  setIsSyncing(false);
  isProcessingRef.current = false;
  // Remove from module-level Set to allow future runs for this user (if needed)
  processingUserIds.delete(userId);
  console.log('✅ isSyncing set to false');
}
```

**Why this works**: Ensures the lock is released even if an error occurs, preventing the user from being permanently locked out.

### Files Modified
- `main-cto-frontend/src/hooks/usePrivyAuth.ts`
  - Added module-level `processingUserIds` Set
  - Changed dependency array from `[authenticated, user]` to `[authenticated, user?.id]`
  - Added synchronous module-level Set check before async operations
  - Added cleanup in finally block to remove userId from Set

- `main-cto-frontend/src/app/profile/page.tsx`
  - Added `deduplicateWallets` helper function to filter duplicate wallets by address
  - Modified rendering logic to conditionally show Movement Wallet section only if not already in main list

### Key Learnings

1. **Module-Level State for Global Locks**: When dealing with race conditions across multiple component instances, use module-level variables (not component-level refs) for true global locking.

2. **Synchronous Guards Before Async**: All guard checks and lock acquisitions must happen synchronously, before any `await` statements. Otherwise, multiple instances can all pass the guards simultaneously.

3. **Dependency Array Precision**: Use specific properties (e.g., `user?.id`) instead of entire objects (e.g., `user`) in dependency arrays to prevent unnecessary re-runs when object references change but the meaningful data hasn't.

4. **Component Lifecycle Matters**: The difference between a component that unmounts (test frontend) vs. a hook that stays mounted (main frontend) requires different strategies for preventing re-execution.

5. **localStorage as State Indicator**: Use localStorage to track completion state, not just for storing data. This provides a persistent way to know if a flow has already completed.

### Testing Checklist
- [x] New user authentication creates exactly one Ethereum wallet
- [x] New user authentication creates exactly one Aptos/Movement wallet
- [x] "Creating your wallet" screen doesn't hang
- [x] Profile page displays each wallet only once
- [x] Multiple browser tabs don't create duplicate wallets
- [x] Re-authentication with existing user doesn't create new wallets

### Related Commits
- `9966d92` - CRITICAL FIX: Use module-level Set to prevent parallel effect runs across ALL hook instances
- `b90fec6` - Fix duplicate wallet display on profile page
- `5957389` - CRITICAL FIX: Use user?.id in dependency array instead of user

---

## Future Challenges

<!-- Add new challenges below this line following the same format -->

---

## Document Structure Template

When adding new challenges, use this structure:

```markdown
## [Challenge Name]

### Problem Description
[Clear description of the issue]

### Root Cause Analysis
[Detailed explanation of why the problem occurred]

### Solution Implemented
[Step-by-step explanation of the fix]

### Files Modified
[List of files changed]

### Key Learnings
[Important insights gained]

### Testing Checklist
[Items to verify the fix works]

### Related Commits
[Git commit hashes]
```

---

*Last Updated: December 9, 2025*

