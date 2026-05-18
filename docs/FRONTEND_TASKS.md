# 프런트엔드 구현 태스크

> 컴포넌트 명세는 [COMPONENT_SPEC.md](./COMPONENT_SPEC.md), 요구사항은 [REQUIREMENTS.md](./REQUIREMENTS.md) 참조

---

## 구현 원칙

- **Bottom-up**: 말단 컴포넌트(Leaf)부터 구현하여 컨테이너로 조립
- **TDD**: Red(실패 테스트) → Green(최소 구현) → Refactor(개선)
- **의존성 순서**: 각 컴포넌트는 자신의 의존성이 먼저 구현된 상태에서 작업
- **계층 경계**: `src/client/` → `src/server/` 직접 import 금지, 반드시 API 경유

---

## 의존성 그래프

```
┌─────────────────────────────────────────────────┐
│              Phase 1: UI 기본 컴포넌트             │
│  Button   Badge   Modal   ConfirmDialog(Modal)   │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌───────────────┐       ┌─────────────────────────┐
│   Phase 2     │       │       Phase 3            │
│  Board 컴포넌트 │       │    Ticket 컴포넌트        │
│  TicketCard   │       │  TicketDetailView        │
│  ColumnHeader │       │  TicketForm              │
│  Column       │       │  TicketModal             │
│  Board        │       │  (Modal+Button+Confirm)  │
└───────┬───────┘       └──────────┬──────────────┘
        │                          │
        └──────────┬───────────────┘
                   ▼
        ┌──────────────────────┐
        │     Phase 4          │
        │   데이터 레이어       │
        │   ticketApi          │
        │   useTickets         │
        └──────────┬───────────┘
                   ▼
        ┌──────────────────────┐
        │     Phase 5          │
        │   컨테이너 조립        │
        │   BoardHeader        │
        │   FilterBar          │
        │   BoardContainer     │
        │   page.tsx           │
        └──────────────────────┘
```

### 세부 의존 관계

```
Button ──────────────────────────────────────────┐
Badge  ──────────────────────────────────────────┤
Modal ──────┬────────────────────────────────────┤
            ├── ConfirmDialog ───────────────────┤
            │                                    │
TicketCard ─┤ (Badge + useSortable)              │
ColumnHeader┼── Column ── Board ─────────────────┤
            │   (useDroppable + SortableContext)  │
            │                                    │
TicketDetailView ──────────────────────────────  │
TicketForm ─┼── TicketModal ─────────────────────┤
(Zod 검증)  │   (Modal + ConfirmDialog + Button)  │
            │                                    │
ticketApi ──┴── useTickets ─────────────────────┤
                                                  │
BoardHeader ┬─────────────────────────────────── │
FilterBar ──┼── BoardContainer ──── page.tsx     │
Board ──────┘   (DndContext + useTickets)         │
```

---

## Phase 1: UI 기본 컴포넌트

> 의존성 없음. 가장 먼저 구현하는 말단 컴포넌트.

| 순서 | 컴포넌트 | 파일 경로 | 테스트 수 |
|------|----------|-----------|----------|
| 1-1 | Button | `src/client/components/ui/Button.tsx` | 7 |
| 1-2 | Badge | `src/client/components/ui/Badge.tsx` | 5 |
| 1-3 | Modal | `src/client/components/ui/Modal.tsx` | 5 |
| 1-4 | ConfirmDialog | `src/client/components/ui/ConfirmDialog.tsx` | 5 |

---

### 1-1. Button

```
Props: variant(primary|secondary|danger|ghost), size(sm|md|lg), isLoading, children, onClick, ...HTMLButtonAttributes
CSS:   .btn .btn-{variant} .btn-{size}
```

**TDD 체크리스트**:
- [ ] variant=primary → `.btn-primary` 클래스 적용
- [ ] variant=secondary → `.btn-secondary` 클래스 적용
- [ ] variant=danger → `.btn-danger` 클래스 적용
- [ ] variant=ghost → `.btn-ghost` 클래스 적용
- [ ] size=sm/md/lg → `.btn-sm/.btn-md/.btn-lg` 클래스 적용
- [ ] 기본값: variant=primary, size=md
- [ ] onClick 핸들러 호출됨
- [ ] isLoading=true → 버튼 disabled + "처리중..." 텍스트
- [ ] isLoading=true → onClick 클릭 무시
- [ ] children 렌더링

---

### 1-2. Badge

