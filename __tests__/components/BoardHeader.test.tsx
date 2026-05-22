/**
 * TC-COMP-007: BoardHeader 컴포넌트 테스트
 * 관련 US: US-001 (새 업무 생성 진입점)
 *
 * Props: onCreateClick(() => void)
 * CSS:   .board-header  .board-title  .search-input
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoardHeader } from '@/client/components/board/BoardHeader';

// ── 공통 mock ─────────────────────────────────────────────────────────────────
const mockOnCreateClick = jest.fn();

beforeEach(() => jest.clearAllMocks());

// ── 테스트 ─────────────────────────────────────────────────────────────────────
describe('TC-COMP-007: BoardHeader', () => {

  // C007-1 ───────────────────────────────────────────────────────────────────
  it('C007-1: "Tika" 타이틀이 .board-title 클래스와 함께 렌더링된다', () => {
    const { container } = render(<BoardHeader onCreateClick={mockOnCreateClick} />);

    expect(screen.getByText('Tika')).toBeInTheDocument();
    expect(container.querySelector('.board-title')).toHaveTextContent('Tika');
  });

  // C007-2 ───────────────────────────────────────────────────────────────────
  it('C007-2: 검색 input이 .search-input 클래스와 disabled 속성으로 렌더링된다', () => {
    const { container } = render(<BoardHeader onCreateClick={mockOnCreateClick} />);

    const searchInput = container.querySelector('.search-input') as HTMLInputElement;
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toBeDisabled();
  });

  // C007-3 ───────────────────────────────────────────────────────────────────
  it('C007-3: "새 업무" 버튼이 렌더링된다', () => {
    render(<BoardHeader onCreateClick={mockOnCreateClick} />);

    expect(screen.getByRole('button', { name: '새 업무' })).toBeInTheDocument();
  });

  // C007-4 ───────────────────────────────────────────────────────────────────
  it('C007-4: "새 업무" 버튼 클릭 시 onCreateClick이 호출된다', async () => {
    const user = userEvent.setup();
    render(<BoardHeader onCreateClick={mockOnCreateClick} />);

    await user.click(screen.getByRole('button', { name: '새 업무' }));

    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });
});
