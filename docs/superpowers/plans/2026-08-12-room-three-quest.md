# Phòng 3 Paris 1919 Quest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implement the Room 3 “Paris 1919 – Khôi phục Bản Yêu sách” quest on the existing room, including the four-sided TV interaction, eight collectible fragments, desk puzzle, personal progress, and global unlock of Door 04.

**Architecture:** Keep the current room layout and multiplayer flow. Store Room 3 content and coordinates in a dedicated config plus pure state helpers, expose progress through MuseumContext, render the new desk/exhibits in a Room 3-only 3D component, and use a Socket.IO event to open door-room4 for every connected player after one player completes the puzzle.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, React Three Fiber, drei, Three.js, Socket.IO, Vitest, existing Tailwind/CSS UI.

## Global Constraints

- Only modify Room 3 (gallery-ceramics) and the Room 3 completion event that opens door-room4.
- Preserve admin door controls, teleport behavior, existing rooms, existing mini-games, and the four-sided TV pillar.
- Use the exact Vietnamese copy from the approved spec.
- Keep progress idempotent: no duplicate fragment collection and no repeated completion side effects.
- Store personal progress by normalized nickname; do not reuse legacy collectedCeramics state.
- Production code must be preceded by a failing test for every new pure behavior.
- Use apply_patch for file edits.

---

### Task 1: Add Room 3 quest data and pure state helpers

**Files:**
- Create: src/lib/roomThreeQuest.ts
- Create: src/lib/roomThreeQuestState.ts
- Test: src/lib/roomThreeQuest.test.ts
- Test: src/lib/roomThreeQuestState.test.ts

**Interfaces:**
- ROOM_THREE_FRAGMENTS: readonly RoomThreeFragment[]
- Message constants for TV, desk, missing fragments, puzzle feedback, success, and HUD.
- getCollectedFragmentCount(ids)
- isFragmentCollected(ids, id)
- collectFragment(ids, id)
- isCorrectFragmentOrder(idsInSlots)
- getRoomThreeMissionText(videoViewed, count, completed)

- [ ] **Step 1: Write failing config tests**

~~~ts
it('defines eight fragments in reconstruction order', () => {
  expect(ROOM_THREE_FRAGMENTS).toHaveLength(8);
  expect(ROOM_THREE_FRAGMENTS.map((f) => f.correctOrder))
    .toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(new Set(ROOM_THREE_FRAGMENTS.map((f) => f.id)).size).toBe(8);
});

it('maps every fragment to a source location and 3D position', () => {
  for (const fragment of ROOM_THREE_FRAGMENTS) {
    expect(fragment.sourceLocation.length).toBeGreaterThan(0);
    expect(fragment.position).toHaveLength(3);
  }
});
~~~

- [ ] **Step 2: Run focused tests and confirm the expected missing-module failure**

Run: npm.cmd test -- src/lib/roomThreeQuest.test.ts src/lib/roomThreeQuestState.test.ts --run

Expected: FAIL because the new modules do not exist.

- [ ] **Step 3: Add the exact eight fragment records**

Each record must include id, title, description, sourceLocation, correctOrder, collected, and its local position. Use the eight user-provided descriptions and exact titles:

1. Bình đẳng trước pháp luật
2. Tự do báo chí, ngôn luận
3. Tự do lập hội, hội họp
4. Tự do cư trú, đi lại
5. Cải cách pháp lý ở Đông Dương
6. Thả tù chính trị
7. Đại diện trong nghị viện Pháp
8. Thay sắc lệnh bằng luật pháp

- [ ] **Step 4: Write failing state-helper tests**

~~~ts
it('does not collect the same fragment twice', () => {
  expect(collectFragment(['legal-equality'], 'legal-equality'))
    .toEqual(['legal-equality']);
});

it('accepts only the required eight-fragment order', () => {
  expect(isCorrectFragmentOrder([
    'legal-equality', 'press-freedom', 'assembly-freedom', 'movement-freedom',
    'indochina-reform', 'political-prisoners', 'versailles-representation', 'legal-code',
  ])).toBe(true);
});
~~~

