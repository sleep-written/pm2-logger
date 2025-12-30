import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Service } from './service.js';
import { PM2Process } from './pm2-process.js';

@Component({
  selector: 'app-process-list',
  imports: [],
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
