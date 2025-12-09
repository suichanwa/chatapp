import React, { useState } from 'react';
import './PasscodeScreen.css';

interface PasscodeScreenProps {
  onUnlock: () => void;
  onCancel: () => void;
}

const DEFAULT_PASSCODE = '1234'; // TODO: Make configurable

export const PasscodeScreen: React.FC<PasscodeScreenProps> = ({ onUnlock, onCancel }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (passcode.length < 4) {
      const newPasscode = passcode + digit;
      setPasscode(newPasscode);

      if (newPasscode.length === 4) {
        setTimeout(() => {
          if (newPasscode === DEFAULT_PASSCODE) {
            onUnlock();
          } else {
            setError(true);
            setPasscode('');
            setTimeout(() => setError(false), 500);
          }
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    setPasscode(passcode.slice(0, -1));
  };

  return (
    <div className="passcode-screen">
      <button onClick={onCancel} className="cancel-btn">Cancel</button>
      
      <div className="passcode-header">
        <h2>Enter Passcode</h2>
        <p className="passcode-hint">Shake device to unlock hidden app</p>
      </div>

      <div className={`passcode-dots ${error ? 'error' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`dot ${i < passcode.length ? 'filled' : ''}`} />
        ))}
      </div>

      {error && <p className="error-message">Incorrect passcode</p>}

      <div className="passcode-keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} onClick={() => handleDigit(num.toString())} className="keypad-btn">
            {num}
          </button>
        ))}
        <button className="keypad-btn empty" disabled />
        <button onClick={() => handleDigit('0')} className="keypad-btn">0</button>
        <button onClick={handleDelete} className="keypad-btn delete">⌫</button>
      </div>
    </div>
  );
};