- [ ] **Step 5: Run the tests to verify RED**

Run: npm.cmd test -- src/lib/roomThreeQuestState.test.ts --run

Expected: FAIL with the intended missing helper behavior.

- [ ] **Step 6: Implement minimal helpers and rerun focused tests**

The order validator compares fragment IDs by correctOrder. The collection helper returns a new array and preserves the original order.

Run: npm.cmd test -- src/lib/roomThreeQuest.test.ts src/lib/roomThreeQuestState.test.ts --run

Expected: PASS.

- [ ] **Step 7: Commit**

~~~bash
git add src/lib/roomThreeQuest.ts src/lib/roomThreeQuestState.ts src/lib/roomThreeQuest.test.ts src/lib/roomThreeQuestState.test.ts
git commit -m "feat: add room three quest data and state helpers"
~~~

### Task 2: Add per-player Room 3 progress to MuseumContext

**Files:**
- Modify: src/context/MuseumContext.tsx
- Modify: src/lib/roomThreeQuestState.ts
- Test: src/lib/roomThreeQuestState.test.ts

**Interfaces:**
- roomThreeVideoViewed: boolean
- roomThreeCollectedFragments: string[]
- roomThreeCompleted: boolean
- markRoomThreeVideoViewed()
- collectRoomThreeFragment(id)
- completeRoomThreeQuest()

- [ ] **Step 1: Write failing persistence tests**

~~~ts
it('normalizes duplicate IDs when restoring progress', () => {
  expect(readRoomThreeProgress('{"videoViewed":true,"collectedFragments":["legal-equality","legal-equality"],"completed":false}'))
    .toEqual({ videoViewed: true, collectedFragments: ['legal-equality'], completed: false });
});

it('returns empty progress for malformed JSON', () => {
  expect(readRoomThreeProgress('{bad json'))
    .toEqual({ videoViewed: false, collectedFragments: [], completed: false });
});
~~~

- [ ] **Step 2: Run focused tests and confirm RED**

Run: npm.cmd test -- src/lib/roomThreeQuestState.test.ts --run

Expected: FAIL because progress normalization is not implemented.

- [ ] **Step 3: Implement context persistence**

Use localStorage key roomThreeQuestProgress:<normalizedNickname>. Load only the current nickname record. Save after video view, collection, and completion. Completion emits room3:quest-completed only on the first transition to completed.

- [ ] **Step 4: Run all tests**

Run: npm.cmd test -- --run

Expected: all existing and new tests pass.

- [ ] **Step 5: Commit**

~~~bash
git add src/context/MuseumContext.tsx src/lib/roomThreeQuestState.ts src/lib/roomThreeQuestState.test.ts
git commit -m "feat: persist room three quest progress"
~~~

### Task 3: Replace old Room 3 exhibits and add the historical 3D set

**Files:**
- Modify: src/lib/db/gallery-ceramics.json
- Modify: src/components/3d/rooms/RoomThree.tsx
- Create: src/components/3d/rooms/RoomThreeQuestSet.tsx

**Interfaces:**
- RoomThreeQuestSet receives isVisible and renders only Room 3 desk, frames, map, archive, and decorative props.
- Positions are local to the Room 3 group; interaction code adds the existing Room 3 offset.

- [ ] **Step 1: Remove old Room 3 exhibit records**

Set only the exhibits array in gallery-ceramics.json to empty. Preserve gallery metadata, dimensions, colors, and doors.

- [ ] **Step 2: Add the procedural historical set**

Create eight framed/labelled display points and a wooden desk opposite the TV. The desk must show the torn document, typewriter, ink pen, envelope, red seal, old newspapers, yellow lamp, and loose papers. Do not depend on the old procedural-arcade exhibit.

- [ ] **Step 3: Mount the set from RoomThree only**

