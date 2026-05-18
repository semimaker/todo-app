import type { TicketPriority } from '@/shared/types';

// ── PriorityBadge ────────────────────────────────────────────────────────────

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: '낮음',
  MEDIUM: '보통',
  HIGH: '높음',
};

const PRIORITY_CSS: Record<TicketPriority, string> = {
  LOW: 'badge badge-priority-low',
  MEDIUM: 'badge badge-priority-medium',
  HIGH: 'badge badge-priority-high',
};

interface PriorityBadgeProps {
  priority: TicketPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={PRIORITY_CSS[priority]}
      data-priority={priority}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

// ── DueDateBadge ─────────────────────────────────────────────────────────────

interface DueDateBadgeProps {
  dueDate: string | null;
  isOverdue: boolean;
}

export function DueDateBadge({ dueDate, isOverdue }: DueDateBadgeProps) {
  if (!dueDate) return null;

  return (
    <span
      className="badge badge-due-date"
      data-overdue={isOverdue ? 'true' : undefined}
    >
      {dueDate}
    </span>
  );
}
