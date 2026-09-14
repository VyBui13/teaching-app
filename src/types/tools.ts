export interface Student {
  id: string;
  name: string;
  selectedCount: number;
}

export interface TimerState {
  isOpen: boolean;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: 'countdown' | 'stopwatch';
  initialSeconds: number;
}

export interface BlackboardState {
  isOpen: boolean;
  theme: 'dark' | 'green' | 'white';
}
