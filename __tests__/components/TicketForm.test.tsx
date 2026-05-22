/**
 * TC-COMP-004: TicketForm 컴포넌트 테스트
 * 관련 US: US-001 (티켓 생성), US-002 (티켓 수정)
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketForm } from '@/client/components/ticket/TicketForm';
import type { TicketWithMeta } from '@/shared/types';

// ── 공통 픽스처 ────────────────────────────────────────────────────────────────
const editTicket: TicketWithMeta = {
  id: 1,
  title: '기존 티켓 제목',
  description: '기존 설명 텍스트',
  status: 'TODO',
  priority: 'HIGH',
  position: 0,
  plannedStartDate: '2026-06-01',
  dueDate: '2026-06-15',
  startedAt: null,
  completedAt: null,
  createdAt: new Date('2026-02-17'),
  updatedAt: new Date('2026-02-17'),
  isOverdue: false,
};

// ── 공통 mock ─────────────────────────────────────────────────────────────────
const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

// ── 테스트 ─────────────────────────────────────────────────────────────────────
describe('TC-COMP-004: TicketForm', () => {

  // C004-1 ───────────────────────────────────────────────────────────────────
  it('C004-1: 생성 모드에서 빈 필드, 우선순위 MEDIUM 기본값으로 렌더링된다', () => {
    render(
      <TicketForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByLabelText('제목')).toHaveValue('');
    expect(screen.getByLabelText('설명')).toHaveValue('');
    expect(screen.getByLabelText('우선순위')).toHaveValue('MEDIUM');
    expect(screen.getByLabelText('시작예정일')).toHaveValue('');
    expect(screen.getByLabelText('종료예정일')).toHaveValue('');
  });

  // C004-2 ───────────────────────────────────────────────────────────────────
  it('C004-2: 수정 모드에서 initialData가 각 필드에 반영된다', () => {
    render(
      <TicketForm
        mode="edit"
        initialData={editTicket}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('제목')).toHaveValue('기존 티켓 제목');
    expect(screen.getByLabelText('설명')).toHaveValue('기존 설명 텍스트');
    expect(screen.getByLabelText('우선순위')).toHaveValue('HIGH');
    expect(screen.getByLabelText('시작예정일')).toHaveValue('2026-06-01');
    expect(screen.getByLabelText('종료예정일')).toHaveValue('2026-06-15');
  });

  // C004-3 ───────────────────────────────────────────────────────────────────
  it('C004-3: 빈 제목으로 제출하면 "제목을 입력해주세요" 에러가 표시된다', async () => {
    const user = userEvent.setup();

    render(
      <TicketForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    await user.click(screen.getByRole('button', { name: '생성' }));

    await waitFor(() => {
      expect(screen.getByText('제목을 입력해주세요')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // C004-4 ───────────────────────────────────────────────────────────────────
  it('C004-4: 과거 종료예정일 입력 시 "종료예정일은 오늘 이후 날짜를 선택해주세요" 에러가 표시된다', async () => {
    const user = userEvent.setup();

    render(
      <TicketForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    await user.type(screen.getByLabelText('제목'), '테스트 티켓');
    await user.type(screen.getByLabelText('종료예정일'), '2020-01-01');
    await user.click(screen.getByRole('button', { name: '생성' }));

    await waitFor(() => {
      expect(
        screen.getByText('종료예정일은 오늘 이후 날짜를 선택해주세요')
      ).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // C004-5 ───────────────────────────────────────────────────────────────────
  it('C004-5: 시작예정일 date input이 렌더링된다', () => {
    render(
      <TicketForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const input = screen.getByLabelText('시작예정일');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'date');
  });

  // C004-6 ───────────────────────────────────────────────────────────────────
  it('C004-6: 정상 제출 시 onSubmit이 입력 데이터와 함께 호출된다', async () => {
    const user = userEvent.setup();

    render(
      <TicketForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    await user.type(screen.getByLabelText('제목'), '새 티켓 제목');
    await user.type(screen.getByLabelText('설명'), '티켓 설명입니다');
    await user.selectOptions(screen.getByLabelText('우선순위'), 'HIGH');
    await user.type(screen.getByLabelText('시작예정일'), '2026-07-01');
    await user.type(screen.getByLabelText('종료예정일'), '2026-07-15');
    await user.click(screen.getByRole('button', { name: '생성' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: '새 티켓 제목',
        description: '티켓 설명입니다',
        priority: 'HIGH',
        plannedStartDate: '2026-07-01',
        dueDate: '2026-07-15',
      });
    });
  });

  // C004-7 ───────────────────────────────────────────────────────────────────
  it('C004-7: isLoading=true이면 제출 버튼이 "처리중..." 텍스트로 비활성화된다', () => {
    render(
      <TicketForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const submitBtn = screen.getByRole('button', { name: '처리중...' });
    expect(submitBtn).toBeDisabled();
  });
});