Keep VideoPillar, spotlights, rails, velvet ropes, room dimensions, and existing doors unchanged. Remove stale comments/exceptions that refer to the arcade machine.

- [ ] **Step 4: Validate the visual slice**

Run: npm.cmd run build

Expected: build succeeds.

- [ ] **Step 5: Commit**

~~~bash
git add src/lib/db/gallery-ceramics.json src/components/3d/rooms/RoomThree.tsx src/components/3d/rooms/RoomThreeQuestSet.tsx
git commit -m "feat: replace room three arcade with historical desk"
~~~

### Task 4: Implement TV interaction and video follow-up

**Files:**
- Modify: src/components/3d/VideoPillar.tsx
- Create: src/components/ui/RoomThreeVideoModal.tsx
- Modify: src/app/lobby/page.tsx
- Modify: src/lib/roomThreeQuestState.ts
- Test: src/lib/roomThreeQuestState.test.ts

**Interfaces:**
- RoomThreeVideoModal props: open, onClose, onViewed.
- Room 3 interaction callback reports video, fragment, or desk.

- [ ] **Step 1: Write a failing video completion test**

~~~ts
it('marks video viewed after close or ended playback', () => {
  expect(getRoomThreeVideoCompletionState('closed')).toEqual({ viewed: true });
  expect(getRoomThreeVideoCompletionState('ended')).toEqual({ viewed: true });
});
~~~

- [ ] **Step 2: Run the focused test and verify RED**

Run: npm.cmd test -- src/lib/roomThreeQuestState.test.ts --run

Expected: FAIL because the helper is missing.

- [ ] **Step 3: Implement the modal and interaction bridge**

Stop automatic playback on proximity. Keep the four TV faces. The lobby player opens the modal on E within the TV radius. Attempt unmuted playback, catch autoplay rejection, show Bật tiếng, and call onViewed on ended or close.

- [ ] **Step 4: Run focused tests and build**

Run: npm.cmd test -- src/lib/roomThreeQuestState.test.ts --run

Expected: PASS.

Run: npm.cmd run build

Expected: PASS.

- [ ] **Step 5: Commit**

~~~bash
git add src/components/3d/VideoPillar.tsx src/components/ui/RoomThreeVideoModal.tsx src/app/lobby/page.tsx src/lib/roomThreeQuestState.ts src/lib/roomThreeQuestState.test.ts
git commit -m "feat: add room three video interaction"
~~~

### Task 5: Add proximity prompts, fragment collection, and HUD

**Files:**
- Modify: src/app/lobby/page.tsx
- Create: src/components/ui/RoomThreeExhibitModal.tsx
- Create: src/components/ui/RoomThreeQuestHud.tsx
- Modify: src/components/3d/rooms/RoomThreeQuestSet.tsx
- Modify: src/lib/roomThreeQuestState.ts
- Test: src/lib/roomThreeQuestState.test.ts

**Interfaces:**
- RoomThreeInteractionKind = video | fragment | desk.
- RoomThreeInteraction includes kind and optional fragment id.
- RoomThreeExhibitModal receives a fragment and onCollect.
- RoomThreeQuestHud receives room, progress, and interaction prompt.

- [ ] **Step 1: Write failing nearest-interaction tests**

~~~ts
it('selects the nearest uncollected fragment within its radius', () => {
  const nearest = findNearestRoomThreeInteraction(
    { x: 0, z: 108 },
    ROOM_THREE_INTERACTION_POINTS,
    ['press-freedom'],
  );
  expect(nearest?.kind).toBe('fragment');
  expect(nearest?.id).not.toBe('press-freedom');
});

it('never offers a collected fragment again', () => {
  expect(findNearestRoomThreeInteraction(
    { x: -10, z: 108 },
    ROOM_THREE_INTERACTION_POINTS,
    ['legal-equality'],
  )?.id).not.toBe('legal-equality');
});
~~~

- [ ] **Step 2: Run focused tests and verify RED**

Run: npm.cmd test -- src/lib/roomThreeQuestState.test.ts --run