```
PriorityBadge Props: priority(LOW|MEDIUM|HIGH)
DueDateBadge  Props: dueDate(string|null), isOverdue(boolean)
CSS: .badge .badge-priority-{level} .badge-due-date
```

**TDD 체크리스트** (PriorityBadge):
- [ ] LOW → `.badge-priority-low` + "낮음" 텍스트 + `data-priority="LOW"`
- [ ] MEDIUM → `.badge-priority-medium` + "보통" 텍스트 + `data-priority="MEDIUM"`
- [ ] HIGH → `.badge-priority-high` + "높음" 텍스트 + `data-priority="HIGH"`

**TDD 체크리스트** (DueDateBadge):
- [ ] dueDate 있음 → 날짜 텍스트 렌더링
- [ ] dueDate=null → 렌더링 안 됨
- [ ] isOverdue=true → `data-overdue="true"` 속성 설정

---

### 1-3. Modal

```
Props: isOpen(boolean), onClose(() => void), children
CSS:   .modal-overlay .modal-content
동작:  ESC 닫기, 오버레이 클릭 닫기, body 스크롤 잠금
```

**TDD 체크리스트**:
- [ ] isOpen=false → 렌더링 안 됨 (null 반환)
- [ ] isOpen=true → `.modal-overlay` + `.modal-content` 렌더링
- [ ] isOpen=true → children 렌더링
- [ ] ESC 키 누름 → onClose 호출
- [ ] 오버레이(`.modal-overlay`) 클릭 → onClose 호출
- [ ] `.modal-content` 클릭 → onClose 호출 안 됨 (이벤트 전파 차단)
- [ ] isOpen=true → `body.modal-open` 클래스 추가
- [ ] 언마운트 시 → `body.modal-open` 클래스 제거

---

### 1-4. ConfirmDialog

```
Props: isOpen(boolean), message(string), onConfirm(() => void), onCancel(() => void)
의존:  Modal, Button
```

**TDD 체크리스트**:
- [ ] isOpen=false → 렌더링 안 됨
- [ ] isOpen=true → message 텍스트 표시
- [ ] "확인" 버튼 클릭 → onConfirm 호출
- [ ] "취소" 버튼 클릭 → onCancel 호출
- [ ] "확인" 버튼 → `.btn-danger` 클래스 적용

---

## Phase 2: Board 컴포넌트

> Phase 1 UI에 의존. @dnd-kit 연동.

| 순서 | 컴포넌트 | 파일 경로 | 테스트 수 |
|------|----------|-----------|----------|
| 2-1 | TicketCard | `src/client/components/ticket/TicketCard.tsx` | 7 |
| 2-2 | ColumnHeader | `src/client/components/board/ColumnHeader.tsx` | 4 |
| 2-3 | Column | `src/client/components/board/Column.tsx` | 8 |
| 2-4 | Board | `src/client/components/board/Board.tsx` | 4 |

---

### 2-1. TicketCard

```
Props: ticket(TicketWithMeta), onClick(() => void)
의존:  PriorityBadge, DueDateBadge, useSortable(@dnd-kit/sortable)
CSS:   .ticket-card .ticket-card-title .ticket-card-description .ticket-card-meta
접근성: role="button", aria-label="티켓: {title}", tabIndex=0
```

**TDD 체크리스트**:
- [ ] 제목(title) 렌더링 (`.ticket-card-title`)
- [ ] PriorityBadge 렌더링 (priority 전달)
- [ ] dueDate 있음 → DueDateBadge 렌더링
- [ ] dueDate=null → DueDateBadge 미렌더링
- [ ] isOverdue=true → `data-overdue="true"` 속성 + 빨간 테두리 스타일
- [ ] status=DONE → `.ticket-card-done` 또는 완료 스타일
- [ ] 카드 클릭 → onClick 호출
- [ ] Enter 키 → onClick 호출
- [ ] 긴 제목 → 말줄임(`.ticket-card-title` overflow ellipsis)
- [ ] `aria-label="티켓: {title}"` 속성
- [ ] 드래그 중(`isDragging=true`) → `data-dragging="true"` 속성

---

### 2-2. ColumnHeader

```
Props: title(TicketStatus), count(number)
CSS:   .column-header .column-count
한글 매핑: BACKLOG→백로그, TODO→할 일, IN_PROGRESS→진행 중, DONE→완료
```

