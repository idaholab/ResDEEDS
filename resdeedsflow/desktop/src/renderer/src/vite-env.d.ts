/// <reference types="vite/client" />

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send(channel: string, ...args: any[]): void;
        on(channel: string, func: (...args: any[]) => void): void;
        once(channel: string, func: (...args: any[]) => void): void;
        removeListener(channel: string, func: (...args: any[]) => void): void;
        removeAllListeners(channel: string): void;
        invoke(channel: string, ...args: any[]): Promise<any>;
      };
      platform: string;
    };
  }
}

export {};