Expected: FAIL because nearest-interaction helpers are missing.

- [ ] **Step 3: Implement nearest-target calculation and E handling**

Use global coordinates consistent with current gallery-ceramics bounds and ROOM_OFFSETS. Ignore this interaction layer while another modal, transition, or existing mini-game is active. E opens the video, fragment description, or desk flow.

- [ ] **Step 4: Add the HUD and exhibit modal**

Show only in Room 3:

- Nhiệm vụ: Tìm 8 mảnh yêu sách và khôi phục văn kiện.
- Mảnh yêu sách: X/8.
- After eight pieces: Hãy đến bàn làm việc để ghép lại Bản Yêu sách.
- After completion: Hoàn thành: Bản Yêu sách của nhân dân An Nam đã được khôi phục.

- [ ] **Step 5: Browser-check duplicate protection**

Approach one display, press E, collect once, press E again, and confirm the same fragment is not offered a second time.

- [ ] **Step 6: Run tests/build and commit**

Run: npm.cmd test -- --run

Expected: all tests pass.

Run: npm.cmd run build

Expected: build succeeds.

~~~bash
git add src/app/lobby/page.tsx src/components/ui/RoomThreeExhibitModal.tsx src/components/ui/RoomThreeQuestHud.tsx src/components/3d/rooms/RoomThreeQuestSet.tsx src/lib/roomThreeQuestState.ts src/lib/roomThreeQuestState.test.ts
git commit -m "feat: add room three fragment interactions"
~~~

### Task 6: Implement the eight-piece desk puzzle

**Files:**
- Create: src/components/ui/RoomThreeQuestModal.tsx
- Modify: src/app/lobby/page.tsx
- Modify: src/context/MuseumContext.tsx
- Modify: src/lib/roomThreeQuestState.ts
- Test: src/lib/roomThreeQuestState.test.ts

**Interfaces:**
- RoomThreeQuestModal props: open, fragmentIds, completed, onClose, onComplete.

- [ ] **Step 1: Write failing puzzle-order tests**

~~~ts
it('returns success for the required order', () => {
  expect(evaluateRoomThreePuzzle([
    'legal-equality', 'press-freedom', 'assembly-freedom', 'movement-freedom',
    'indochina-reform', 'political-prisoners', 'versailles-representation', 'legal-code',
  ])).toEqual({ complete: true, feedback: 'correct' });
});

it('returns incorrect feedback without completing the quest', () => {
  expect(evaluateRoomThreePuzzle([
    'press-freedom', 'legal-equality', 'assembly-freedom', 'movement-freedom',
    'indochina-reform', 'political-prisoners', 'versailles-representation', 'legal-code',
  ])).toEqual({ complete: false, feedback: 'incorrect' });
});
~~~

- [ ] **Step 2: Run focused tests and verify RED**

Run: npm.cmd test -- src/lib/roomThreeQuestState.test.ts --run

Expected: FAIL because puzzle evaluation is missing.

- [ ] **Step 3: Implement puzzle evaluation and modal UI**

Use drag-and-drop plus click-to-swap, show eight numbered slots, exact feedback messages, and disable completion once roomThreeCompleted is true. On success call completeRoomThreeQuest and show the red stamp animation and approved completion copy.

- [ ] **Step 4: Connect the desk prompt**

Open the puzzle only at 8/8. Close without clearing progress. Lock player movement while the modal is open.

- [ ] **Step 5: Run tests/build and commit**

Run: npm.cmd test -- --run

Expected: all tests pass.

Run: npm.cmd run build

Expected: build succeeds.

~~~bash
git add src/components/ui/RoomThreeQuestModal.tsx src/app/lobby/page.tsx src/context/MuseumContext.tsx src/lib/roomThreeQuestState.ts src/lib/roomThreeQuestState.test.ts
git commit -m "feat: add room three reconstruction puzzle"
~~~

### Task 7: Open Door 04 globally after completion

