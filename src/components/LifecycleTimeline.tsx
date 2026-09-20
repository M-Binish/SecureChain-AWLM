import React, { useState } from 'react';
import { LifecycleEvent, LifecycleStage } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  Factory,
  ArrowRightLeft,
  ShieldCheck,
  Activity,
  ClipboardCheck,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Clock,
  Info,
  Hash,
  User,
} from 'lucide-react';

interface LifecycleTimelineProps {
  events: LifecycleEvent[];
  currentStatus: string;
}

const STAGES: {
  stage: LifecycleStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  recurring?: boolean;
  conditional?: boolean;
  terminal?: boolean;
}[] = [
  {
    stage: 'Manufacturing & Certification',
    label: '1. Manufacturing & Certification',
    icon: Factory,
    description: 'Hardware enrollment, baseline attestation, and autonomous safety certification.',
  },
  {
    stage: 'Ownership Transfer',
    label: '2. Ownership Transfer',
    icon: ArrowRightLeft,
    description: 'Custody handoff and physical tamper-seal verification across the supply chain.',
  },
  {
    stage: 'Deployment Authorization',
    label: '3. Deployment Authorization',
    icon: ShieldCheck,
    description: 'Sovereign statutory clearance and operational bounds authorization.',
  },
  {
    stage: 'Usage Tracking',
    label: '4. Usage Tracking',
    icon: Activity,
    description: 'Active operational rotations. Multiple operational cycles are recorded over lifespan.',
    recurring: true,
  },
  {
    stage: 'Audit & Compliance',
    label: '5. Audit & Compliance',
    icon: ClipboardCheck,
    description: 'Periodic independent inspection of firmware signatures, telemetry, and logs.',
    recurring: true,
  },
  {
    stage: 'Incident Reporting',
    label: '6. Incident Reporting',
    icon: AlertTriangle,
    description: 'Exception reporting for anomalous telemetry, override delays, or safety breaches.',
    conditional: true,
  },
  {
    stage: 'Disposal',
    label: '7. Disposal',
    icon: Trash2,
    description: 'Demilitarization, physical destruction, and permanent cryptographic zeroization.',
    terminal: true,
  },
];