**TDD 체크리스트**:
- [ ] BACKLOG → "백로그" 텍스트
- [ ] TODO → "할 일" 텍스트
- [ ] IN_PROGRESS → "진행 중" 텍스트
- [ ] DONE → "완료" 텍스트
- [ ] count 숫자 렌더링 (`.column-count`)

---

### 2-3. Column

```
Props: status(TicketStatus), tickets(TicketWithMeta[]), onTicketClick
의존:  ColumnHeader, TicketCard, useDroppable + SortableContext(@dnd-kit)
CSS:   .column[data-status] .column-cards .column-empty
```

**TDD 체크리스트**:
- [ ] `data-status={status}` 속성 설정
- [ ] ColumnHeader 렌더링 (칼럼명 + 카드 수)
- [ ] tickets 배열 → TicketCard 목록 렌더링
- [ ] tickets.length=0 → "이 칼럼에 티켓이 없습니다" 안내
- [ ] 각 TicketCard의 onClick → onTicketClick(ticket) 호출
- [ ] SortableContext items = tickets.map(t => t.id)
- [ ] isOver=true → `.column--over` 클래스 추가 (드롭존 하이라이트)
- [ ] useDroppable id = status 값

---

### 2-4. Board

```
Props: board(BoardData), onTicketClick, activeTicket(TicketWithMeta|null), filterBar?(ReactNode)
의존:  Column, DragOverlay(@dnd-kit/core)
CSS:   .board-content .board-sidebar .board-main .columns-container
```

**TDD 체크리스트**:
- [ ] `.board-sidebar` 안에 BACKLOG Column 렌더링
- [ ] `.sidebar-title` "할일 목록 영역(Backlog)" 텍스트
- [ ] `.columns-container` 안에 TODO, IN_PROGRESS, DONE Column 렌더링
- [ ] filterBar prop → `.board-main` 내 columns-container 위에 렌더링
- [ ] activeTicket 있음 → DragOverlay 내 TicketCard 렌더링 (`.ticket-card-overlay`)
- [ ] activeTicket=null → DragOverlay 비어있음

---

## Phase 3: Ticket 컴포넌트

> Phase 1 UI + Zod 검증에 의존.

| 순서 | 컴포넌트 | 파일 경로 | 테스트 수 |
|------|----------|-----------|----------|
| 3-1 | TicketDetailView | `src/client/components/ticket/TicketDetailView.tsx` | 3 |
| 3-2 | TicketForm | `src/client/components/ticket/TicketForm.tsx` | 7 |
| 3-3 | TicketModal | `src/client/components/ticket/TicketModal.tsx` | 7 |

---

### 3-1. TicketDetailView

```
Props: ticket(TicketWithMeta)
역할:  읽기 전용 시스템 필드 표시 (status, startedAt, completedAt, createdAt)
CSS:   .form-field .form-label .form-readonly
```

**TDD 체크리스트**:
- [ ] status → 한글 상태명 표시 (예: DONE → "완료")
- [ ] startedAt 있음 → 날짜 포맷 표시, 없음 → "-"
- [ ] completedAt 있음 → 날짜 포맷 표시, 없음 → "-"
- [ ] createdAt → 날짜 포맷 표시

---

### 3-2. TicketForm

```
Props: mode(create|edit), initialData(Partial<Ticket>), onSubmit, onCancel, isLoading
의존:  Button, createTicketSchema/updateTicketSchema(Zod, src/shared/validations/ticket.ts)
CSS:   .form-field .form-label .form-input .form-textarea .form-error
```

**폼 필드**: title(필수), description, priority(기본 MEDIUM), plannedStartDate, dueDate

**TDD 체크리스트**:
- [ ] mode=create → 빈 필드, priority 기본값 MEDIUM
- [ ] mode=edit → initialData 값으로 필드 초기화
- [ ] title 빈 값 제출 → "제목을 입력해주세요" 에러
- [ ] dueDate 과거 날짜 → "종료예정일은 오늘 이후 날짜를 선택해주세요" 에러
- [ ] plannedStartDate date input 렌더링
- [ ] 정상 제출 → onSubmit 호출 + 유효한 데이터 전달
- [ ] isLoading=true → 제출 버튼 비활성 + "처리중..." 표시
- [ ] mode=create → 제출 버튼 "생성", mode=edit → "저장"
- [ ] "취소" 버튼 → onCancel 호출

---

### 3-3. TicketModal

```
Props: ticket(TicketWithMeta), isOpen, onClose, onUpdate(id, data), onDelete(id), isLoading
의존:  Modal, Button, TicketDetailView, TicketForm, ConfirmDialog
```

