'use client';

import { useState } from 'react';
import { Button } from '@/client/components/ui/Button';
import { PriorityBadge, DueDateBadge } from '@/client/components/ui/Badge';
import { Modal } from '@/client/components/ui/Modal';
import { ConfirmDialog } from '@/client/components/ui/ConfirmDialog';
import { TicketCard } from '@/client/components/ticket/TicketCard';
import { TicketDetailView } from '@/client/components/ticket/TicketDetailView';
import { TicketForm } from '@/client/components/ticket/TicketForm';
import { TicketModal } from '@/client/components/ticket/TicketModal';
import { ColumnHeader } from '@/client/components/board/ColumnHeader';
import { BoardHeader } from '@/client/components/board/BoardHeader';
import { FilterBar } from '@/client/components/board/FilterBar';
import type { TicketWithMeta } from '@/shared/types';

// ── Mock Data ──────────────────────────────────────────────────────────────────
const mockTicket: TicketWithMeta = {
  id: 1,
  title: '칸반 보드 UI 구현',
  description: '드래그 앤 드롭 기능 포함한 칸반 보드를 구현합니다',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  position: 1024,
  plannedStartDate: '2026-05-01',
  dueDate: '2026-05-31',
  startedAt: new Date('2026-05-10T00:00:00.000Z'),
  completedAt: null,
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z'),
  isOverdue: false,
};

const mockOverdueTicket: TicketWithMeta = {
  id: 2,
  title: '로그인 페이지 구현',
  description: 'OAuth2 소셜 로그인 연동',
  status: 'TODO',
  priority: 'MEDIUM',
  position: 2048,
  plannedStartDate: null,
  dueDate: '2026-05-01',
  startedAt: null,
  completedAt: null,
  createdAt: new Date('2026-04-20T00:00:00.000Z'),
  updatedAt: new Date('2026-04-20T00:00:00.000Z'),
  isOverdue: true,
};

// ── Layout helpers ─────────────────────────────────────────────────────────────
function Section({ phase, title, tags, children }: {
  phase: number;
  title: string;
  tags: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
          background: phase <= 1 ? '#dbeafe' : phase === 2 ? '#dcfce7' : phase === 3 ? '#fef9c3' : '#ede9fe',
          color: phase <= 1 ? '#1d4ed8' : phase === 2 ? '#15803d' : phase === 3 ? '#a16207' : '#6d28d9',
          borderRadius: 999, fontSize: 12, fontWeight: 700,
        }}>
          Phase {phase}
        </span>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h2>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{tags}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {children}
      </div>
    </section>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0',
      padding: 20, boxShadow: '0 1px 3px rgba(9,30,66,.08)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      {children}
    </div>
  );
}

// ── Phase 1 ────────────────────────────────────────────────────────────────────
function Phase1Section() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmResult, setConfirmResult] = useState('');

  return (
    <Section phase={1} title="UI 기본 컴포넌트" tags="Button · Badge · Modal · ConfirmDialog">
      <Card title="Button — Variants">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>

      <Card title="Button — Size & isLoading">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" isLoading>처리중...</Button>
          <Button size="md" isLoading>처리중...</Button>
          <Button size="lg" isLoading>처리중...</Button>
        </div>
      </Card>

      <Card title="Badge — 우선순위">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <PriorityBadge priority="LOW" />
          <PriorityBadge priority="MEDIUM" />
          <PriorityBadge priority="HIGH" />
        </div>
      </Card>

      <Card title="Badge — 종료예정일">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DueDateBadge dueDate="2026-12-31" isOverdue={false} />
          <DueDateBadge dueDate="2025-01-01" isOverdue={true} />
          <span style={{ fontSize: 11, color: '#9ca3af' }}>세 번째: dueDate=null → 미렌더링</span>
          <DueDateBadge dueDate={null} isOverdue={false} />
        </div>
      </Card>

      <Card title="Modal — 열기 / 닫기">
        <Button variant="primary" onClick={() => setModalOpen(true)}>모달 열기</Button>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="modal-header">
            <h2>모달 제목</h2>
          </div>
          <div className="modal-body">
            <p style={{ fontSize: 12, color: '#4b5563' }}>모달 내용입니다. ESC 키 또는 바깥 클릭으로 닫을 수 있습니다.</p>
          </div>
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>취소</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>확인</Button>
          </div>
        </Modal>
      </Card>

      <Card title="ConfirmDialog — 삭제 확인">
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>삭제 확인 열기</Button>
        {confirmResult && (
          <p style={{ marginTop: 10, fontSize: 12, color: '#4b5563' }}>결과: <strong>{confirmResult}</strong></p>
        )}
        <ConfirmDialog
          isOpen={confirmOpen}
          message="정말 삭제하시겠습니까?"
          onConfirm={() => { setConfirmOpen(false); setConfirmResult('확인 클릭'); }}
          onCancel={() => { setConfirmOpen(false); setConfirmResult('취소 클릭'); }}
        />
      </Card>
    </Section>
  );
}

