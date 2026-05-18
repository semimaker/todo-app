# Design System: Project Tika (Kanban Interface)

이 문서는 Linear와 Trello의 사용성을 벤치마킹하여 제작된 Tika 프로젝트의 디자인 가이드라인입니다.  
컬러 토큰 원본은 `src/shared/design/colors.json`, 런타임 CSS 변수는 `app/globals.css :root`를 참조하십시오.

---

## 1. Design Philosophy
- **Minimalism:** 불필요한 장식을 배제하고 데이터(Task) 중심의 UI 구성 (Linear 스타일).
- **Spatial Awareness:** 4개 스위밍레인을 고유 배경색으로 구분하여 즉각적인 컨텍스트 인지 (Trello 스타일).
- **Immediate Feedback:** 우선순위·상태 변화를 컬러 배지로 즉각 인지.

---

## 2. Layout Structure

| 영역 | 설명 |
|------|------|
| Global Header | Search + '새 업무' 버튼, 최상단 고정 (height: auto) |
| Side Inventory (Backlog) | 좌측 272px 고정 패널, ≥ 1024px에서만 표시 |
| Main Board | FilterBar + 3-column 칸반 (TODO / In Progress / Done) |

### Responsive Breakpoints
| 범위 | 레이아웃 |
|------|---------|
| ≥ 1024px | 풀 레이아웃 — Backlog 사이드바 + 3컬럼 |
| 768px ~ 1023px | Backlog 숨김, 2컬럼 그리드 (3번째 컬럼 wrap) |
| < 768px | Backlog 숨김, 단일 컬럼 스택 |

---

## 3. Typography

| 용도 | 크기 | 굵기 | 색상 |
|------|------|------|------|
| 칼럼 헤더, 카드 제목, 모달 제목 | 14px | Bold (700) | Gray-900 `#111827` |
| 카드 설명, 폼 입력, 메타 정보 | 12px | Regular (400) | Gray-600 `#4B5563` |
| 폼 레이블, 버튼 | 12px | Semi-bold (600) | Gray-600 `#4B5563` |
| 배지, 에러 메시지 | 11px | Semi-bold (600) | - |

- **Primary Font:** -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

---

## 4. Color Palette

### Semantic Colors
| 토큰 | 값 | Tailwind | 용도 |
|------|----|----------|------|
| primary | `#2563EB` | blue-600 | 버튼, 링크, 포커스 링 |
| danger  | `#DC2626` | red-600  | 삭제, overdue, 에러 |
| success | `#16A34A` | green-600| Done 완료 상태 |
| warning | `#CA8A04` | yellow-600| TODO 강조, 경고 |

### Swimlane Colors (4개 구분선 포함)
각 컬럼은 `border-top: 3px solid {accent}` + 고유 배경색으로 시각적 구분선을 제공합니다.  
보드 캔버스(`#F1F2F4`) → 컬럼 간 12px gap → 캔버스가 드러나 **세로 구분선** 역할  
FilterBar `border-bottom` → **가로 구분선** 역할 (필터 영역 ↔ 컬럼 영역 분리)

| 컬럼 | 배경 (bg-*50) | 액센트 (*-600) | 상태 도트 |
|------|-------------|--------------|---------|
| Backlog    | `#F5F3FF` violet-50  | `#7C3AED` violet-600 | ● |
| TODO       | `#FEFCE8` yellow-50  | `#CA8A04` yellow-600 | ● |
| In Progress| `#EFF6FF` blue-50    | `#2563EB` blue-600   | ● |
| Done       | `#F0FDF4` green-50   | `#16A34A` green-600  | ● |

### Priority Badge Colors
| 우선순위 | 텍스트 | 배경 |
|---------|--------|------|
| High   | `#DC2626` red-600  | `#FEE2E2` red-100  |
| Medium | `#2563EB` blue-600 | `#DBEAFE` blue-100 |
| Low    | `#6B7280` gray-500 | `#F1F5F9` slate-100|

---

## 5. Components

### Task Card
- **Background:** White `#FFFFFF`
- **Border:** `1px solid #E2E8F0`
- **Radius:** 8px
- **Shadow:** `0 1px 2px rgba(0,0,0,0.08)` → hover: `0 4px 8px rgba(0,0,0,0.12)`
- **Padding:** 12px
- **Overdue:** `border-left: 3px solid #DC2626` + bg `#FEE2E2`

### Column
- **Radius:** 12px (Trello 스타일 플로팅 컬럼)
- **Gap between columns:** 12px
- **Top accent bar:** `3px solid {accent}` (스위밍레인 식별)
- **Header:** `● status-dot` + 컬럼명 (14px Bold) + 카드수 뱃지

### Input Fields (통일 기준)
- **Font size:** 12px
- **Padding:** 8px 12px
- **Border:** `1px solid #E2E8F0`
- **Border-radius:** 6px
- **Background:** `#FFFFFF`
- **Focus:** `border-color: #2563EB` + `box-shadow: 0 0 0 3px rgba(37,99,235,0.15)`
- **Placeholder:** `#9CA3AF` gray-400

> `search-input`, `form-input`, `form-textarea`, date/select 모두 동일 규칙을 따릅니다.

### Buttons
| 변형 | 기본 bg | Hover bg |
|------|---------|---------|
| primary   | `#2563EB` | `#1D4ED8` blue-700 |
| danger    | `#DC2626` | `#B91C1C` red-700  |
| secondary | `#E2E8F0` | `#CBD5E1`          |
| ghost     | transparent | `#F1F5F9`        |

---

## 6. Interaction
- **Card Hover:** shadow 증가 (`0 4px 8px`) + `border-color: #CBD5E1`
- **Card Dragging:** opacity 0.5 (원본), overlay에 `rotate(3deg)` + `0 8px 24px` shadow
- **DnD Drop Zone:** `rgba(37, 99, 235, 0.06)` tint + `2px dashed #2563EB` outline
- **Buttons:** Primary hover → blue-700 / Danger hover → red-700
- **Focus Ring:** `0 0 0 3px rgba(37, 99, 235, 0.15)`

---

*Created for Tika Project Board UI — aligned with tika-wireframe.png & Trello reference*