**Files:**
- Modify: ws-server.js
- Create: src/lib/roomThreeDoorUnlock.ts
- Test: src/lib/roomThreeDoorUnlock.test.ts

**Interfaces:**
- unlockRoomThreeNextDoor(doorStates) returns the updated door-room4 state and an opened flag.

- [ ] **Step 1: Write failing door-transition test**

~~~ts
it('opens Door 04 toward gallery-market-economy only once', () => {
  const first = unlockRoomThreeNextDoor({});
  expect(first).toEqual({
    opened: true,
    door: { isOpen: true, targetRoom: 'gallery-market-economy' },
  });

  const second = unlockRoomThreeNextDoor({ 'door-room4': first.door });
  expect(second.opened).toBe(false);
  expect(second.door).toEqual(first.door);
});
~~~

- [ ] **Step 2: Run focused test and verify RED**

Run: npm.cmd test -- src/lib/roomThreeDoorUnlock.test.ts --run

Expected: FAIL because the transition helper is missing.

- [ ] **Step 3: Implement the server handler**

Add socket event room3:quest-completed. If Door 04 is closed, set it open and broadcast door-opened plus door-states. If already open, emit current door-states to the sender without duplicating the global open event. Do not modify admin handlers.

- [ ] **Step 4: Run tests and a real Socket.IO smoke test**

Run: npm.cmd test -- src/lib/roomThreeDoorUnlock.test.ts --run

Expected: PASS.

Connect two clients, emit room3:quest-completed from one, and verify both receive door-room4 open.

- [ ] **Step 5: Commit**

~~~bash
git add ws-server.js src/lib/roomThreeDoorUnlock.ts src/lib/roomThreeDoorUnlock.test.ts
git commit -m "feat: unlock room three next door globally"
~~~

### Task 8: Fix exact narrative copy and run acceptance verification

**Files:**
- Modify: src/lib/roomThreeNarrative.ts
- Modify: src/components/ui/RoomWelcomeModal.tsx
- Modify: src/app/lobby/page.tsx only for final Room 3 text wiring
- Modify: src/lib/roomThreeNarrative.test.ts

- [ ] **Step 1: Add failing exact-copy assertion**

~~~ts
it('uses the approved Room 3 quote without encoding corruption', () => {
  expect(ROOM_THREE_WELCOME.quote)
    .toBe('“Một dân tộc muốn cất lên tiếng nói của mình.”');
});
~~~

- [ ] **Step 2: Run focused test and verify RED if the quote is corrupted**

Run: npm.cmd test -- src/lib/roomThreeNarrative.test.ts --run

Expected: FAIL if the current source does not contain the exact Unicode string.

- [ ] **Step 3: Replace only corrupted Room 3 copy**

Keep the approved room name, Paris 1919 period, mission, and steps. Do not alter other room narrative data.

- [ ] **Step 4: Run full verification**

Run: npm.cmd test -- --run

Expected: all test files pass with zero failures.

Run: npm.cmd run build

Expected: Next.js production build succeeds.

- [ ] **Step 5: Browser acceptance checks**

With Next and WebSocket servers running:

1. Enter Room 3 and confirm the welcome popup has the exact quote.
2. Approach the four-sided TV, press E, verify video, sound fallback, close/end follow-up, and video state.
3. Visit all eight displays, press E, read each description, collect each fragment once, and verify X/8.
4. Approach the desk before 8/8 and verify the missing-fragment message.
5. At 8/8 open the puzzle, test incorrect and correct placements, then complete all eight.
6. Verify completion copy, red stamp, completed HUD, and Door 04 opening in two browser clients.
7. Verify an admin door control still renders and works.

- [ ] **Step 6: Check final diff and commit**

~~~bash
git status --short
git diff --check
git add src/lib/roomThreeNarrative.ts src/components/ui/RoomWelcomeModal.tsx src/app/lobby/page.tsx src/lib/roomThreeNarrative.test.ts
git commit -m "fix: finalize room three paris 1919 narrative"
~~~

Existing untracked runtime log files remain unadded.
