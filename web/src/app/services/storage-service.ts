import { inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE } from '../tokens';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage = inject(LOCAL_STORAGE);
  setItem(key: string, value: any): void {
    this.storage.setItem(key, JSON.stringify(value));
  }
  getItem<T>(key: string): T | null {
    const storedValue = this.storage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : null;
  }
  removeItem(key: string): void {
    this.storage.removeItem(key);
  }
}