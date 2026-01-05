import { Component, input } from '@angular/core';

import { PM2Process } from '../pm2-process.js';

@Component({
  selector: 'app-event-log',
  standalone: true,
  imports: [],
  templateUrl: './event-log.html',
  styleUrl: './event-log.scss',
})
export class EventLog {
  process = input.required<PM2Process>();
}
