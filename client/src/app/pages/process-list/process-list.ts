import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { ProcessLog } from './process-log/process-log.js';
import { PM2Process } from './pm2-process.js';
import { Service } from './service.js';

@Component({
  selector: 'app-process-list',
  imports: [
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    
    ProcessLog,
  ],
  templateUrl: './process-list.html',
  styleUrl: './process-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessList implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  service = inject(Service);
  router = inject(Router);
  title = inject(Title);

  process = signal<PM2Process | undefined>(undefined);
  list = signal<PM2Process[]>([]);

  async ngOnInit(): Promise<void> {
    this.title.setTitle('Event Log');
    await this.service
      .get()
      .then(x => this.list.set(x));

    const processId = this.activatedRoute.snapshot.queryParams?.['process-id'];
    if (processId != null) {
      const parsedProcessId = parseInt(processId);
      const process = this.list().find(x => x.id === parsedProcessId);
      if (process) {
        this.onProcessClick(process);
      }
    }
  }

  onProcessClick(process: PM2Process): void {
    const selected = this.process();
    if (selected && selected.id === process.id) {
      this.title.setTitle('Event Log');
      this.process.set(undefined);
      this.router.navigate([], {
        queryParams: { }
      });
    } else {
      this.title.setTitle(`Log ${process.name}`);
      this.process.set(process);
      this.router.navigate([], {
        queryParams: { 'process-id': process.id }
      });
    }
  }
}
