import React, { useState, useEffect } from 'react';
import { PasscodeScreen } from './PasscodeScreen';
import './DecoyNotesApp.css';

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

interface DecoyNotesAppProps {
  onUnlock: () => void;
}

export const DecoyNotesApp: React.FC<DecoyNotesAppProps> = ({ onUnlock }) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Grocery List',
      content: 'Milk, Eggs, Bread, Butter, Cheese, Yogurt',
      timestamp: Date.now() - 86400000
    },
    {
      id: '2',
      title: 'Meeting Notes',
      content: 'Discuss project timeline and deliverables for Q1',
      timestamp: Date.now() - 172800000
    },
    {
      id: '3',
      title: 'Ideas',
      content: 'Weekend trip ideas, movie recommendations',
      timestamp: Date.now() - 259200000
    }
  ]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [showPasscode, setShowPasscode] = useState(false);
  const [lastShakeTime, setLastShakeTime] = useState(0);

  useEffect(() => {
    // Detect shake gesture
    const handleShake = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const now = Date.now();
      if (now - lastShakeTime < 500) return; // Debounce

      const { x, y, z } = acceleration;
      const total = Math.abs(x || 0) + Math.abs(y || 0) + Math.abs(z || 0);

      if (total > 40) {
        setLastShakeTime(now);
        setShakeCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            setShowPasscode(true);
            return 0;
          }
          return newCount;
        });

        // Reset shake count after 2 seconds
        setTimeout(() => setShakeCount(0), 2000);
      }
    };

    window.addEventListener('devicemotion', handleShake as EventListener);
    return () => window.removeEventListener('devicemotion', handleShake as EventListener);
  }, [lastShakeTime]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      timestamp: Date.now()
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  if (showPasscode) {
    return <PasscodeScreen onUnlock={onUnlock} onCancel={() => setShowPasscode(false)} />;
  }

  return (
    <div className="decoy-notes-app">
      <header className="notes-header">
        <h1>📝 Notes</h1>
        <button onClick={createNote} className="new-note-btn">+</button>
      </header>

      {selectedNote ? (
        <div className="note-editor">
          <div className="editor-toolbar">
            <button onClick={() => setSelectedNote(null)} className="back-btn">← Back</button>
            <button onClick={() => deleteNote(selectedNote.id)} className="delete-note-btn">
              🗑️
            </button>
          </div>
          <input
            type="text"
            className="note-title"
            value={selectedNote.title}
            onChange={(e) => {
              const updated = { ...selectedNote, title: e.target.value };
              setSelectedNote(updated);
              setNotes(notes.map(n => n.id === updated.id ? updated : n));
            }}
            placeholder="Note Title"
          />
          <textarea
            className="note-content"
            value={selectedNote.content}
            onChange={(e) => {
              const updated = { ...selectedNote, content: e.target.value };
              setSelectedNote(updated);
              setNotes(notes.map(n => n.id === updated.id ? updated : n));
            }}
            placeholder="Start typing..."
          />
        </div>
      ) : (
        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="empty-state">
              <p>No notes yet</p>
              <p>Tap + to create your first note</p>
            </div>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                className="note-item"
                onClick={() => setSelectedNote(note)}
              >
                <h3>{note.title}</h3>
                <p>{note.content.substring(0, 60)}{note.content.length > 60 ? '...' : ''}</p>
                <span className="note-date">
                  {new Date(note.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};