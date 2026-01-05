import { Component, effect, ElementRef, inject, input, OnDestroy, signal } from '@angular/core';
import { PM2Process } from '../pm2-process.js';

@Component({
  selector: 'app-event-log',
  standalone: true,
  imports: [],
  templateUrl: './event-log.html',
  styleUrl: './event-log.scss',
})
export class EventLog implements OnDestroy {
  #elementRef = inject<ElementRef<HTMLElement>>(ElementRef, { optional: false });
  process = input.required<PM2Process>();
  socket?: WebSocket;
  lines = signal<string[]>([]);

  constructor() {
    effect(this.onInputChange.bind(this));
  }

  onInputChange(): void {
    const origin = `ws://${document.location.host}`;
    const url = new URL(`/pm2/log`, origin);
    const id = this.process()?.id;

    if (typeof id === 'number') {
      url.searchParams.set('process-id', id.toString());
    }

    if (this.socket) {
      this.socket.close();
      this.lines.set([]);
    }

    this.socket = new WebSocket(url);
    this.socket.addEventListener('message', this.onMessage.bind(this));
  }

  ngOnDestroy(): void {
    this.socket?.close();
    this.socket = undefined;
  }

  async onMessage(e: MessageEvent<string>): Promise<void> {
    const lines = this.lines();
    lines.push(e.data);
    this.lines.set(lines.slice(-1000));

    // Ajuste visual
    await new Promise(r => setTimeout(r, 50));
    const container = this.#elementRef.nativeElement;
    const lastChild = container.lastElementChild as HTMLElement;
    const parent = container.parentElement!;
    
    if (container.offsetHeight - lastChild.offsetHeight - (parent.scrollTop + parent.offsetHeight) < 32) {
      parent.scrollTo({
        top: container.offsetHeight,
        behavior: 'smooth'
      });
    }
  }
}
