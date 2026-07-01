import { browser } from 'wxt/browser';
import { deepToRaw } from '@/helpers/vue-helper';

export class StorageService {
  async setLocal(items: Record<string, any>): Promise<void> {
    const rawItems = this.prepareItems(items);
    await browser.storage.local.set(rawItems);
  }

  async setSession(items: Record<string, any>): Promise<void> {
    const rawItems = this.prepareItems(items);
    await browser.storage.session.set(rawItems);
  }

  private prepareItems(items: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in items) {
      result[key] = deepToRaw(items[key]);
    }
    return result;
  }

  async getLocal(key: string | string[] | Record<string, any> | null): Promise<any> {
    return await browser.storage.local.get(key);
  }

  async getSession(key: string | string[] | Record<string, any> | null): Promise<any> {
    return await browser.storage.session.get(key);
  }
}

export const storageService = new StorageService();
