'use client';

import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriorityBadge, DueDateBadge } from '@/client/components/ui/Badge';
import type { TicketWithMeta } from '@/shared/types';

interface TicketCardProps {
  ticket: TicketWithMeta;
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  // 드래그 발생 여부 추적 — 드래그 후 포인터 업에서 click 이벤트 억제
  const dragMoved = useRef(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  const className = [
    'ticket-card',
    ticket.status === 'DONE' ? 'ticket-card--done' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handlePointerDown = () => {
    dragMoved.current = false;
  };

  const handlePointerMove = () => {
    dragMoved.current = true;
  };

  const handleClick = () => {
    if (dragMoved.current) return;
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      data-overdue={ticket.isOverdue ? 'true' : undefined}
      data-dragging={isDragging ? 'true' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      {...attributes}
      {...listeners}
      aria-label={`티켓: ${ticket.title}`}
    >
      <div className="ticket-card-title">{ticket.title}</div>
      {ticket.description && (
        <div className="ticket-card-description">{ticket.description}</div>
      )}
      <div className="ticket-card-meta">
        <PriorityBadge priority={ticket.priority} />
        <DueDateBadge dueDate={ticket.dueDate} isOverdue={ticket.isOverdue} />
      </div>
    </div>
  );
}