export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({
  events,
  currentStatus,
}) => {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    events.length > 0 ? events[events.length - 1].id : null
  );

  // Calculate statistics across events
  const stageCounts = events.reduce((acc, evt) => {
    acc[evt.stage] = (acc[evt.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hasIncidents = events.some(
    (e) => e.stage === 'Incident Reporting' && e.status === 'Flagged'
  );

  const filteredEvents =
    filterStage === 'all'
      ? events
      : events.filter((e) => e.stage === filterStage);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[events.length - 1];

  return (
    <div className="space-y-6">
      {/* Visual Lifecycle Pipeline Guide */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Autonomous Weapon Lifecycle Stages (Consortium Standard)
            </h4>
            <p className="text-xs text-slate-500">
              Simulated sequence model based on IEEE governance principles. Usage & Audit are recurrent; Incidents are recorded conditionally.
            </p>
          </div>
          <span className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded text-slate-600 font-medium">
            Current Status: <strong className="text-slate-900">{currentStatus}</strong>
          </span>
        </div>

        {/* Pipeline Step Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {STAGES.map((s) => {
            const count = stageCounts[s.stage] || 0;
            const Icon = s.icon;
            const isFilterActive = filterStage === s.stage;

            return (
              <button
                key={s.stage}
                type="button"
                onClick={() => setFilterStage(filterStage === s.stage ? 'all' : s.stage)}
                className={`p-2.5 rounded border text-left flex flex-col justify-between transition-all ${
                  isFilterActive
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                    : count > 0
                    ? 'border-slate-300 bg-white hover:border-slate-400'
                    : 'border-dashed border-slate-200 bg-slate-100/50 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-slate-700 mb-1.5">
                    <Icon className="w-4 h-4" />
                    {count > 0 ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                        {count} {count === 1 ? 'log' : 'logs'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">0</span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 truncate">{s.label.split('. ')[1]}</div>
                </div>

                <div className="mt-2 text-[10px] text-slate-500 flex flex-wrap gap-1">
                  {s.recurring && (
                    <span className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded border border-slate-200">
                      Recurrent
                    </span>
                  )}
                  {s.conditional && (
                    <span className="bg-amber-50 text-amber-700 px-1 py-0.2 rounded border border-amber-200">
                      Conditional
                    </span>
                  )}
                  {s.terminal && (
                    <span className="bg-purple-50 text-purple-700 px-1 py-0.2 rounded border border-purple-200">
                      Terminal
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Clear */}
      {filterStage !== 'all' && (
        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-200 px-3 py-2 rounded text-xs text-blue-800">
          <span>
            Filtering timeline for stage: <strong>{filterStage}</strong> ({filteredEvents.length} events found)
          </span>
          <button
            type="button"
            onClick={() => setFilterStage('all')}
            className="font-medium underline hover:text-blue-950 cursor-pointer"
          >
            Show All Stages
          </button>
        </div>
      )}

      {/* Main Two-Column View: Event Stream on Left, Inspected Record on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Event List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recorded Lifecycle Events ({filteredEvents.length})
            </h5>
            <span className="text-xs text-slate-500">Select any event to inspect digital record</span>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-3 pl-5 space-y-4">
            {filteredEvents.map((evt) => {
              const isSelected = evt.id === selectedEvent?.id;
              const isFlagged = evt.status === 'Flagged';
              const isCompleted = evt.status === 'Completed';

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`relative cursor-pointer p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/20 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Timeline Dot */}
                  <span
                    className={`absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                      isFlagged
                        ? 'border-rose-600 bg-rose-500'
                        : isCompleted
                        ? 'border-emerald-600 bg-emerald-500'
                        : 'border-blue-600 bg-blue-500'
                    }`}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{evt.stage}</span>
                      {evt.iteration && (
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          Cycle #{evt.iteration}
                        </span>
                      )}
                      {evt.isConditional && (
                        <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                          Conditional Log
                        </span>
                      )}
                    </div>
                    <StatusBadge status={evt.status} size="sm" />
                  </div>

                  <div className="text-sm font-medium text-slate-900 mb-1">{evt.title}</div>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-2">{evt.details}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>
                        {evt.actor} <span className="text-slate-400">({evt.actorRole})</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{evt.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Event Deep-Dive Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Digital Record Inspector
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedEvent ? selectedEvent.stage : 'No Event Selected'}
                </h4>
              </div>
              {selectedEvent && <StatusBadge status={selectedEvent.status} size="sm" />}
            </div>

            {selectedEvent ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="text-slate-500 font-medium mb-0.5">Record Identifier</div>
                  <div className="font-mono bg-slate-100 text-slate-800 p-2 rounded border border-slate-200 break-all flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{selectedEvent.recordIdentifier}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 font-medium mb-0.5">Event Description</div>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
                    {selectedEvent.details}
                  </p>
                </div>

                {selectedEvent.notes && (
                  <div>
                    <div className="text-amber-700 font-medium mb-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Compliance & Investigation Note</span>
                    </div>
                    <p className="text-amber-900 bg-amber-50 p-2.5 rounded border border-amber-200 leading-relaxed">
                      {selectedEvent.notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="text-slate-500 font-medium mb-0.5">Authorizing Actor</div>
                    <div className="text-slate-900 font-medium">{selectedEvent.actor}</div>
                    <div className="text-slate-500 text-[11px]">{selectedEvent.actorRole}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium mb-0.5">Recorded Timestamp</div>
                    <div className="text-slate-900">{selectedEvent.timestamp}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-start gap-2 text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] leading-relaxed">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-700">Digital Record Traceability:</strong> Application-level lifecycle audit record stored in local application state.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Select an event from the timeline stream to inspect details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
