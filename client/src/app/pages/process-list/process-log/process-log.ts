import { Component, effect, model, OnDestroy, OnInit, signal } from '@angular/core';
import { Socket, SocketMessageEvent, SocketStatus } from '@pm2-logger/utils-socket-client';
import { MatCardModule } from '@angular/material/card';

import { FloatingLabel } from './floating-label/index.js';
import { PM2Process } from '../pm2-process.js';

@Component({
  selector: 'app-process-log',
  standalone: true,
  imports: [
    MatCardModule,
    FloatingLabel
],
  templateUrl: './process-log.html',
  styleUrl: './process-log.scss',
})
export class ProcessLog implements OnInit, OnDestroy {
  reconnecting = signal(false);
  connecting = signal(false);

  prevProcess?: PM2Process;
  process = model<PM2Process>();
  socket = new Socket();
  lines = signal<{ id: string; value: string; }[]>([]);

  #heartbeat?: number;
  #effect = effect(this.connect.bind(this));

  ngOnInit(): void {
    this.socket.on('message', this.onSocketMessage.bind(this));
  }

  ngOnDestroy(): void {
    this.#effect.destroy();
    this.socket.dispose();
  }

  updateHeartbeat(): void {
    if (typeof this.#heartbeat === 'number') {
      clearTimeout(this.#heartbeat);
      this.#heartbeat = undefined;
    }

    this.#heartbeat = setTimeout(
      () => this.connect(),
      1000
    );

    this.socket.send(JSON.stringify({
      name: 'heartbeat'
    }));
  }

  async connect(): Promise<void> {
    const process = this.process();
    if (process) {
      if (this.prevProcess?.id === process.id) {
        this.reconnecting.set(true);
        this.connecting.set(false);
      } else {
        this.reconnecting.set(false);
        this.connecting.set(true);
        this.lines.set([]);
      }

      // Disconnect the current connection
      if (this.socket.status === SocketStatus.OPEN) {
        await this.socket
          .disconnect({ timeout: 1000 })
          .catch(_ => {})
          .then(_ => {});
      }

      // Initialize connection
      while (this.socket.status !== SocketStatus.OPEN) {
        const url = new URL(document.location.origin);
        url.searchParams.set('process-id', process.id.toString());
        url.pathname = 'pm2/log';
        url.protocol = 'ws:';

        await this.socket
          .connect(url)
          .catch(_ => {})
          .then(_ => {});
      }

      this.prevProcess = process;
      this.reconnecting.set(false);
      this.connecting.set(false);
      this.updateHeartbeat();
    } else {
      // Disconnect the current connection
      if (this.socket.status === SocketStatus.OPEN) {
        this.lines.set([]);
        await this.socket
          .disconnect({ timeout: 1000 })
          .catch(_ => {})
          .then(_ => {});
      }
    }
  }

  #generateId(): string {
    return `${this.process()?.id}::` + Array
      .from(window.crypto.getRandomValues(new Uint8Array(4)))
      .map(x => x.toString(16))
      .join('-');
  }

  onStdout(value: string): void {
    const id = this.#generateId();
    const lines = this.lines();
    lines.push({ id, value });
    this.lines.set(lines.slice(-1000));
  }

  onSocketMessage(e: SocketMessageEvent<any>): void {
    const json = JSON.parse(e.data) as { name: string; value: any; };
    switch (json.name) {
      case 'heartbeat': {
        return this.updateHeartbeat();
      }

      case 'stdout': {
        return this.onStdout(json.value);
      }
    }
  }
}
