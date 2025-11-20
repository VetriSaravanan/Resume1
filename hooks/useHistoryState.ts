import { useState, useCallback, useRef } from 'react';

export function useHistoryState<T>(initialState: T): [
    T,
    (newState: T | ((prev: T) => T)) => void,
    () => void,
    () => void,
    boolean,
    boolean,
    (state: T) => void
] {
    const [state, setState] = useState<T>(initialState);
    const historyRef = useRef<T[]>([initialState]);
    const pointerRef = useRef<number>(0);

    const setHistoryState = useCallback((newStateAction: T | ((prev: T) => T)) => {
        setState((currentState) => {
            const newState = typeof newStateAction === 'function' 
                ? (newStateAction as (prev: T) => T)(currentState) 
                : newStateAction;
            
            const currentPointer = pointerRef.current;
            const history = historyRef.current;

            // If we are not at the end of history, truncate future
            const newHistory = history.slice(0, currentPointer + 1);
            newHistory.push(newState);
            
            historyRef.current = newHistory;
            pointerRef.current = newHistory.length - 1;
            
            return newState;
        });
    }, []);

    const undo = useCallback(() => {
        if (pointerRef.current > 0) {
            pointerRef.current -= 1;
            setState(historyRef.current[pointerRef.current]);
        }
    }, []);

    const redo = useCallback(() => {
        if (pointerRef.current < historyRef.current.length - 1) {
            pointerRef.current += 1;
            setState(historyRef.current[pointerRef.current]);
        }
    }, []);
    
    const resetHistory = useCallback((newState: T) => {
        historyRef.current = [newState];
        pointerRef.current = 0;
        setState(newState);
    }, []);

    const canUndo = pointerRef.current > 0;
    const canRedo = pointerRef.current < historyRef.current.length - 1;

    return [state, setHistoryState, undo, redo, canUndo, canRedo, resetHistory];
}