import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { PM2Process } from './pm2-process.js';

@Injectable({
  providedIn: 'root',
})
export class Service {
  #httpClient = inject(HttpClient);

  get(): Promise<PM2Process[]> {
    const obs = this.#httpClient.get<PM2Process[]>('/api/pm2');
    return firstValueFrom(obs);
  }
}
