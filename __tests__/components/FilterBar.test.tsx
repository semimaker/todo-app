/**
 * TC-COMP-008: FilterBar 컴포넌트 테스트
 * 관련 US: US-005 (이번주 업무 필터), US-006 (일정 초과 필터)
 *
 * Props: activeFilter('all'|'thisWeek'|'overdue'), onFilterChange, counts({thisWeek, overdue})
 * CSS:   .filter-bar  .filter-btn[data-active]  .filter-count
 * 동작:  활성 필터 재클릭 → 'all' 토글
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/client/components/board/FilterBar';

// ── 공통 props ────────────────────────────────────────────────────────────────
const mockOnFilterChange = jest.fn();

const defaultProps = {
  activeFilter: 'all' as const,
  onFilterChange: mockOnFilterChange,
  counts: { thisWeek: 3, overdue: 2 },
};

beforeEach(() => jest.clearAllMocks());

// ── 테스트 ─────────────────────────────────────────────────────────────────────
describe('TC-COMP-008: FilterBar', () => {

  // C008-1 ───────────────────────────────────────────────────────────────────
  it('C008-1: "이번주 업무" 버튼과 thisWeek 카운트가 .filter-count 클래스로 렌더링된다', () => {
    const { container } = render(<FilterBar {...defaultProps} />);

    expect(screen.getByText('이번주 업무')).toBeInTheDocument();

    const counts = container.querySelectorAll('.filter-count');
    expect(counts[0]).toHaveTextContent('3');
  });

  // C008-2 ───────────────────────────────────────────────────────────────────
  it('C008-2: "일정 초과" 버튼과 overdue 카운트가 .filter-count 클래스로 렌더링된다', () => {
    const { container } = render(<FilterBar {...defaultProps} />);

    expect(screen.getByText('일정 초과')).toBeInTheDocument();

    const counts = container.querySelectorAll('.filter-count');
    expect(counts[1]).toHaveTextContent('2');
  });

  // C008-3 ───────────────────────────────────────────────────────────────────
  it('C008-3: "이번주 업무" 클릭 시 onFilterChange("thisWeek")이 호출된다', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /이번주 업무/ }));

    expect(mockOnFilterChange).toHaveBeenCalledWith('thisWeek');
  });

  // C008-4 ───────────────────────────────────────────────────────────────────
  it('C008-4: "일정 초과" 클릭 시 onFilterChange("overdue")이 호출된다', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /일정 초과/ }));

    expect(mockOnFilterChange).toHaveBeenCalledWith('overdue');
  });

  // C008-5 ───────────────────────────────────────────────────────────────────
  it('C008-5: activeFilter="overdue" 이면 "일정 초과" 버튼에만 data-active="true" 가 적용된다', () => {
    render(<FilterBar {...defaultProps} activeFilter="overdue" />);

    const overdueBtn  = screen.getByRole('button', { name: /일정 초과/ });
    const thisWeekBtn = screen.getByRole('button', { name: /이번주 업무/ });

    expect(overdueBtn).toHaveAttribute('data-active', 'true');
    expect(thisWeekBtn).not.toHaveAttribute('data-active');
  });

  // C008-6 ───────────────────────────────────────────────────────────────────
  it('C008-6: 이미 활성화된 필터를 재클릭하면 onFilterChange("all")이 호출된다 (토글)', async () => {
    const user = userEvent.setup();
    render(<FilterBar {...defaultProps} activeFilter="thisWeek" />);

    await user.click(screen.getByRole('button', { name: /이번주 업무/ }));

    expect(mockOnFilterChange).toHaveBeenCalledWith('all');
  });
});
