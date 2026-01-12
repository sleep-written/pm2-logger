import { Component, effect, ElementRef, inject, input, OnDestroy, signal } from '@angular/core';
import { Socket, SocketMessageEvent, SocketStatus } from '@pm2-logger/utils-socket-client';

import { LogEventMessage } from './log.event.message.js';
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
  #heartbeat?: number;
  #closing?: Promise<void>;

  process = input.required<PM2Process>();
  socket = new Socket();
  lines = signal<{ id: string; value: string; }[]>([]);

  constructor() {
    effect(this.onInputChange.bind(this));
    this.socket.on('message', this.onMessage.bind(this));
  }

  async connect(): Promise<void> {
    // Disconnect the socket
    while (this.socket.status === SocketStatus.OPEN) {
      await this.socket
        .disconnect({ timeout: 2500 })
        .catch(_ => {});
    }

    // Wait until it's disconnected
    while (this.socket.status !== SocketStatus.CLOSED) {
      await new Promise(r => setTimeout(r, 250));
    }

    // Delete the current heartbeat
    if (typeof this.#heartbeat === 'number') {
      clearTimeout(this.#heartbeat);
      this.#heartbeat = undefined;
    }

    let count = 0;
    while (this.socket.status === SocketStatus.CLOSED) {
      try {
        // Build URL
        const origin = `ws://${document.location.host}`;
        const url = new URL(`/pm2/log`, origin);
        const id = this.process().id;
        url.searchParams.set('process-id', id.toString());

        // Connect to remote socket
        await this.socket.connect(url, { timeout: 2500 });
      } catch {
        await new Promise(r => setTimeout(r, 1000));
        console.log(`Intento de conexión nro ${++count}`);
      }
    }

    if (count === 0) {
      this.lines.set([]);
    }

    this.#closing = undefined;
    this.updateHeartbeat();
  }

  async onInputChange(): Promise<void> {
    this.process();
    if (!this.#closing) {
      this.#closing = this.connect();
    }
  }

  async ngOnDestroy(): Promise<void> {
    if (this.socket.status === SocketStatus.OPEN) {
      this.socket.dispose();
      await this.socket.disconnect();
    }
  }

  async onLogMessage(message: LogEventMessage): Promise<void> {
    const lines = this.lines();
    lines.push({
      id: `${this.process().id}-${Date.now()}`,
      value: message.value
    });
    this.lines.set(lines.slice(-1000));

    // Ajuste visual
    await new Promise(r => setTimeout(r, 50));
    const container = this.#elementRef.nativeElement;
    const lastChild = container.lastElementChild as HTMLElement;
    const parent = container.parentElement!;

    if (
      parent && lastChild &&
      (container.offsetHeight - lastChild.offsetHeight - (parent.scrollTop + parent.offsetHeight) < 32)
    ) {
      parent.scrollTo({
        top: container.offsetHeight,
        behavior: 'smooth'
      });
    }
  }

  updateHeartbeat(): void {
    if (typeof this.#heartbeat === 'number') {
      clearTimeout(this.#heartbeat);
    }

    this.#heartbeat = setTimeout(() => {
      console.log('El servidor no ha respondido...');
      if (!this.#closing) {
        console.log(this.socket);
        this.#closing = this.connect();
      }
    }, 1000);

    this.socket.send(JSON.stringify({
      name: 'heartbeat',
      value: 'jaja'
    } as LogEventMessage));
  }

  async onMessage(e: SocketMessageEvent<string>): Promise<void> {
    try {
      const text = e.data;
      const json: LogEventMessage = JSON.parse(text);

      switch (json.name) {
        case 'log-message': {
          return this.onLogMessage(json);
        }

        case 'heartbeat': {
          return this.updateHeartbeat();
        }

        default: {
          throw new Error(`JajajJAja el mensaje del tipo "${json.name}" no está soportado, subnormal`);
        }
      }
    } catch (err) {
      // Pendiente de implementar
      console.error(err);
    }
  }
}
