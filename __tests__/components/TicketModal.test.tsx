/**
 * TC-COMP-005: TicketModal 컴포넌트 테스트
 * 관련 US: US-007 (티켓 상세/수정 모달), US-008 (티켓 삭제)
 *
 * 구조: Modal > ModalHeader(제목 + 삭제버튼) > TicketDetailView + TicketForm
 *       + ConfirmDialog (삭제 2단계 확인, Modal 외부 Portal)
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketModal } from '@/client/components/ticket/TicketModal';
import type { TicketWithMeta } from '@/shared/types';

// ── 공통 픽스처 ────────────────────────────────────────────────────────────────
const ticket: TicketWithMeta = {
  id: 42,
  title: '테스트 티켓',
  description: '설명 텍스트',
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

const mockOnClose  = jest.fn();
const mockOnUpdate = jest.fn();
const mockOnDelete = jest.fn();

beforeEach(() => jest.clearAllMocks());

// ── 공통 렌더 헬퍼 ─────────────────────────────────────────────────────────────
function renderModal(isOpen: boolean) {
  return render(
    <TicketModal
      ticket={ticket}
      isOpen={isOpen}
      onClose={mockOnClose}
      onUpdate={mockOnUpdate}
      onDelete={mockOnDelete}
    />
  );
}

// ── 테스트 ─────────────────────────────────────────────────────────────────────
describe('TC-COMP-005: TicketModal', () => {

  // C005-1 ───────────────────────────────────────────────────────────────────
  it('C005-1: isOpen=false 이면 모달이 렌더링되지 않는다', () => {
    renderModal(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // C005-2 ───────────────────────────────────────────────────────────────────
  it('C005-2: isOpen=true 이면 ticket.title 이 헤더에 표시된다', () => {
    renderModal(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '테스트 티켓' })).toBeInTheDocument();
  });

  // C005-3 ───────────────────────────────────────────────────────────────────
  it('C005-3: TicketDetailView — 읽기 전용 필드(상태, 시작일, 생성일)가 표시된다', () => {
    renderModal(true);
    expect(screen.getByText('상태')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    expect(screen.getByText('시작일')).toBeInTheDocument();
    expect(screen.getByText('생성일')).toBeInTheDocument();
  });

  // C005-4 ───────────────────────────────────────────────────────────────────
  it('C005-4: TicketForm mode=edit — 편집 가능 필드(제목, 설명, 우선순위, 시작예정일, 종료예정일)가 표시된다', () => {
    renderModal(true);
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('설명')).toBeInTheDocument();
    expect(screen.getByLabelText('우선순위')).toBeInTheDocument();
    expect(screen.getByLabelText('시작예정일')).toBeInTheDocument();
    expect(screen.getByLabelText('종료예정일')).toBeInTheDocument();
  });

  // C005-5 ───────────────────────────────────────────────────────────────────
  it('C005-5: ESC 키를 누르면 onClose 가 호출된다 (Modal 위임)', async () => {
    const user = userEvent.setup();
    renderModal(true);
    await user.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalled();
  });

  // C005-6 ───────────────────────────────────────────────────────────────────
  it('C005-6: 오버레이(.modal-overlay) 클릭 시 onClose 가 호출된다 (Modal 위임)', async () => {
    const user = userEvent.setup();
    renderModal(true);
    await user.click(screen.getByRole('dialog'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  // C005-7 ───────────────────────────────────────────────────────────────────
  // 2단계 삭제 확인: 삭제 버튼 → ConfirmDialog 표시 → 확인 → onDelete(id)
  it('C005-7: 삭제 버튼 → ConfirmDialog 표시 → 확인 클릭 → onDelete(ticket.id) 호출', async () => {
    const user = userEvent.setup();
    renderModal(true);

    // 1단계: 삭제 버튼 클릭 → ConfirmDialog 열림
    await user.click(screen.getByRole('button', { name: '삭제' }));
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();

    // 2단계: 확인 클릭 → onDelete 호출
    await user.click(screen.getByRole('button', { name: '확인' }));
    expect(mockOnDelete).toHaveBeenCalledWith(42);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  // C005-7b (보너스) ──────────────────────────────────────────────────────────
  // 취소 경로: ConfirmDialog 취소 → onDelete 미호출 + ConfirmDialog 닫힘
  it('C005-7b: ConfirmDialog 취소 클릭 시 onDelete 가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    renderModal(true);

    await user.click(screen.getByRole('button', { name: '삭제' }));
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument();

    // TicketForm "취소"와 ConfirmDialog "취소"가 동시에 존재 → .confirm-dialog 범위로 한정
    const confirmEl = screen.getByText('정말 삭제하시겠습니까?').closest<HTMLElement>('.confirm-dialog')!;
    await user.click(within(confirmEl).getByRole('button', { name: '취소' }));
    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(screen.queryByText('정말 삭제하시겠습니까?')).not.toBeInTheDocument();
  });
});