// ── Phase 2 ────────────────────────────────────────────────────────────────────
function Phase2Section() {
  const [selectedTicket, setSelectedTicket] = useState<TicketWithMeta | null>(null);

  return (
    <Section phase={2} title="Board 컴포넌트" tags="TicketCard · ColumnHeader · FilterBar · BoardHeader">
      <Card title="TicketCard — 일반">
        <TicketCard ticket={mockTicket} onClick={() => setSelectedTicket(mockTicket)} />
      </Card>

      <Card title="TicketCard — Overdue">
        <TicketCard ticket={mockOverdueTicket} onClick={() => setSelectedTicket(mockOverdueTicket)} />
      </Card>

      <Card title="ColumnHeader — 4 상태">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#f1f2f4', borderRadius: 8, overflow: 'hidden' }}>
          {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map(status => (
            <div key={status} style={{ background: status === 'BACKLOG' ? '#f5f3ff' : status === 'TODO' ? '#fefce8' : status === 'IN_PROGRESS' ? '#eff6ff' : '#f0fdf4' }}>
              <ColumnHeader title={status} count={status === 'TODO' ? 2 : 1} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="BoardHeader">
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          <BoardHeader onCreateClick={() => alert('새 업무 클릭!')} />
        </div>
      </Card>

      <Card title="FilterBar">
        <FilterBarPreview />
      </Card>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          onUpdate={(id, data) => { console.log('update', id, data); setSelectedTicket(null); }}
          onDelete={(id) => { console.log('delete', id); setSelectedTicket(null); }}
        />
      )}
    </Section>
  );
}

function FilterBarPreview() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'thisWeek' | 'overdue'>('all');
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={{ thisWeek: 2, overdue: 1 }}
      />
    </div>
  );
}

// ── Phase 3 ────────────────────────────────────────────────────────────────────
function Phase3Section() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [submitResult, setSubmitResult] = useState('');

  return (
    <Section phase={3} title="Ticket 컴포넌트" tags="TicketDetailView · TicketForm · TicketModal">
      <Card title="TicketDetailView">
        <TicketDetailView ticket={mockTicket} />
      </Card>

      <Card title="TicketForm — create 모드">
        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>티켓 생성 열기</Button>
        {submitResult && (
          <pre style={{ marginTop: 10, fontSize: 11, background: '#f8fafc', padding: 8, borderRadius: 6, overflow: 'auto', color: '#374151' }}>
            {submitResult}
          </pre>
        )}
        <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}>
          <div className="modal-header">
            <h2>새 업무 생성</h2>
          </div>
          <div className="modal-body">
            <TicketForm
              mode="create"
              onSubmit={(data) => {
                setSubmitResult(JSON.stringify(data, null, 2));
                setCreateModalOpen(false);
              }}
              onCancel={() => setCreateModalOpen(false)}
            />
          </div>
        </Modal>
      </Card>

      <Card title="TicketModal — 티켓 상세 / 수정 / 삭제">
        <Button variant="secondary" onClick={() => setTicketModalOpen(true)}>티켓 모달 열기</Button>
        <TicketModal
          ticket={mockTicket}
          isOpen={ticketModalOpen}
          onClose={() => setTicketModalOpen(false)}
          onUpdate={(id, data) => { console.log('updated', id, data); setTicketModalOpen(false); }}
          onDelete={(id) => { console.log('deleted', id); setTicketModalOpen(false); }}
        />
      </Card>
    </Section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PreviewPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f2f4',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* 갤러리 헤더 */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Tika</span>
        <span style={{ fontSize: 14, color: '#6b7280' }}>컴포넌트 갤러리</span>
        <a
          href="/"
          style={{
            marginLeft: 'auto', fontSize: 12, color: '#2563eb', textDecoration: 'none',
            padding: '6px 14px', border: '1px solid #2563eb', borderRadius: 6,
          }}
        >
          ← 보드로 이동
        </a>
      </div>

      {/* 컨텐츠 */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px 80px' }}>
        <Phase1Section />
        <Phase2Section />
        <Phase3Section />
      </div>
    </div>
  );
}
