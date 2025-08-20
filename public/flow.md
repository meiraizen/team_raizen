# Team Raizen – FULL Chat + Auth System Reference

Version: 1.0  
Last Updated: (Update when saving)  
Status: Internal – Proprietary

---

## Table of Contents
1. [Document Purpose](#1-document-purpose)  
2. [Executive Abstract (Plain)](#2-executive-abstract-plain)  
3. [Glossary (Plain)](#3-glossary-plain)  
4. [High-Level Architecture](#4-high-level-architecture)  
5. [Layered Breakdown](#5-layered-breakdown)  
6. [Data & Schema Model](#6-data--schema-model)  
7. [Environment & Configuration](#7-environment--configuration)  
8. [Message Lifecycle (State Machine)](#8-message-lifecycle-state-machine)  
9. [Sequence Diagrams](#9-sequence-diagrams)  
10. [Core Modules (Contracts & Internals)](#10-core-modules-contracts--internals)  
11. [Detailed Flows](#11-detailed-flows-send--receive--retry--presence)  
12. [Authentication & Session Management](#12-authentication--session-management)  
13. [Logout All Devices](#13-logout-all-devices--mechanics--guarantees)  
14. [Polling Fallback vs Realtime](#14-polling-fallback-vs-realtime)  
15. [Error Handling & Recovery Matrix](#15-error-handling--recovery-matrix)  
16. [Performance Analysis & Optimization](#16-performance-analysis--optimization)  
17. [Security & Privacy Model](#17-security--privacy-model)  
18. [Edge Cases & Invariants](#18-edge-cases--invariants)  
19. [Testing Strategy & Catalogue](#19-testing-strategy--test-case-catalogue)  
20. [Operational Runbook](#20-operational-runbook--troubleshooting)  
21. [Extension / Roadmap Backlog](#21-extension--roadmap-backlog)  
22. [Change Impact Guidelines](#22-change-impact-guidelines)  
23. [FAQ (Plain)](#23-faq-plain)  
24. [Appendix: Pseudocode](#24-appendix-pseudocode)  
25. [Appendix: ASCII Diagrams Only](#25-appendix-ascii-diagrams-only)  
26. [Appendix: Future Schema Migration (client_message_id)](#26-appendix-future-schema-migration-client_message_id)  
27. [License / Ownership Notes](#27-license--ownership-notes)  
28. [Export (PDF / DOCX)](#28-export-pdf--docx)

---

## 1. Document Purpose
Single authoritative guide for Team Raizen internal Chat + Authentication (OTP + Session + Logout-All) system.

Audience: junior developers, non‑developers (plain sections), future maintainers, auditors.

Motto: Explain WHAT, HOW, and WHY.

---

## 2. Executive Abstract (Plain)
The system authenticates users via a one-time email code, enables direct messaging with optimistic UI updates, realtime confirmation, presence (online users), retry on failure, session expiry, and “Logout All Devices” invalidation across tabs/devices.

---

## 3. Glossary (Plain)

| Term                  | Meaning                                             |
|-----------------------|-----------------------------------------------------|
| OTP                   | One-Time Password (6‑digit emailed code)            |
| Session               | Authenticated time window after OTP validation      |
| Optimistic Message    | Shown locally before server confirmation            |
| Realtime Subscription | Live channel pushing inserts/presence               |
| Presence              | Indicates who is currently online (active tab)      |
| Broadcast Channel     | Channel used to propagate logout-all                |
| Polling               | Periodic fetch to detect missed updates             |
| Status: sending       | Outbound message in-flight                          |
| Status: sent          | Outbound confirmed by server                        |
| Status: received      | Inbound from peer                                   |
| Status: error         | Outbound failed locally                             |

---

## 4. High-Level Architecture

```
+--------------------+        +------------------------------+
|     Browser UI     | <----> | Supabase (DB + Realtime +    |
| (React Components) |        | Presence + Channels)         |
+----------+---------+        +---------------+--------------+
           |                                   |
           v                                   v
+-----------------------+        +---------------------------+
| Hooks (useChat, etc.) |        | Messages Table / Channels |
| Auth Store (Zustand)  |        | Presence Channel          |
+-----------------------+        +---------------------------+
```

Purposes (Plain):
- UI: Render & capture user interaction
- Hooks: Data logic & side-effects
- Store: Session & OTP state
- Supabase: Persistence + realtime

---

## 5. Layered Breakdown

| Layer         | Files / Components                                      | Responsibility                  |
|---------------|---------------------------------------------------------|---------------------------------|
| Presentation  | ChatHeader.jsx, MessageList.jsx, MessageInput.jsx       | Render & interaction            |
| Container     | ChatPage.jsx                                            | Orchestrates hooks              |
| Logic Hooks   | useChat.js, usePresence.js, useResponsive.js            | Data, subscriptions             |
| Auth Store    | store/auth.jsx                                          | OTP flow, session, logout-all   |
| Data Helpers  | chat/supabaseClient.js                                  | Encapsulate DB & realtime calls |
| Routing       | ProtectedRoute.jsx                                      | Auth gating                     |
| Assets/CSS    | (Styles)                                                | Appearance                      |


## 6. Data & Schema Model

### 6.1 Internal Message Object

| Field         | Type    | Description                                   |
|---------------|---------|-----------------------------------------------|
| id            | string  | Server UUID or temp id (tmp_<ts>)             |
| sender_email  | string  | Author                                        |
| receiver_email| string  | Recipient                                     |
| content       | string  | Plaintext body                                |
| created_at    | string  | ISO timestamp                                 |
| status        | enum    | sending / sent / received / error             |
| _optimistic?  | boolean | Present until reconciliation                  |
| errorMsg?     | string  | Error description on failure                  |

### 6.2 Database messages Table (Current)

| Column                     | Type        | Notes             |
|----------------------------|-------------|-------------------|
| id                         | uuid        | PK                |
| sender_email               | text        | Index recommended |
| receiver_email             | text        | Index recommended |
| content                    | text        |                   |
| created_at                 | timestamptz | DEFAULT now()     |
| (future) client_message_id | text        | For dedupe        |
| (future) read_at           | timestamptz | Read receipts     |

### 6.3 Session LocalStorage Keys

| Key                | Purpose                            |
|--------------------|------------------------------------|
| auth_user          | User identity (email, name)        |
| auth_session_expiry| Expiration timestamp (ms)          |
| auth_session_token | Random session token               |

---

## 7. Environment & Configuration (.env)

| Variable                 | Purpose                     |
|--------------------------|-----------------------------|
| VITE_SUPABASE_URL        | Supabase project URL        |
| VITE_SUPABASE_ANON_KEY   | Public anon key             |
| VITE_EMAILJS_SERVICE_ID  | EmailJS service id          |
| VITE_EMAILJS_TEMPLATE_ID | EmailJS template for OTP    |
| VITE_EMAILJS_USER_ID     | EmailJS public user key     |

Security: Apply RLS if sensitivity increases.

---

## 8. Message Lifecycle (State Machine)

```
Start → [sending] --(success)--> [sent]
           | \
           |  \--(failure)--> [error] --(retry)--> [sending]
Incoming peer message → [received]
```

Rules:
- received has no further transitions (until future read/delivered states).
- error only for outbound.

---

## 9. Sequence Diagrams

### 9.1 Sending (Happy Path)
```
User → Browser(useChat): type / send
Browser: optimistic append (sending)
Browser → Supabase: insert
Supabase → Browser (HTTP and/or Realtime): row
Browser: reconcile → status=sent
```

### 9.2 Receiving
```
Peer Device → Supabase
Supabase (Realtime) → Browser: INSERT
Browser: append status=received
```

### 9.3 Retry After Failure
```
User click retry → set sending → reinsert → success → sent
```

### 9.4 Polling Fallback
```
Timer → fetch recent → compare newest id → mismatch? → background reload
```

### 9.5 OTP Login
```
Enter email → generate OTP → EmailJS sends → user enters code → validate → create session
```

### 9.6 Logout All
```
Device A broadcast logout → Supabase channel → Device B/C receive → local logout
```

---

## 10. Core Modules (Contracts & Internals)

### 10.1 useChat(peer)
Returns: messages[], loading, refreshing, send(text), retry(tempId), messagesRef  
Internals: unsubRef, lastServerIdsRef.

### 10.2 usePresence()
Returns: onlineUsers[] (excluding self). Tracks presence channel sync.

### 10.3 supabaseClient.js
- createClient(url, anonKey)  
- insertMessage({ sender_email, receiver_email, content })  
- fetchConversation({ a, b, limit })  
- subscribeConversation({ a, b, onInsert })

### 10.4 useAuthStore
- login(email)
- verifyOtp(code)
- logout()
- logoutAllDevices()
- extendSession()
- Internal session watchdog + logout broadcast subscription.

---

## 11. Detailed Flows (Send / Receive / Retry / Presence)

### 11.1 Send
1. Validate preconditions.
2. Create optimistic temp message (status=sending).
3. Insert.
4. On success: replace → sent.
5. On failure: mark error.

### 11.2 Receive
1. Realtime insert event.
2. Duplicate guard (id check).
3. Match optimistic (if any) else append.
4. status=received when from peer.

### 11.3 Retry
1. Find error message.
2. Set sending.
3. Re-run insertion.
4. Success → sent; failure → error.

### 11.4 Presence
1. Join presence channel.
2. On sync enumerate users.
3. Exclude self.
4. Provide list to UI.

---

## 12. Authentication & Session Management

Phases A–H (Email allowlist → OTP gen/delivery → verify → session create → watchdog → logout types → optional extension).  
Session enforcement: focus + interval checks.

---

## 13. Logout All Devices – Mechanics & Guarantees

Channel: `logout_all:<email>`  
Event: `{ event: 'logout' }`  
Guarantees: Idempotent, race-safe, scope-limited.  
Offline fallback: expiration still cleans up.

---

## 14. Polling Fallback vs Realtime

Reason: resilience to websocket drop, sleep/resume gaps, missed frames.  
Flow: fetch top N, compare newest id → reload if divergence.  
Cost: low; benefit: reliability.

---

## 15. Error Handling & Recovery Matrix

| Scenario                | Detection       | User Visible | Recovery                  |
|-------------------------|-----------------|--------------|---------------------------|
| Insert network failure  | Promise reject  | Yes          | Retry                     |
| Missed realtime         | Poll mismatch   | No           | Background reload         |
| Optimistic duplicate    | Duplicate id    | No           | Ignore                    |
| Peer switch mid-send    | State change    | Possibly     | Stays with original peer  |
| Offline send            | Browser offline | Yes          | Retry later               |
| Presence flicker        | Sync gap        | Possible     | Next sync                 |
| localStorage blocked    | Exception       | Maybe        | Session ephemeral         |
| Session expiry          | Timer/focus     | Yes          | Re-login                  |
| Logout-all race         | Broadcast       | Yes          | Idempotent cleanup        |

---

## 16. Performance Analysis & Optimization

| Area            | Issue                | Optimization                       |
|-----------------|----------------------|------------------------------------|
| Large histories | Full reload          | Pagination / cursor                |
| Sorting         | Repeated full sort   | Ordered insert (binary search)     |
| Rendering       | Large DOM list       | Virtualization                     |
| Duplicate match | Heuristic            | client_message_id                  |
| Polling         | Fixed interval       | Adaptive backoff                   |

Memory: Keep recent messages; evict older if threshold exceeded.

---

## 17. Security & Privacy Model

| Aspect          | Current              | Notes                          |
|-----------------|----------------------|--------------------------------|
| Authentication  | Allowlist + OTP      | Suitable internal              |
| Authorization   | No RLS yet           | Add row-level policies         |
| Transport       | HTTPS                | Enforce TLS prod               |
| Session Storage | localStorage + expiry| Consider rotation              |
| Logout-All      | Broadcast invalidation| Immediate multi-tab           |
| Data Visibility | Any allowed user     | Add ACL if needed              |
| Encryption      | None                 | Consider E2E layer             |
| Injection       | React escapes        | Avoid dangerouslySetInnerHTML  |
| OTP brute force | Expiry + format      | Add attempt limits             |
| Audit trail     | None                 | Add logging table              |

---

## 18. Edge Cases & Invariants

Invariants:
1. messages[] sorted ascending by created_at.
2. Unique server id in list.
3. Outbound statuses limited to sending/sent/error.
4. Peer-authored only received.
5. _optimistic removed after reconciliation.
6. Session expiry always enforced.

Edge Cases:

| Case                       | Handling                        |
|----------------------------|---------------------------------|
| Duplicate text rapid send  | Distinct temp ids               |
| Realtime before HTTP       | Replacement logic               |
| Tab suspension             | Focus triggers sync             |
| Multi rapid retries        | Last insert wins                |
| Peer changed mid-send      | Historical correctness retained |
| Missing created_at         | Guard future schema changes     |

---

## 19. Testing Strategy & Test Case Catalogue

### 19.1 Unit (Mock Supabase)
- Initial empty load
- Initial with peer
- Optimistic send
- Send success replacement
- Send failure → error
- Retry success
- Realtime duplicate ignore
- Realtime received append
- Polling no change
- Polling detect change
- Logout-all broadcast

### 19.2 Integration
- Multi-tab logout-all
- Network throttle race
- Offline → retry

### 19.3 Non-Functional
- 500 message render performance
- Memory after long session

---

## 20. Operational Runbook & Troubleshooting

| Issue                | Checklist                                                     |
|----------------------|---------------------------------------------------------------|
| Messages not updating| Console errors, polling firing, reload, env keys, clock skew  |
| OTP not arriving     | EmailJS IDs, spam folder, log generation                      |
| Logout All failing   | Channel subscribed post-verify, WS frame inspection           |
| Presence incorrect   | Sync event fired, track after SUBSCRIBED                      |

---

## 21. Extension / Roadmap Backlog

| Priority | Feature             | Benefit                   |
|----------|---------------------|---------------------------|
| High     | client_message_id   | Perfect reconciliation    |
| High     | Pagination          | Scalability               |
| Medium   | Read receipts       | Clarity                   |
| Medium   | Delivered vs Sent   | Semantics                 |
| Medium   | Typing indicators   | UX richness               |
| Medium   | Encryption layer    | Privacy                   |
| Low      | Edit/delete         | Content correction        |
| Low      | Offline queue SW    | Offline-first             |
| Low      | Analytics dashboard | Metrics                   |
| Low      | Admin moderation    | Compliance                |
| Low      | Adaptive polling    | Reduced load              |

---

## 22. Change Impact Guidelines

| Change              | Considerations                                |
|---------------------|-----------------------------------------------|
| Add DB column       | Update fetch mapping                          |
| Change ordering     | Scroll + invariant review                     |
| Remove polling      | Strengthen realtime reliability               |
| Add E2E encryption  | Encrypt before insert, decrypt at render      |
| Increase fetch limit| Sorting perf, virtualization                  |
| Replace OTP provider| Abstract sending API                          |

---

## 23. FAQ (Plain)

| Q                         | A                               |
|---------------------------|---------------------------------|
| Why "sending" first?      | Optimistic UX                   |
| Why message error?        | Temporary network issue         |
| Sudden logout?            | Expiry or logout-all            |
| Older messages?           | Pagination planned              |
| Secure without passwords? | Yes internally; add factors     |

---

## 24. Appendix: Pseudocode

```pseudo
function send(text):
  if invalid prerequisites: return
  optimistic = makeTemp(text)
  messages.append(optimistic)
  try:
    row = insertMessage(...)
    replace(optimistic, row with status=sent)
  catch:
    optimistic.status = error

function onInsert(row):
  if idExists(row.id): return
  match = findOptimistic(row)
  if match: replace(match, row with status=sent)
  else: append(row with status = (row.sender==me ? sent : received))
  sortMessages()

function retry(tempId):
  m = findById(tempId) where status=error
  if !m: return
  m.status = sending
  re-run insertion

sessionExpiryCheck():
  if now > expiry: logout()

logoutAll():
  broadcast logout
  localLogout()
```

---

## 25. Appendix: ASCII Diagrams Only

### A) Component Interaction
```
ChatPage
  |-- useChat
  |-- usePresence
  |-- useResponsive
  |-- props →
       +-- ChatHeader (online state)
       +-- MessageList (messages)
       +-- MessageInput (send)
       +-- ContactList (peer select)
```

### B) Send State Machine
```
[sending] --success--> [sent]
[sending] --failure--> [error] --retry--> [sending]
(peer inbound) --> [received]
```

### C) Timing (Optimistic vs Realtime)
```
Time →
User:   type ---- send()
UI:           show(sending) -------- replace(sent)
Server:             insert → realtime event
Poll: (only if realtime missed)
```

---

## 26. Appendix: Future Schema Migration (client_message_id)

Plan:
1. Add nullable column.
2. Generate UUID client-side for each optimistic.
3. Include in inserts.
4. Reconcile by client_message_id first.
5. Backfill existing rows (remain null).
6. Remove content-based heuristic.

Benefits: deterministic matching, no collision risk.

---

## 27. License / Ownership Notes
Mei
---




================================================================================
DOCUMENT V2
================================================================================

Motto: “Explain WHAT it does, HOW it does it, and WHY it was designed that way.”

Sections (quick index):
1. Executive Abstract (Plain)
2. Glossary (Plain)
3. High-Level Architecture (Plain + Technical)
4. Layered Breakdown
5. Data & Schema Model
6. Environment & Configuration
7. Message Lifecycle (State Machine)
8. Sequence Diagrams (Multiple scenarios)
9. Core Modules (Contracts + Internals)
10. Detailed Flow: Sending / Receiving / Retry / Presence
11. Authentication & Session Management
12. Logout All Devices (Mechanics & Guarantees)
13. Polling Fallback vs Realtime
14. Error Handling & Recovery Matrix
15. Performance Analysis & Optimization Paths
16. Security & Privacy Model
17. Edge Cases & Invariants
18. Testing Strategy & Test Cases Catalogue
19. Operational Runbook & Troubleshooting
20. Extension / Roadmap Backlog
21. Change Impact Guidelines
22. FAQ (Plain)
23. Appendix: Pseudocode & Reference Snippets
24. Appendix: ASCII Diagrams Only
25. Appendix: Future Schema Migration (client_message_id)
26. License / Ownership Notes

================================================================================
1. EXECUTIVE ABSTRACT (PLAIN LANGUAGE)
================================================================================
The system lets approved team members log in with a one-time email code, chat with
each other instantly, and see who is online. Messages appear immediately when sent
(“optimistic”). The system then confirms them behind the scenes using a live
connection so they become official. If something fails (no internet), the message
shows an error and can be retried. Sessions automatically time out after several
hours. A “Logout All Devices” button instantly logs the user out everywhere.

================================================================================
2. GLOSSARY (PLAIN)
================================================================================
Term                  Meaning
--------------------  ----------------------------------------------------------
OTP                   One-Time Password (6-digit code emailed)
Session               The logged-in window of time after OTP verification
Optimistic Message    A message shown before the server confirms it
Realtime Subscription Live connection that pushes new messages as they happen
Presence              Who is currently online (active tab)
Broadcast Channel     A shared channel used to send a logout signal to every tab
Polling               Regular silent check for updates (“Anything new?”)
Status=“sending”      Message is in-flight
Status=“sent”         Your message confirmed by server
Status=“received”     Message from the other user
Status=“error”        Delivery failed locally

================================================================================
3. HIGH-LEVEL ARCHITECTURE
================================================================================
Top-Level View (Conceptual):

+--------------------------+         +-----------------------+
|        Browser UI        | <-----> |  Supabase Services    |
|  (React Components)      |         |  (DB + Realtime +     |
|                          |         |   Presence + Channels)|
+------------+-------------+         +-----------+-----------+
             |                                   |
             | Hooks (Logic)                     |
             v                                   v
+--------------------------+         +-----------------------+
| useChat / usePresence    |         | Messages Table        |
| Auth Store (Zustand)     |         | Realtime Channels     |
| Supabase Client Helpers  |         | Presence Channel      |
+--------------------------+         +-----------------------+

Layer Purposes (Plain):
- UI Components: Display things & capture user actions.
- Hooks: Hold logic, side-effects, data fetching.
- Store: Keeps authentication/session state.
- Supabase: Saves messages, handles live updates & presence.

================================================================================
4. LAYERED BREAKDOWN
================================================================================
Layer          Contents / Files                                       Responsibility
-------------- ------------------------------------------------------ ------------------------------------------
Presentation   ChatHeader.jsx, MessageList.jsx, MessageInput.jsx      Render & user interaction
Container      ChatPage.jsx                                           Orchestrates hooks & passes props
Logic Hooks    useChat.js, usePresence.js, useResponsive.js           Data state, subscriptions, environment logic
Auth Store     store/auth.jsx (useAuthStore)                          OTP flow, session expiry, logout-all
Data Helpers   chat/supabaseClient.js                                 Encapsulate DB & realtime API calls
Routing        ProtectedRoute.jsx                                     Gate access behind auth
Assets/CSS     (Styles)                                               Visual styling

WHY layering: Minimizes coupling; UI changes rarely modify data or auth logic.

================================================================================
5. DATA & SCHEMA MODEL
================================================================================
5.1 Message Object (Internal React State)
Field            Type       Description
---------------- ---------- ----------------------------------------------------
id               string     Server ID or temporary id (e.g. tmp_<timestamp>)
sender_email     string     Author
receiver_email   string     Recipient
content          string     Plaintext body
created_at       string     ISO timestamp
status           enum       'sending' | 'sent' | 'received' | 'error'
_optimistic      bool?      Present only before reconciliation
errorMsg         string?    Human-readable error on failure (optional)

5.2 Database Table (messages) (Inferred)
Column          Type          Notes
--------------- ------------- -----------------------------------------------
id              uuid/serial    PK
sender_email    text           Index recommended
receiver_email  text           Index recommended
content         text           
created_at      timestamptz    DEFAULT now()
(Future) client_message_id text Unique per client for perfect dedupe
(Future) read_at          timestamptz Read receipts

5.3 Auth Session Storage Keys (localStorage)
Key                      Purpose
-----------------------  -------------------------------------------------------
auth_user                Persist user identity (email, name)
auth_session_expiry      Numeric timestamp (ms)
auth_session_token       Random value for potential tab/session identity

================================================================================
6. ENVIRONMENT & CONFIGURATION (.env)
================================================================================
Variable                     Purpose
---------------------------  ---------------------------------------------------
VITE_SUPABASE_URL            Supabase project URL
VITE_SUPABASE_ANON_KEY       Public anon key (safe client usage)
VITE_EMAILJS_SERVICE_ID      EmailJS service identifier
VITE_EMAILJS_TEMPLATE_ID     EmailJS template for OTP email
VITE_EMAILJS_USER_ID         EmailJS public user key

Security Note: While anon key is "public", apply RLS if sensitive later.

================================================================================
7. MESSAGE LIFECYCLE (STATE MACHINE)
================================================================================
State Machine (Send Flow):

            +-----------+
    Start → | sending   | --(server success)--> sent
            +-----------+ --(server success via realtime)--> sent
                 | \
   (failure)     |  \
                 v   \
               error  (server insert lost? polling reload)
                 |
              (retry)
                 |
                 v
              sending (loop)
                 
Incoming (Peer) message enters directly as: received

Properties:
- No transition FROM received unless adding future read/delivered states.
- error only arises for outbound messages.

================================================================================
8. SEQUENCE DIAGRAMS (ASCII)
================================================================================
8.1 Sending a Message (Happy Path)
User         Browser(useChat)      Supabase (DB+Realtime)
 |  type msg       |                       |
 |--Enter/Send---->| create optimistic msg |
 |                 | store in state        |
 |                 |----insertMessage----->| write row
 |                 |<---insert response----| (optional early replace)
 |                 |<===Realtime INSERT====| push event
 |                 | reconcile/replace     |
 | sees "sent"     |                       |

8.2 Receiving a Message
Peer Device  Supabase Realtime       Your Browser
    |              |                     |
    |--insert----->|                     |
    |              |===INSERT event=====>|
    |              |   append message    |
    |              |   status=received   |

8.3 Retry After Failure
You        Browser            Supabase
 | send     | optimistic       |
 | (net fail) error status     |
 | click retry                 |
 |----------retry------------->|
 | optimistic->sending         |
 |-------reinsertMessage------>|
 |<-----ok / realtime----------|
 | status=sent                 |

8.4 Polling Fallback Detection
Timer Thread   Supabase       Browser State
     |             |             |
     |---fetch---->|             |
     |<--latest----|             |
     | compare lastId           |
     | if mismatch → reload     |

8.5 Login & OTP
User Browser        EmailJS            Mailbox
     | login email      |                 |
     |----requestOTP----> (sends email)   |
     |<--OTP sent notice--                |
     | enter OTP                         |
     | validate locally + start session  |

8.6 Logout All Devices
Device A         Supabase Channel      Device B/C
   | broadcast logout |                    |
   |----------------->|====logout event===>|
   | local logout     |                    |
   |                  | trigger logout     |

================================================================================
9. CORE MODULES (CONTRACTS & INTERNALS)
================================================================================
9.1 useChat(peer)
Returns:
  messages[]         ordered ascending
  loading            boolean (first load)
  refreshing         boolean (background reload)
  send(text)         optimistic send
  retry(tempId)      re-attempt failed
  messagesRef        ref for scrolling container

Key Internal References:
  unsubRef           holds realtime unsubscribe function
  lastServerIdsRef   tracks latest known server message for poll diffs

9.2 usePresence()
Returns:
  onlineUsers[] (array of emails of other users currently present)

Mechanics:
  - Join channel with presence config
  - On 'sync', compute presence state
  - Exclude current user

9.3 supabaseClient.js
Functions:
  createClient(url, anonKey)
  insertMessage({ sender_email, receiver_email, content })
  fetchConversation({ a, b, limit }) // pulls both directions
  subscribeConversation({ a, b, onInsert })

9.4 useAuthStore (Zustand)
Public Methods:
  login(email)       → Sends OTP (if allowed)
  verifyOtp(code)    → Validates OTP, sets session
  logout()           → Clears session (single device)
  logoutAllDevices() → Broadcast + local logout
  extendSession()    → (Available to refresh expiry)
  (internal watchers) session expiry interval, broadcast subscription

================================================================================
10. DETAILED FLOW: SEND / RECEIVE / RETRY / PRESENCE
================================================================================
10.1 Send Flow (Algorithm)
1. Validate prerequisites: user authenticated, peer selected, non-empty content.
2. Construct optimistic message (temp id).
3. Push to messages array: status='sending'.
4. Call insertMessage:
   - If success → replace optimistic with server row (status='sent').
   - Realtime event may double-confirm; duplicate guard ensures no duplication.
   - If failure → mark optimistic as status='error'.
5. UI shows each transitional status.

10.2 Receive Flow
1. Realtime system emits message row.
2. Check if message already present (id duplicate).
3. If matches an optimistic (rare for remote) → replace; else append.
4. Set status='received' if sender != current user.

10.3 Retry Flow
1. Identify message with id=tempId & status='error'.
2. Switch to 'sending'.
3. Re-invoke insertMessage.
4. Apply same success/failure logic.

10.4 Presence Flow
1. Each logged-in user tracks presence → announces join.
2. Central presence state enumerates all active keys (emails).
3. Hook filters out self; exposes others as “onlineUsers”.
4. UI marks selected contact “Online” if in list.

================================================================================
11. AUTHENTICATION & SESSION MANAGEMENT
================================================================================
Phases:
A. Email Input:
   - Validate against allowlist (ensures only known accounts).
   - If invalid → error message.
B. OTP Generation:
   - Random 6-digit code, stored in memory state (NOT persisted after verify).
   - OTP expiry time set (e.g., +2 minutes).
C. OTP Delivery:
   - EmailJS sends code.
D. OTP Verification:
   - Code must match, be unexpired, be 6 digits.
   - On success → create session:
       sessionExpiry = now + 5 hours
       sessionToken = random id
       store user + expiry + token in localStorage
       subscribe to logout_all:<email>
E. Session Watchdog:
   - Runs every minute + on window focus
   - If Date.now() > sessionExpiry → logout
F. Normal Logout:
   - Remove localStorage keys & unsubscribe channel.
G. Logout All:
   - Broadcast “logout” event to channel.
   - All devices invoke local logout.
H. Extend Session (if invoked):
   - Adds another fixed duration (unused automatically, but available).

================================================================================
12. LOGOUT ALL DEVICES – MECHANICS & GUARANTEES
================================================================================
Channel: logout_all:<user_email>
Event: broadcast { event: 'logout' }

Guarantees:
- Idempotent: multiple logout events safe.
- Race-safe: local cleanup stops double unsubscription errors.
- Scope-limited: only devices with matching email channel receive event.

Potential Failure:
- If offline, remote tab won’t receive broadcast; session expiry still eventually clears.

================================================================================
13. POLLING FALLBACK VS REALTIME
================================================================================
Why both?
- Realtime may drop during network instability.
- Browser sleep/resume can miss messages.
- Poll checks last N (5) recent messages to detect mismatch.

Decision Flow:
1. Poll fetch ← compare newest ID to lastServerIdsRef.
2. If different → trigger full background reload (limit=200).
3. If same → do nothing (cheap verification).

Costs:
- Light network overhead (small payload).
- High reliability; lowers manual refresh support burden.

================================================================================
14. ERROR HANDLING & RECOVERY MATRIX
================================================================================
Scenario                          Detection         User Visible?  Recovery Path
--------------------------------- ----------------- -------------- -----------------------------
Insert network failure            Promise reject    Yes (error)    Retry → re-insert
Realtime event missed             Poll mismatch     No             Background reload
Optimistic duplicate persisted    Duplicate id      No             Ignored automatically
Peer switch mid-send              Changed peer prop Possibly       Message stays with original peer
Lost connection (offline)         Browser offline   Yes (error)    Retry after reconnection
Presence flicker                  Sync gap          Possibly       Next sync corrects list
LocalStorage unavailable          Exception         Possibly silent Session ephemeral only
Session expiry during chat        Timer/focus check Yes (redirect) Re-login
Logout-all race                   Broadcast         Yes (redirect) Already cleaned idempotently

================================================================================
15. PERFORMANCE ANALYSIS & OPTIMIZATION
================================================================================
Current Complexity:
- Sorting on each realtime addition: O(n log n); small n → acceptable.
- Replace map operations: O(n) per send/confirm.
- Polling interval: 6s suggests low bandwidth cost.

Potential Bottlenecks & Fixes:
| Area             | Issue                        | Optimization |
|------------------|------------------------------|--------------|
| Large histories   | Frequent full loads (200)    | Pagination / cursor-based fetch (older vs recent) |
| Sorting           | Repeated sort on append      | Insert at index (binary search) |
| Rendering list    | Many DOM nodes               | Virtualized list (react-window) |
| Duplicate match   | Content-based heuristic only | Add client_message_id |
| Polling interval  | Static                       | Adaptive based on activity (backoff) |

Memory Footprint:
- Only active conversation kept; feasible for internal usage.
- Could evict older messages when > threshold (e.g., keep last 100).

================================================================================
16. SECURITY & PRIVACY MODEL
================================================================================
Aspect             Current Strategy                         Notes / Improvements
------------------ ---------------------------------------- ---------------------------
Authentication     Allowlist + OTP                          Simple; restrict user set
Transport          Supabase HTTPS                           Ensure production uses TLS
Authorization      Implicit (no per-row RLS shown)          Add RLS for row-level isolation
Session Storage    LocalStorage (expiry + token)            Consider rotation on critical actions
Logout-All         Broadcast invalidation                   Good for emergency revocation
Data Visibility    Any user can chat any allowed account    Add UI limit or conversation ACL if needed
Encryption         None (plaintext)                         Add optional E2E or server-side encryption
Injection Risk     React auto-escapes content               Keep avoiding dangerouslySetInnerHTML
Brute Force OTP    Expiry + format check                    Could add attempt counter / cooldown
Audit Trail        Not implemented                          Add message audit (metadata table)

================================================================================
17. EDGE CASES & INVARIANTS
================================================================================
Invariants (MUST hold):
1. messages[] always sorted ascending by created_at.
2. At most one message object with a given server id.
3. Only sending/sent/error statuses appear for messages authored by current user.
4. Only received status appears for messages authored by peer.
5. _optimistic flag not present after final reconciliation.
6. Session expiry enforced even if logout broadcast fails.

Edge Cases & Handling:
Edge Case                                Handling
---------------------------------------  ---------------------------------------------------------------
User sends identical text twice quickly  Both appear (distinct temp ids) – expected
Realtime arrives before HTTP resolves    Duplicate guard / replacement logic protects
Tab suspended for hours                  On focus: expiry check + polling eventually syncs
Retry pressed multiple times quickly     Eventually last insert wins; can debounce if needed
Concurrent peer changes mid-send         Message still valid historically (sender/receiver fixed)
Missing created_at (unexpected)          Sort may NaN – safe-guard later if schema changes

================================================================================
18. TESTING STRATEGY & TEST CASE CATALOGUE
================================================================================
18.1 Unit Tests (Mock Supabase)
Test Case                                Expected
---------------------------------------  --------------------------------------------------
Initial Load Empty Peer                  messages=[], loading=false
Initial Load With Peer                   loading→true→false, messages sorted
Optimistic Send                          messages includes sending temp item
Send Success Replacement                 temp replaced, status=sent
Send Failure                             status=error
Retry Success                            error→sending→sent
Realtime Duplicate Ignore                second insert ignored
Realtime Received Append                 new message appended with received
Polling No Change                        no reload triggered
Polling Detect Change                    triggers background reload
Logout All Broadcast                     state cleared locally

18.2 Integration (Manual / Cypress)
- Multi-tab login then logout all devices.
- Message race (send while network throttled).
- Offline/online simulation: disable network, send, retry after enabling.

18.3 Non-Functional
- Performance: 500 sequential messages (simulate) – measure render time.
- Memory snapshot after long session.

================================================================================
19. OPERATIONAL RUNBOOK & TROUBLESHOOTING
================================================================================
Issue: Messages not updating
Checklist:
 1. Open console – realtime errors?
 2. Does polling fetch (network tab) fire? If not, timer issue.
 3. Force reload page – if restored, transient WebSocket failure.
 4. Validate Supabase keys in .env correct.
 5. Check system clock skew (created_at ordering odd?).

Issue: OTP emails not arriving
- Verify EmailJS service ID & template ID.
- Check spam folder.
- Add logging for OTP generation failure catch.

Issue: Logout All not working
- Confirm broadcast channel subscription created after verifyOtp.
- Inspect network WS frames for event.

Issue: Presence wrong
- Confirm presence channel sync event fired.
- Ensure channel.track executed after SUBSCRIBED status.

================================================================================
20. EXTENSION / ROADMAP BACKLOG
================================================================================
Priority  Feature                          Benefit
--------  -------------------------------- -------------------------------------
High      client_message_id column         Perfect optimistic reconciliation
High      Pagination / “Load older”        Scalability for large histories
Medium    Read receipts (read_at)          Enhanced status clarity
Medium    Delivered vs Sent distinction    Better delivery semantics
Medium    Typing indicators                Richer user experience
Medium    Encryption layer                 Privacy for sensitive content
Low       Message edit/delete              Content correction
Low       Offline queue (service worker)   True offline-first usage
Low       Analytics dashboard              Usage metrics (vol, active users)
Low       Admin moderation tools           Compliance/Audit
Low       Adaptive poll interval           Reduce network load when idle

================================================================================
21. CHANGE IMPACT GUIDELINES
================================================================================
Change Type               Considerations
------------------------  ---------------------------------------------------------
Adding DB column          Update fetchConversation mapping
Changing message ordering Re-evaluate scroll logic & sort invariants
Removing polling          Ensure robust realtime; test sleep/wake scenarios
Adding E2E encryption     Wrap content before insert; decrypt at render
Increasing message limit  Optimize sorting, consider virtualization
Replacing OTP provider    Abstract email send call; keep OTP interface same

================================================================================
22. FAQ (PLAIN)
================================================================================
Q: Why do I see “sending” first?
A: That’s the optimistic placeholder so you don’t wait.

Q: Why might I see an error on a message?
A: Your network failed momentarily—retry to send again.

Q: Why am I suddenly logged out?
A: Session expired or you logged out elsewhere with “Logout All”.

Q: Can I get old messages farther back?
A: Not yet—pagination is on the roadmap.

Q: Is this secure without passwords?
A: Yes for internal usage, relying on email control; can add factors later.

================================================================================
23. APPENDIX: PSEUDOCODE
================================================================================
Send:
function send(text):
  if invalid prerequisites → return
  optimistic = createTempMessage(text)
  messages.append(optimistic)
  try:
    serverRow = insertMessage(text)
    replace optimistic with serverRow (status=sent)
  catch:
    mark optimistic.status = error

Realtime onInsert:
function onInsert(row):
  if row.id already in messages: return
  match = find optimistic by participants + content
  if match:
    replace match with row (status=sent)
  else:
    append row (status = sent or received)
  sort messages ascending

Retry:
function retry(tempId):
  errMsg = find message by id with status=error
  if not found: return
  set status= sending
  repeat insertion logic

Session Expiry Checker:
every minute or on focus:
  if Date.now() > sessionExpiry → logout()

Logout All:
function logoutAll():
  broadcast logout event
  local logout()

================================================================================
24. APPENDIX: ASCII DIAGRAMS ONLY
================================================================================
A) Component Interaction:
ChatPage
  |-- useChat
  |-- usePresence
  |-- useResponsive
  |-- passes props →
       +-- ChatHeader (online state)
       +-- MessageList (messages)
       +-- MessageInput (send)
       +-- ContactList (choose peer)

B) State Machine (Send):
[sending] -> (success) -> [sent]
[sending] -> (failure) -> [error] -> (retry) -> [sending]
(peer) -> [received]

C) Timing Diagram (Optimistic vs Realtime):
Time →
User:  type ---- send()
UI:          show(sending) ------------ replace(sent)
Server:              insert → realtime event →
Poll: (only used if realtime missed)

================================================================================
25. APPENDIX: FUTURE SCHEMA MIGRATION (client_message_id)
================================================================================
Migration Plan:
1. Add column client_message_id (text, nullable).
2. Generate UUID per optimistic message.
3. Include in insert.
4. Realtime reconciliation: match by client_message_id first.
5. Backfill existing rows (leave null).
6. Remove content-based optimistic match logic.

Benefits:
- Resolves risk of duplicate content collisions.
- Simplifies match function.

================================================================================
26. LICENSE / OWNERSHIP NOTES
================================================================================
Mei Raizen


============================================================
DOCUMENT V2 - Detailed 
============================================================


============================================================
SECTION 1. HIGH-LEVEL PURPOSE
============================================================
- The system lets a small team securely log in and chat in real time.
- Login uses a One-Time Password (OTP) sent to approved email addresses (no passwords stored).
- Chat messages appear instantly (even before the server confirms) for a “fast” feel.
- If a user chooses “Logout All Devices,” every browser/tab/session for that user logs out together.
- Sessions automatically expire after a fixed number of hours (currently 5).

============================================================
SECTION 2. KEY PARTS (PLAIN LANGUAGE)
============================================================
| Part | What It Is | Why It Exists |
|------|------------|---------------|
| `allowedAccounts` | List of approved email users | Only team members can access |
| OTP Login | 6-digit code emailed | Simple, no password resets |
| Session Expiry | Automatic timeout | Security & safety |
| “Logout All Devices” | Broadcast signal to all open sessions | Force-close everywhere |
| Chat Messages | Text sent between two teammates | Team communication |
| Optimistic Message | A message that shows immediately before server confirms | Fast user experience |
| Realtime Subscription | Live connection to updates | See new messages instantly |
| Presence (Online Status) | Shows who is online | Awareness of teammate availability |
| Polling Fallback | Occasional small refresh behind the scenes | Safety if realtime misses something |

============================================================
SECTION 3. CHAT SYSTEM – STEP BY STEP
============================================================
Imagine two teammates: You (User A) and another person (User B).

### 3.1 Opening the Chat Page
1. You visit the Chat page (after logging in).
2. The app loads a list of teammates (excluding you).
3. It waits for you to select someone (a “contact”).

### 3.2 Selecting a Contact
1. You click a teammate’s name.
2. The system fetches recent messages between your email and theirs.
3. It shows them in time order (oldest at top, newest at bottom).
4. It also starts a live (realtime) connection to get new messages as they’re sent.
5. It tracks whether that teammate is currently online.

### 3.3 Sending a Message
1. You type a message and press Enter or click Send.
2. The message instantly appears in the list with a temporary status “sending.”  
   (This is “optimistic”—the system assumes success to feel fast.)
3. Behind the scenes, the app sends the message to the server (Supabase).
4. When the server confirms and broadcasts it back:
   - The temporary version is replaced by the real one.
   - Status changes from “sending” to “sent.”

### 3.4 Receiving a Message (From the Other Person)
1. The other person sends a message from their device.
2. Your browser gets a realtime notification.
3. The new message is added to the bottom of the chat with status “received.”
4. You don’t need to refresh—no page reload.

### 3.5 If Sending Fails
1. Suppose your internet drops mid-send.
2. Your message icon switches from “sending” to “error.”
3. A retry option (e.g., click) triggers the send attempt again.
4. If it succeeds this time, it becomes “sent.” If not, it stays “error.”

### 3.6 Keeping Messages in Order
- Every time messages load or arrive, the system sorts them by their timestamp.
- This guarantees they appear in the correct chronological order.

### 3.7 Auto-Scroll Behavior
- When a brand-new message (sent or received) is added, the chat scrolls to the bottom.
- It does NOT force scroll when just a status changes (like “sending” → “sent”), avoiding jumpiness.

### 3.8 Online Status (Presence)
1. When you open chat, your session announces “I am online” to a shared presence channel.
2. The system receives a list of all active users.
3. It marks your selected teammate “Online” if they are currently connected.
4. If they close their tab, they drop off the list shortly.

### 3.9 Polling Fallback (Safety Net)
- Every few seconds (e.g., 6 seconds) the system quietly checks the server:
  - “Do you have a newer message than the one I’ve seen?”
- If yes, it reloads the latest chunk.
- This protects against:
  - Missed realtime events.
  - Network hiccups.
  - Sleep/wake scenarios (computer suspended).

### 3.10 Why “Optimistic” Messages Are Used
| Reason | Benefit |
|--------|---------|
| Fast feedback | User feels it’s instant |
| Natural flow | Typing → enter → appears; no delay spinner |
| Simple replace | Server version just overwrites the temporary item |

### 3.11 Message Status Meanings
| Status | Meaning (Plain) | Who Sees It |
|--------|-----------------|-------------|
| sending | Your message is on the way | Sender only |
| sent | Server confirmed your message | Sender |
| received | A message from the other person | Receiver |
| error | Something went wrong sending | Sender only |

============================================================
SECTION 4. CHAT FLOW DIAGRAM (ASCII)
============================================================
SEND MESSAGE (Happy Path):
```
You type -> Press Send
   |
   v
+----------------------------+
| Show message (status=sending) |
+----------------------------+
   |
   v (network)
Server saves message
   |
   v (realtime push)
Browser receives confirmation
   |
   v
Replace temporary copy → status=sent
```

RECEIVE MESSAGE:
```
Other user sends
   |
Server stores & broadcasts
   |
Your browser hears event
   |
Message appears (status=received)
```

============================================================
SECTION 5. LOGIN & SESSION – STEP BY STEP
============================================================
### 5.1 Login (OTP Flow)
1. You enter your email on the login screen.
2. The system checks if your email is in the approved list (`allowedAccounts`).
3. If approved:
   - It generates a 6-digit OTP (One-Time Password).
   - Sends it to you via Email (using EmailJS service).
4. You receive the OTP and enter it in the OTP page.
5. The app verifies:
   - OTP matches.
   - OTP not expired.
6. If valid:
   - It creates a session expiration time (e.g., now + 5 hours).
   - Stores basic session info in your browser’s storage.
   - Subscribes to “logout all devices” notifications.
7. You are redirected to the home/dashboard.

### 5.2 Session Expiration
1. A background timer checks every minute.
2. If the current time passes the stored session expiry:
   - You’re logged out automatically.
   - You’re sent back to the login screen.

### 5.3 Why OTP Instead of Passwords
| Reason | Benefit |
|--------|---------|
| No password storage | Lower security risk |
| Faster onboarding | No “forgot password” process |
| Internal tool | Only known team emails used |

### 5.4 “Logout” (Normal)
1. You click “Logout.”
2. Browser clears user and session info.
3. Realtime logout channel unsubscribes.
4. You go to login page.

### 5.5 “Logout All Devices” (Multi-Device)
1. You click “Logout All Devices.”
2. A broadcast message is sent to a shared channel named like `logout_all:<your_email>`.
3. All browsers/tabs currently logged in with that email receive the message.
4. Each one:
   - Clears its own session data.
   - Redirects to login.
5. Result: No device remains logged in.

### 5.6 Auto-Logout on Inactivity / Expiry
- Even if “Logout All” isn’t used, your session still ends at the expiry time.
- This reduces risk if you forget to log out on a shared computer.

============================================================
SECTION 6. LOGIN / LOGOUT FLOW DIAGRAMS
============================================================
LOGIN:
```
Enter Email
  |
  +--> Is email allowed? --No--> Show error
  |
 (Yes)
  |
Generate OTP → Send email → Show OTP entry screen
  |
User enters OTP
  |
Check OTP + Not expired? --No--> Error / restart
  |
(Yes) Create session (expiry time)
  |
Subscribe to logout-all channel
  |
Redirect to app
```

LOGOUT ALL DEVICES:
```
User clicks "Logout All"
  |
Broadcast "logout" event
  |
All open sessions for that email receive event
  |
Each clears local session & redirects to login
```

SESSION EXPIRY:
```
Timer / Focus event
  |
Is current time > expiry?
  |
Yes → Logout user
```

============================================================
SECTION 7. WHAT IS STORED LOCALLY (SIMPLIFIED)
============================================================
| Item | Where | Purpose |
|------|-------|---------|
| User (email + name) | Browser storage | Restore identity after refresh |
| Session Expiry Time | Browser storage | Know when to log out automatically |
| Temporary Messages | Memory (React state) | Show in-progress chats |
| OTP (short-lived) | In memory store | Validation during login only |

============================================================
SECTION 8. SAFETY & RELIABILITY CHOICES (PLAIN TALK)
============================================================
| Design Choice | Human Explanation |
|---------------|-------------------|
| Show message immediately | Makes chat feel “instant” |
| Replace later with server copy | Ensures final version is official |
| Realtime + Polling | “Belt and suspenders” – if one fails, the other helps |
| Auto-expire session | Protects against someone leaving a tab open |
| Logout All | Lets users shut down all devices if worried |
| Online presence list | Lets you know if teammate is available |

============================================================
SECTION 9. COMMON “WHAT IF” QUESTIONS
============================================================
| Question | Answer |
|----------|--------|
| What if I lose internet mid-send? | Message shows “error” – you can retry |
| What if a message doesn’t show up? | Polling reload shortly fills the gap |
| Can someone else see my messages? | Only the two participants (design assumes controlled environment) |
| What if I send the same text twice quickly? | You’ll see two separate messages |
| Why did I get logged out suddenly? | Session expired or “Logout All” used elsewhere |
| Does it store old chats forever? | Depends on database; UI just fetches recent ones (current limit set in code) |

============================================================
SECTION 10. SIMPLE TERMS GLOSSARY
============================================================
| Term | Plain Meaning |
|------|---------------|
| OTP | One-Time Password (code sent to email) |
| Session | Your “logged in” time window |
| Optimistic | “Act like it worked” immediately before confirmation |
| Realtime | Live updates without refreshing the page |
| Presence | Who is currently online |
| Broadcast | Send a message to all listening tabs |
| Polling | Periodic check (“Anything new?”) |

============================================================
SECTION 11. SAMPLE PSEUDOCODE (FOR REFERENCE ONLY)
============================================================
(You can omit this for a pure non-technical PDF if desired.)

Send message (simplified logic):
```
function sendMessage(text):
  if text blank → stop
  showMessage({ text, status: 'sending' })
  try:
     serverResult = saveToServer(text)
     replaceTemporaryWith(serverResult, status='sent')
  catch:
     markTemporary(status='error')
```

Logout all devices:
```
function logoutAll():
  broadcast('logout', userEmail)
  localLogout()
```

Realtime insert handler (simplified):
```
onNewServerMessage(msg):
  if alreadyHave(msg.id) → ignore
  if matchingOptimistic(msg) → replace
  else → append
  sortMessagesByTime()
```

============================================================
SECTION 12. OPTIONAL IMPROVEMENTS (PLAIN)
============================================================
| Idea | Why It Helps |
|------|--------------|
| Add “Delivered” or “Read” indicators | Shows more message status clarity |
| Add typing indicator | Makes chat feel more alive |
| Add pagination (“Load older”) | Lets you scroll back further |
| Add file/image messages | Richer communication |
| Add encryption | More privacy |
| Add message edit/delete | Fix mistakes |
| Add push notifications | Alert when tab inactive |

============================================================
SECTION 13. FILES (IF SOMEONE WANTS TO LOOK LATER)
============================================================
| Feature | File |
|---------|------|
| Chat Hook | useChat.js |
| Realtime + DB Helper | supabaseClient.js |
| Presence Hook | usePresence.js |
| Chat Page Glue | ChatPage.jsx |
| Header (Online text) | ChatHeader.jsx |
| Input box | MessageInput.jsx |
| Message list | MessageList.jsx |
| Auth Store (OTP, Logout) | auth.jsx |
| Route protection | ProtectedRoute.jsx |

============================================================
SECTION 14. ONE-PARAGRAPH EXEC SUMMARY
============================================================
This system provides a simple, fast team chat built on a real-time backend. Users log in using a one-time email code; their session lasts a limited time and can be ended manually or everywhere at once. When you send a message, it shows up instantly (“optimistic”) and is silently confirmed by the server. Messages coming from your teammate pop in live. If something fails (like network), you see an error and can retry. A presence indicator shows if the other person is online. The design balances speed (optimistic updates), reliability (live + polling), and safety (session expiry, logout all).

============================================================
END OF DOCUMENT
============================================================

If you’d like, I can generate a shorter “executive summary” version or convert this to a more formal architecture spec. Want any edits or a Mermaid diagram next? Just tell me.