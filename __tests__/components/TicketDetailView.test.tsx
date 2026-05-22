/**
 * TC-COMP-003: TicketDetailView 컴포넌트 테스트
 * 관련 US: US-003 (티켓 상세 조회)
 *
 * 역할: status / startedAt / completedAt / createdAt — 읽기 전용 표시
 */
import { render, screen } from '@testing-library/react';
import { TicketDetailView } from '@/client/components/ticket/TicketDetailView';
import type { TicketWithMeta } from '@/shared/types';

// ── 공통 픽스처 ────────────────────────────────────────────────────────────────
const baseTicket: TicketWithMeta = {
  id: 1,
  title: '테스트 티켓',
  description: '설명',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  position: 0,
  plannedStartDate: '2026-03-01',
  dueDate: '2026-03-15',
  startedAt:   new Date('2026-02-10T00:00:00.000Z'),
  completedAt: null,
  createdAt:   new Date('2026-02-01T00:00:00.000Z'),
  updatedAt:   new Date('2026-02-17T00:00:00.000Z'),
  isOverdue: false,
};

// ── 테스트 ─────────────────────────────────────────────────────────────────────
describe('TC-COMP-003: TicketDetailView', () => {

  // C003-1 ───────────────────────────────────────────────────────────────────
  it('C003-1: status 한글 표시, startedAt / completedAt / createdAt 날짜를 렌더링한다', () => {
    const ticket: TicketWithMeta = {
      ...baseTicket,
      completedAt: new Date('2026-02-20T00:00:00.000Z'),
    };
    render(<TicketDetailView ticket={ticket} />);

    // 상태 — 한글
    expect(screen.getByText('상태')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();

    // 시작일
    expect(screen.getByText('시작일')).toBeInTheDocument();
    expect(screen.getByText('2026-02-10')).toBeInTheDocument();

    // 종료일 (completedAt 있음)
    expect(screen.getByText('종료일')).toBeInTheDocument();
    expect(screen.getByText('2026-02-20')).toBeInTheDocument();

    // 생성일
    expect(screen.getByText('생성일')).toBeInTheDocument();
    expect(screen.getByText('2026-02-01')).toBeInTheDocument();
  });

  // C003-2 ───────────────────────────────────────────────────────────────────
  it('C003-2: startedAt / completedAt 이 null 이면 각각 "-" 을 표시한다', () => {
    const ticket: TicketWithMeta = { ...baseTicket, startedAt: null, completedAt: null };
    render(<TicketDetailView ticket={ticket} />);

    const dashes = screen.getAllByText('-');
    expect(dashes).toHaveLength(2);  // startedAt "-" + completedAt "-"
  });

  // C003-3 ───────────────────────────────────────────────────────────────────
  it('C003-3: 네 개의 읽기 전용 필드 모두에 .form-readonly 클래스가 적용된다', () => {
    const { container } = render(<TicketDetailView ticket={baseTicket} />);

    const readonlyEls = container.querySelectorAll('.form-readonly');
    expect(readonlyEls).toHaveLength(4);  // status, startedAt, completedAt, createdAt
  });
});
