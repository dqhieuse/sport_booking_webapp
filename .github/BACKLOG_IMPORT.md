# 📋 Sport Booking WebApp - Complete Backlog Import Guide

**Generated:** 2026-06-04  
**Total Issues:** 185  
**Total Story Points:** 456  
**Sprints:** 0-8 (Foundation through Release)

---

## 📊 BACKLOG STRUCTURE

### **EPICS (8 items - 0pts)**
| ID | Title | Parent | Status |
|---|---|---|---|
| SCRUM-5 | Foundation | - | To Do |
| SCRUM-6 | Public Browsing | - | To Do |
| SCRUM-7 | Auth | - | To Do |
| SCRUM-8 | Vendor Setup | - | To Do |
| SCRUM-9 | Booking | - | To Do |
| SCRUM-10 | Payment | - | To Do |
| SCRUM-11 | Admin | - | To Do |
| SCRUM-12 | UX | - | To Do |
| SCRUM-13 | Release | - | To Do |

---

## 🔄 SPRINT 3 CURRENT STATUS (Active Sprint)

### **IN PROGRESS (4 Stories - 31pts)**
```
├─ PB-015: Implement venue and court image APIs (8pts) [Backend] 🔴
├─ PB-016: Implement court time slot configuration APIs (5pts) [Backend] 🔴
├─ PB-017: Build vendor venue/court/image/slot UI (13pts) [Frontend] 🔴
└─ SB-062: Implement image delete and set primary APIs (5pts) [Backend] 🔴
```

### **READY/TO DO (6 tasks - 18pts)**
```
├─ SB-063: Test image ordering transaction (3pts) [Test] 🟡
├─ SB-064: Implement global time slot list (2pts) [Backend] 🟡
├─ SB-065: Implement get own court time slots API (2pts) [Backend] 🟡
├─ SB-066: Implement update own court time slots API (3pts) [Backend] 🟡
├─ SB-069: Build vendor image gallery UI (5pts) [Frontend] 🟡
└─ SB-070: Build vendor court time slot configuration UI (3pts) [Frontend] 🟡
```

### **DONE (64 tasks - Complete Sprint 3)**
- ✅ SB-001 through SB-061 (backend/frontend foundation)
- ✅ PB-001 through PB-014 (initial features)
- ✅ All Sprint 0-2 completions

---

## 🚀 QUICK START: Manual Import Instructions

### **Step 1: Create Epics First**

Go to your GitHub Project and create 8 Epic issues:

```
[Epic] Foundation - Sprint 0 initialization
[Epic] Public Browsing - Guest features
[Epic] Auth - Authentication & Registration
[Epic] Vendor Setup - Vendor management
[Epic] Booking - Booking system
[Epic] Payment - Payment integration
[Epic] Admin - Admin dashboard
[Epic] UX - Polish & responsive design
[Epic] Release - Production deployment
```

**Labels:** `epic`, `sprint-X`

---

### **Step 2: Import Sprint 3 Issues (Priority)**

#### **2.1 IN PROGRESS Stories** (Create these FIRST)

**Issue 1: PB-015**
```
Title: [Sprint 3][P0][8pts] PB-015: Implement venue and court image APIs
Status: In Progress
Type: Feature
Labels: enhancement, sprint-3, priority-must, backend, status-in-progress
Assignee: dqhieuse
Story Points: 8

Description:
## 📌 Overview
Design and implement all backend APIs for venue & court images management: 
upload, delete, set primary, reordering, and transactional handling.

## 🎯 Acceptance Criteria
- [ ] sortOrder and primary image rules are transactional
- [ ] API supports all CRUD operations for images
- [ ] Atomic changes and validations
- [ ] Integration tests pass

## 📚 Related
Blocks: SB-062, SB-069
Parent: Vendor Setup Epic
```

**Issue 2: PB-016**
```
Title: [Sprint 3][P0][5pts] PB-016: Implement court time slot configuration APIs
Status: In Progress
Type: Feature
Labels: enhancement, sprint-3, priority-must, backend, status-in-progress
Assignee: dqhieuse
Story Points: 5

Description:
## 📌 Overview
Implement backend APIs to configure time slots for courts. Vendors set, 
update, enable/disable available time slots per court with permission checks.

## 🎯 Acceptance Criteria
- [ ] Vendor can enable/disable slots for own courts
- [ ] Only authorized vendors can edit their slots
- [ ] Permission checks and full API coverage
- [ ] Automated tests pass

## 📚 Related
Blocks: SB-070, PB-017
Parent: Vendor Setup Epic
```

**Issue 3: PB-017**
```
Title: [Sprint 3][P0][13pts] PB-017: Build vendor venue/court/image/slot UI
Status: In Progress
Type: Feature
Labels: enhancement, sprint-3, priority-must, frontend, status-in-progress
Assignee: dqhieuse
Story Points: 13

Description:
## 📌 Overview
Build comprehensive UI for vendors to manage venues, courts, images, and time slots. 
Integrate with all backend APIs. Demo-ready by end of sprint.

## 🎯 Acceptance Criteria
- [ ] Vendor can prepare a bookable court from UI
- [ ] UI integrated with image and slot APIs
- [ ] Full CRUD for venue/court/image/slot
- [ ] Works on desktop and mobile
- [ ] Sprint 3 demo ready

## 📚 Related
Blocked By: SB-062, SB-066
Parent: Vendor Setup Epic
```

