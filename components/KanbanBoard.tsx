import React, { useState, useMemo, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Application, COLUMNS, ColumnId } from '../types';
import JobCard from './JobCard';
import { updateApplicationStatus } from '../services/firebase';
import { User } from 'firebase/auth';

interface KanbanBoardProps {
  initialApps: Application[];
  user: User | null;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialApps, user }) => {
  const [apps, setApps] = useState<Application[]>(initialApps);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setApps(initialApps);
  }, [initialApps]);

  const columns = useMemo(() => {
    const cols: Record<ColumnId, Application[]> = {
      Saved: [],
      Applied: [],
      Interviewing: [],
      Offer: [],
      Accepted: [],
      Rejected: []
    };
    apps.forEach(app => {
      if (cols[app.status]) {
        cols[app.status].push(app);
      }
    });
    return cols;
  }, [apps]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    const activeApp = apps.find(a => a.id === activeId);
    const overApp = apps.find(a => a.id === overId);
    
    if (!activeApp) return;

    // If over a column directly
    const overColumn = COLUMNS.find(c => c === overId);
    
    if (overColumn && activeApp.status !== overColumn) {
        setApps((items) => {
            return items.map(item => 
                item.id === activeId ? { ...item, status: overColumn } : item
            );
        });
    } else if (overApp && activeApp.status !== overApp.status) {
        // Dragging over a card in a different column
        setApps((items) => {
            return items.map(item => 
                item.id === activeId ? { ...item, status: overApp.status } : item
            );
        });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    
    setActiveId(null);
    
    if (!over) return;

    const activeApp = apps.find(a => a.id === activeId);
    if (activeApp && user) {
        // Optimistic UI update happened in DragOver, now sync to Firebase
        // Determine the final status
        let finalStatus = activeApp.status;
        
        // Ensure the local state is consistent
        // (In a real app with strict ordering, we'd use arrayMove here for sorting within column)
        
        // Sync to DB
        try {
            await updateApplicationStatus(user.uid, activeId, finalStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on error would go here
        }
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragOver={handleDragOver} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(colId => (
          <div key={colId} className="flex-shrink-0 w-72 bg-gh-bg border border-gh-border rounded-lg flex flex-col max-h-full">
            {/* Column Header */}
            <div className="p-3 border-b border-gh-border flex items-center justify-between bg-gh-card rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getColumnColor(colId)}`}></div>
                <h3 className="font-semibold text-sm text-gh-text">{colId}</h3>
              </div>
              <span className="bg-gh-border text-gh-muted text-xs px-2 py-0.5 rounded-full">
                {columns[colId].length}
              </span>
            </div>

            {/* Droppable Area */}
            <SortableContext items={columns[colId].map(a => a.id)} strategy={verticalListSortingStrategy}>
              <div className="flex-1 p-2 overflow-y-auto min-h-[100px]" id={colId}> {/* ID used for dropping on empty column */}
                {columns[colId].map(app => (
                  <JobCard key={app.id} app={app} />
                ))}
                {columns[colId].length === 0 && (
                    <div className="h-full w-full flex items-center justify-center text-gh-muted text-xs italic opacity-50 pointer-events-none">
                        Drop here
                    </div>
                )}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
           <JobCard app={apps.find(a => a.id === activeId)!} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

function getColumnColor(status: string) {
  switch (status) {
    case 'Saved': return 'bg-gray-500';
    case 'Applied': return 'bg-yellow-500';
    case 'Interviewing': return 'bg-blue-500';
    case 'Offer': return 'bg-purple-500';
    case 'Accepted': return 'bg-green-500';
    case 'Rejected': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}

export default KanbanBoard;
