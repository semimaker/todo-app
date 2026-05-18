'use client';

const COLUMN_CONFIG: Record<string, { label: string; dot: string }> = {
  BACKLOG:     { label: '백로그',  dot: '#8B7EC8' },
  TODO:        { label: '할 일',  dot: '#F59E0B' },
  IN_PROGRESS: { label: '진행 중', dot: '#3B82F6' },
  DONE:        { label: '완료',   dot: '#22C55E' },
};

interface ColumnHeaderProps {
  title: string;
  count: number;
}

export function ColumnHeader({ title, count }: ColumnHeaderProps) {
  const config = COLUMN_CONFIG[title] ?? { label: title, dot: '#9CA3AF' };
  return (
    <div className="column-header">
      <div className="column-header-left">
        <span className="column-status-dot" style={{ backgroundColor: config.dot }} />
        <span className="column-title">{config.label}</span>
      </div>
      <span className="column-count">{count}</span>
    </div>
  );
}