**TDD 체크리스트**:
- [ ] isOpen=false → 렌더링 안 됨
- [ ] isOpen=true → ticket.title 헤더에 표시
- [ ] TicketDetailView 렌더링 (읽기 전용 필드)
- [ ] TicketForm mode=edit 렌더링 (편집 가능 필드)
- [ ] ESC 키 → onClose 호출 (Modal 위임)
- [ ] 오버레이 클릭 → onClose 호출 (Modal 위임)
- [ ] "삭제" 버튼 클릭 → ConfirmDialog 표시
- [ ] ConfirmDialog 확인 → onDelete(ticket.id) 호출 + 모달 닫힘
- [ ] ConfirmDialog 취소 → ConfirmDialog만 닫힘

---

## Phase 4: 데이터 레이어

> 의존성 없음. fetch 래퍼 + React Hook.

| 순서 | 모듈 | 파일 경로 | 테스트 수 |
|------|------|-----------|----------|
| 4-1 | ticketApi | `src/client/api/ticketApi.ts` | 11 |
| 4-2 | useTickets | `src/client/hooks/useTickets.ts` | 10 |

---

### 4-1. ticketApi

```
함수: getBoard, create, update, remove, reorder, complete
규칙: 컴포넌트에서 직접 fetch 금지 — 반드시 이 모듈 경유
```

**TDD 체크리스트**:
- [ ] `getBoard()` → GET /api/tickets → BoardData 반환
- [ ] `create(input)` → POST /api/tickets (JSON body) → Ticket 반환
- [ ] `update(id, data)` → PATCH /api/tickets/:id (JSON body) → Ticket 반환
- [ ] `remove(id)` → DELETE /api/tickets/:id → void
- [ ] `reorder(input)` → PATCH /api/tickets/reorder (JSON body) → 결과 반환
- [ ] `complete(id)` → PATCH /api/tickets/:id/complete → Ticket 반환
- [ ] 모든 요청에 `Content-Type: application/json` 헤더
- [ ] 응답 !ok → `error.message` throw (body.error.message 우선)
- [ ] 204 No Content → undefined 반환 (JSON 파싱 안 함)

---

### 4-2. useTickets

```
시그니처: function useTickets(initialData: BoardData): UseTicketsReturn
반환: { board, isLoading, error, create, update, remove, reorder, complete }
패턴: 낙관적 업데이트(reorder/complete) → API 호출 → 성공 시 refreshBoard → 실패 시 rollback
```

**낙관적 업데이트 패턴**:
```
1. 현재 board 상태 백업
2. UI 즉시 반영 (setBoard 호출)
3. ticketApi 호출
4. 성공 → refreshBoard() (서버 상태로 확정)
5. 실패 → setBoard(backup) + setError(message)
```

**TDD 체크리스트**:
- [ ] `board` 초기값 = initialData
- [ ] `create()` → ticketApi.create 호출 + refreshBoard
- [ ] `update()` → ticketApi.update 호출 + refreshBoard
- [ ] `remove()` → ticketApi.remove 호출 + refreshBoard
- [ ] `reorder()` → 낙관적 업데이트 → ticketApi.reorder → refreshBoard
- [ ] `complete()` → 낙관적 업데이트 → ticketApi.complete → refreshBoard
- [ ] API 호출 중 `isLoading=true`
- [ ] API 완료 후 `isLoading=false`
- [ ] 실패 시 `error` 상태에 메시지 설정
- [ ] reorder 실패 → 이전 board 상태로 롤백

---

## Phase 5: 컨테이너 조립

> 모든 Phase 완료 후. 전체 보드를 조립.

| 순서 | 컴포넌트 | 파일 경로 | 테스트 수 |
|------|----------|-----------|----------|
| 5-1 | BoardHeader | `src/client/components/board/BoardHeader.tsx` | 4 |
| 5-2 | FilterBar | `src/client/components/board/FilterBar.tsx` | 6 |
| 5-3 | BoardContainer | `src/client/components/board/BoardContainer.tsx` | 6 |
| 5-4 | page.tsx | `app/page.tsx` | — |

---

### 5-1. BoardHeader

```
Props: onCreateClick(() => void)
의존:  Button
CSS:   .board-header .board-title .search-input
```

