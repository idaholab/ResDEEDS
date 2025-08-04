/// <reference types="vite/client" />

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, ...args: unknown[]): void;
        on(channel: string, func: (...args: unknown[]) => void): void;
        once(channel: string, func: (...args: unknown[]) => void): void;
        removeListener(channel: string, func: (...args: unknown[]) => void): void;
        removeAllListeners(channel: string): void;
        invoke(channel: string, ...args: unknown[]): Promise<unknown>;
      };
      platform: string;
    };
  }
}

export {};