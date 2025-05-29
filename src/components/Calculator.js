'use client';

import { useState } from 'react';
import { BackspaceIcon, PlusIcon, MinusIcon, XMarkIcon, CalculatorIcon } from '@heroicons/react/24/outline';

const Calculator = ({ onCalculate, initialValue = '' }) => {
  const [display, setDisplay] = useState(initialValue || '0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : firstValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
      onCalculate(newValue);
    } else {
      onCalculate(parseFloat(display));
    }
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div className="bg-secondary/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <CalculatorIcon className="h-5 w-5" />
        <span className="font-medium">Calculator</span>
      </div>
      
      {/* Display */}
      <div className="bg-background border border-border rounded-lg p-4 mb-4">
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            {previousValue !== null && operation && `${previousValue} ${operation}`}
          </div>
          <div className="text-2xl font-mono font-bold">
            {parseFloat(display).toLocaleString(undefined, {
              minimumFractionDigits: display.includes('.') ? display.split('.')[1].length : 0,
              maximumFractionDigits: display.includes('.') ? display.split('.')[1].length : 0
            })}
          </div>
        </div>
      </div>      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {/* First Row */}
        <button
          type="button"
          onClick={clear}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          C
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
        >
          <BackspaceIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => performOperation('÷')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors"
        >
          ÷
        </button>
        <button
          type="button"
          onClick={() => performOperation('×')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors"
        >
          ×
        </button>        {/* Second Row */}
        <button
          type="button"
          onClick={() => inputDigit(7)}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => inputDigit(8)}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => inputDigit(9)}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => performOperation('-')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors"
        >
          -
        </button>

        {/* Third Row */}
        <button
          type="button"
          onClick={() => inputDigit(4)}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => inputDigit(5)}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => inputDigit(6)}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => performOperation('+')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors"
        >
          +
        </button>

        {/* Fourth Row */}
        <button
          type="button"
          onClick={() => inputDigit(1)}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => inputDigit(2)}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => inputDigit(3)}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors"
        >
          3
        </button>
        <button
          type="button"
          onClick={handleEquals}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors row-span-2"
        >
          =
        </button>

        {/* Fifth Row */}
        <button
          type="button"
          onClick={() => inputDigit(0)}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors col-span-2"
        >
          0
        </button>
        <button
          type="button"
          onClick={inputDecimal}
          className="bg-secondary hover:bg-secondary/80 font-semibold py-3 rounded-lg transition-colors"
        >
          .
        </button>
      </div>
    </div>
  );
};

export default Calculator;
