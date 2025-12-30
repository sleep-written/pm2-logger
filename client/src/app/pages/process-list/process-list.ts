import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { PM2Process } from './pm2-process.js';
import { Service } from './service.js';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-process-list',
  imports: [
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './process-list.html',
  styleUrl: './process-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessList implements OnInit {
  service = inject(Service);
  list = signal<PM2Process[]>([]);

  async ngOnInit(): Promise<void> {
    await this.service
      .get()
      .then(x => this.list.set(x));
  }
}
