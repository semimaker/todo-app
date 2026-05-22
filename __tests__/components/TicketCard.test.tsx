/**
 * TC-COMP-001: TicketCard 컴포넌트 테스트
 * 관련 US: US-003 (칸반 보드 현황 파악), US-004 (마감 초과 인지)
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketCard } from '@/client/components/ticket/TicketCard';
import type { TicketWithMeta } from '@/shared/types';

// ── @dnd-kit mock ──────────────────────────────────────────────────────────────
// DnD 컨텍스트 없이 렌더링할 수 있도록 useSortable / CSS 유틸을 무력화한다.
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

// ── 공통 픽스처 ────────────────────────────────────────────────────────────────
const baseTicket: TicketWithMeta = {
  id: 1,
  title: 'API 설계 문서 작성',
  description: 'REST API 엔드포인트를 정의한다',
  status: 'TODO',
  priority: 'MEDIUM',
  position: 0,
  plannedStartDate: null,
  dueDate: '2026-03-01',
  startedAt: null,
  completedAt: null,
  createdAt: new Date('2026-02-17'),
  updatedAt: new Date('2026-02-17'),
  isOverdue: false,
};

// ── 테스트 ─────────────────────────────────────────────────────────────────────
describe('TC-COMP-001: TicketCard', () => {

  // C001-1 ───────────────────────────────────────────────────────────────────
  it('C001-1: 제목, 우선순위 뱃지, 종료예정일을 렌더링한다', () => {
    render(<TicketCard ticket={baseTicket} />);

    expect(screen.getByText('API 설계 문서 작성')).toBeInTheDocument();  // 제목
    expect(screen.getByText('보통')).toBeInTheDocument();                 // MEDIUM 뱃지
    expect(screen.getByText('2026-03-01')).toBeInTheDocument();           // 종료예정일
  });

  // C001-2 ───────────────────────────────────────────────────────────────────
  it('C001-2: isOverdue=true 이면 카드에 data-overdue="true" 속성이 설정된다', () => {
    const ticket: TicketWithMeta = { ...baseTicket, isOverdue: true };
    const { container } = render(<TicketCard ticket={ticket} />);

    const card = container.querySelector('.ticket-card');
    expect(card).toHaveAttribute('data-overdue', 'true');
  });

  // C001-3 ───────────────────────────────────────────────────────────────────
  it('C001-3: status=DONE 이면 카드에 ticket-card--done 클래스가 추가된다', () => {
    const ticket: TicketWithMeta = { ...baseTicket, status: 'DONE' };
    const { container } = render(<TicketCard ticket={ticket} />);

    const card = container.querySelector('.ticket-card');
    expect(card).toHaveClass('ticket-card--done');
  });

  // C001-4 ───────────────────────────────────────────────────────────────────
  it('C001-4: dueDate=null 이면 종료예정일 영역이 렌더링되지 않는다', () => {
    const ticket: TicketWithMeta = { ...baseTicket, dueDate: null };
    render(<TicketCard ticket={ticket} />);

    // DueDateBadge 는 dueDate=null 일 때 null 반환 → 텍스트/요소 미존재 확인
    expect(screen.queryByText('2026-03-01')).not.toBeInTheDocument();
    expect(document.querySelector('.badge-due-date')).not.toBeInTheDocument();
  });

  // C001-5 ───────────────────────────────────────────────────────────────────
  it('C001-5: 카드 클릭 시 onClick 핸들러가 호출된다', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<TicketCard ticket={baseTicket} onClick={onClick} />);

    await user.click(screen.getByText('API 설계 문서 작성'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // C001-6 ───────────────────────────────────────────────────────────────────
  it('C001-6: 긴 제목(200자)은 ticket-card-title 클래스가 적용된 요소에 렌더링된다', () => {
    // CSS text-overflow:ellipsis 는 브라우저가 처리하므로
    // 테스트에서는 말줄임 대상 클래스 존재 여부로 검증한다.
    const longTitle = 'a'.repeat(200);
    render(<TicketCard ticket={{ ...baseTicket, title: longTitle }} />);

    const titleEl = screen.getByText(longTitle);
    expect(titleEl).toHaveClass('ticket-card-title');
  });

  // C001-7 ───────────────────────────────────────────────────────────────────
  it.each([
    ['LOW',    '낮음', 'badge-priority-low'],
    ['MEDIUM', '보통', 'badge-priority-medium'],
    ['HIGH',   '높음', 'badge-priority-high'],
  ] as const)(
    'C001-7: priority=%s → "%s" 뱃지에 data-priority 속성과 %s 클래스가 적용된다',
    (priority, label, cssClass) => {
      render(<TicketCard ticket={{ ...baseTicket, priority }} />);

      const badge = screen.getByText(label);
      expect(badge).toHaveAttribute('data-priority', priority);
      expect(badge).toHaveClass(cssClass);
    },
  );
});