**Issue 4: SB-062**
```
Title: [Sprint 3][P0][5pts] SB-062: Implement image delete and set primary APIs
Status: In Progress
Type: Feature (Subtask)
Labels: enhancement, sprint-3, priority-must, backend, status-in-progress
Assignee: dqhieuse
Story Points: 5

Description:
## 📌 Overview
Implement image delete and set primary APIs for venues and courts with 
transactional rules. Ensure safe deletion, validation, and atomic sort order updates.

## 🎯 Acceptance Criteria
- [ ] sortOrder and primary image rules are transactional
- [ ] Cannot set primary if no images exist
- [ ] Validation and audit log for image changes
- [ ] Automated tests pass (verified by SB-063)

## 📚 Related
Blocks: SB-069
Parent: PB-015 Implement venue and court image APIs
```

---

#### **2.2 READY Tasks** (Unblock after in-progress deps)

**Issue 5: SB-063**
```
Title: [Sprint 3][P0][3pts] SB-063: Test image ordering transaction
Status: Ready
Type: Test
Labels: test, sprint-3, priority-must, backend, status-ready
Assignee: dqhieuse
Story Points: 3

Blocked By: SB-062
Validates: PB-015

Description:
Test transactional logic for image sortOrder and primary image setting. 
Ensure atomic operations in DB and backend cover edge cases & concurrency.
```

**Issues 6-10: SB-064, SB-065, SB-066, SB-069, SB-070**
*(Follow same format - see template below)*

---

## 📋 SPRINT 3 COMPLETE TASK LIST

### **Backend Tasks (In Progress - 18pts)**
```
PB-015: Image APIs (8pts)
├─ SB-060: Venue image upload ✅ DONE
├─ SB-061: Court image upload ✅ DONE
└─ SB-062: Image delete/primary (5pts) 🔴 IN PROGRESS

PB-016: Slot Config APIs (5pts)
├─ SB-064: Global time slot list (2pts) 🟡 READY
├─ SB-065: Get own court slots (2pts) 🟡 READY
└─ SB-066: Update court slots (3pts) 🟡 READY
```

### **Frontend Tasks (In Progress - 18pts)**
```
PB-017: Vendor UI (13pts)
├─ SB-067: Venue management UI 🟡 READY
├─ SB-068: Court management UI 🟡 READY
├─ SB-069: Image gallery UI (5pts) 🟡 READY
└─ SB-070: Slot config UI (3pts) 🟡 READY
```

### **Test Tasks (Ready - 3pts)**
```
SB-063: Image transaction tests (3pts) 🟡 READY
```

---

## 🔗 DEPENDENCY MAP (Sprint 3)

```
SB-062 ─→ SB-063 (test validation)
SB-062 ─→ SB-069 (UI depends on API)

SB-064 ─→ SB-065 ─→ SB-066
SB-064 ─→ PB-016 (story blocker)
SB-066 ─→ SB-070 (UI depends on API)

PB-015 ─→ PB-017 (story dependency)
PB-016 ─→ PB-017 (story dependency)
```

---

## 📦 ISSUE TEMPLATE (Copy-Paste Ready)

```markdown
## 📌 Task Overview
[2-3 sentence summary of what needs to be done]

## 🎯 Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 📊 Metadata
- Story Points: X
- Type: Feature/Bug/Test
- Sprint: Sprint X
- Status: In Progress/Ready/To Do
- Priority: P0/P1/P2
- Owner: @dqhieuse

## 🔗 Related Issues
- **Blocks:** [Issue list]
- **Blocked By:** [Issue list]
- **Parent:** [Epic/Story]
- **Related:** [Issue list]

## 📝 Original Jira Data
- Jira ID: SB-XXX / SCRUM-XXX
- Created: [date]
- Updated: [date]
```

---

## 🎯 IMPORT CHECKLIST

- [ ] Create 8 Epics
- [ ] Create 4 In Progress stories (PB-015, PB-016, PB-017, SB-062)
- [ ] Create 6 Ready tasks (SB-063-070)
- [ ] Link all Blocks/Blocked By relationships
- [ ] Create Sprint 3 milestone
- [ ] Add labels: sprint-3, priority-must, backend/frontend, status-*
- [ ] Assign all to dqhieuse
- [ ] Create Kanban board views (By Sprint, By Type, By Status)
- [ ] Setup automation (Move to In Review when PR created)

---

## 📈 FULL BACKLOG STATS

| Sprint | Done | In Progress | To Do | Total Pts |
|--------|------|-------------|-------|-----------|
| Sprint 0 | 8 | 0 | 0 | 21 |
| Sprint 1 | 16 | 0 | 0 | 47 |
| Sprint 2 | 18 | 0 | 0 | 44 |
| Sprint 3 | 40 | 4 | 6 | 49 |
| Sprint 4 | 0 | 0 | 20 | 72 |
| Sprint 5 | 0 | 0 | 13 | 39 |
| Sprint 6 | 0 | 0 | 13 | 39 |
| Sprint 7 | 0 | 0 | 13 | 39 |
| Sprint 8 | 0 | 0 | 13 | 39 |
| Backlog | 0 | 0 | 0 | 97 |
| **TOTAL** | **82** | **4** | **91** | **456** |

---

## 🚀 NEXT STEPS

1. ✅ Create all Epics
2. ✅ Import Sprint 3 (Priority)
3. ⏳ Import Sprint 4-8 backlog
4. ⏳ Setup board automation
5. ⏳ Configure reports & milestones
6. ⏳ Share with team

**Happy backlog management! 🎯**