**TDD 체크리스트**:
- [ ] "Tika" 타이틀 텍스트 렌더링 (`.board-title`)
- [ ] 검색 input 렌더링 (placeholder="Search", disabled=true)
- [ ] "새 업무" 버튼 렌더링
- [ ] "새 업무" 버튼 클릭 → onCreateClick 호출

---

### 5-2. FilterBar

```
Props: activeFilter('all'|'thisWeek'|'overdue'), onFilterChange, counts({thisWeek, overdue})
CSS:   .filter-bar .filter-btn[data-active] .filter-count
동작:  활성 필터 재클릭 → 'all'로 토글
```

**필터 로직**:
```typescript
// 이번주 업무: 이번 주 월~일 범위 내 dueDate (TODO/IN_PROGRESS만)
// 일정 초과: isOverdue === true (BACKLOG 제외 적용)
// Backlog 칼럼은 필터 미적용 (항상 전체 표시)
```

**TDD 체크리스트**:
- [ ] "이번주 업무" 버튼 + counts.thisWeek 숫자 표시
- [ ] "일정 초과" 버튼 + counts.overdue 숫자 표시
- [ ] "이번주 업무" 클릭 → onFilterChange('thisWeek') 호출
- [ ] "일정 초과" 클릭 → onFilterChange('overdue') 호출
- [ ] activeFilter='thisWeek' → 해당 버튼 `data-active="true"`
- [ ] 이미 활성화된 필터 재클릭 → onFilterChange('all') 호출

---

### 5-3. BoardContainer

```
Props: initialData(BoardData)
의존:  Board, BoardHeader, FilterBar, TicketModal, Modal, TicketForm, useTickets, DndContext
역할:  필터 상태, 모달 상태, DnD 이벤트, CRUD 핸들링 총괄
```

**DnD 이벤트 흐름**:
```
onDragStart → activeTicket 설정
onDragEnd   → 대상 칼럼 판별
              └─ DONE → useTickets.complete(ticketId)
              └─ 그 외 → useTickets.reorder(ticketId, status, position)
```

**position 계산 규칙**:
```
빈 칼럼       → position = 0
맨 앞 삽입    → firstCard.position - 1024
맨 뒤 삽입    → lastCard.position + 1024
중간 삽입     → (prevCard.position + nextCard.position) / 2
간격 < 1     → 칼럼 전체 1024 간격 재정렬
```

**TDD 체크리스트**:
- [ ] BoardHeader 렌더링
- [ ] FilterBar 렌더링
- [ ] Board 4칼럼 렌더링
- [ ] "새 업무" 클릭 → 생성 모달(Modal+TicketForm) 열림
- [ ] TicketCard 클릭 → TicketModal 열림 + 해당 ticket 전달
- [ ] activeFilter='overdue' → TODO/IN_PROGRESS에서 isOverdue 티켓만 표시
- [ ] activeFilter='thisWeek' → 이번주 dueDate 티켓만 표시
- [ ] Backlog는 필터 무관 항상 전체 표시

---

### 5-4. page.tsx

```
파일: app/page.tsx
역할: async 서버 컴포넌트 — ticketService.getBoard() 호출 → BoardContainer에 initialData 전달
```

**체크리스트**:
- [ ] `export const dynamic = 'force-dynamic'` 설정 (캐시 비활성)
- [ ] `async` 서버 컴포넌트
- [ ] `ticketService.getBoard()` 호출 → initialData 획득
- [ ] `<BoardContainer initialData={initialData} />` 렌더링
- [ ] `.board-layout` 래퍼 div 적용

---

## 컴포넌트 계층 — 레이아웃 구성

```
┌───────────────────────────────────────────────────────┐
│  BoardHeader (.board-header)                           │
│  [Tika 타이틀]          [Search(비활성)]  [새 업무 버튼] │
├──────────────┬────────────────────────────────────────┤
│              │  FilterBar (.filter-bar)               │
│  Backlog     │  [이번주 업무 N]  [일정 초과 N]          │
│  (사이드바)   ├─────────────┬──────────────────────────┤
│  .board-     │    TODO     │  In Progress  │   Done   │
│  sidebar     │  .column    │  .column      │  .column │
│              │             │               │          │
└──────────────┴─────────────┴───────────────┴──────────┘
```

---

## 주요 명령어

```bash
npm run test                  # 전체 테스트 (169 tests)
npm run test:components       # 컴포넌트 테스트만 (80 tests)
npm run test:watch            # 테스트 감시 모드
npx tsc --noEmit              # 타입 체크
npm run dev                   # 개발 서버 (localhost:3000)
```
