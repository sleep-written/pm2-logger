import { Component, effect, ElementRef, inject, input, model, OnDestroy, OnInit, signal } from '@angular/core';
import { Socket, SocketMessageEvent, SocketStatus } from '@pm2-logger/utils-socket-client';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { FloatingLabel } from './floating-label/index.js';
import { PM2Process } from '../pm2-process.js';

@Component({
  selector: 'app-process-log',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,

    FloatingLabel
],
  templateUrl: './process-log.html',
  styleUrl: './process-log.scss',
})
export class ProcessLog implements OnInit, OnDestroy {
  reconnecting = signal(false);
  connecting = signal(false);

  prevProcess?: PM2Process;
  maxLines = input(1000);
  process = model<PM2Process>();
  socket = new Socket();
  lines = signal<{
    id: string;
    type: 'stdout' | 'stderr';
    value: string;
  }[]>([]);

  #elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  #heartbeat?: number;
  #effect = effect(this.connect.bind(this));

  ngOnInit(): void {
    this.socket.on('message', this.onSocketMessage.bind(this));
  }

  ngOnDestroy(): void {
    this.#effect.destroy();
    this.socket.dispose();
  }

  onContainerScroll(): void {
    const container = this.#elementRef
      .nativeElement
      .querySelector<HTMLElement>('mat-card-content')!;

    const lastChild = this.#elementRef
      .nativeElement
      .querySelector<HTMLElement>('mat-card-content > p:last-child')!;

    if (lastChild) {
      const scrollBottom = container.scrollHeight - (Math.trunc(container.scrollTop) + container.clientHeight)
    }
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

  async #onStandardTerminalMessage(
    type: 'stdout' | 'stderr',
    value: string
  ): Promise<void> {
    // Update list items
    const lines = this.lines();
    const id = `${this.process()?.id}[${type}]::` + Array
      .from(window.crypto.getRandomValues(new Uint8Array(4)))
      .map(x => x.toString(16))
      .join('-');

    lines.push({ id, type, value });
    this.lines.set(lines.slice(this.maxLines() * -1));

    // Move scroll
    await new Promise(r => setTimeout(r, 50));
    const container = this.#elementRef
      .nativeElement
      .querySelector<HTMLElement>('mat-card-content')!;

    const lastChild1 = this.#elementRef
      .nativeElement
      .querySelector<HTMLElement>('mat-card-content > p:nth-last-child(1)');

    const lastChild2 = this.#elementRef
      .nativeElement
      .querySelector<HTMLElement>('mat-card-content > p:nth-last-child(2)');

    if (lastChild1 && lastChild2) {
      const scrollBottom = container.scrollHeight - (Math.trunc(container.scrollTop) + container.clientHeight)
      if (scrollBottom < (lastChild1.clientHeight + lastChild2.clientHeight)) {
        container.scrollTo({
          top: container.scrollHeight - container.clientHeight,
          behavior: 'smooth'
        });
      }
    }
  }

  onSocketMessage(e: SocketMessageEvent<any>): void | Promise<void> {
    const json = JSON.parse(e.data) as { name: string; value: any; };
    switch (json.name) {
      case 'heartbeat': {
        return this.updateHeartbeat();
      }

      case 'stdout': {
        return this.#onStandardTerminalMessage('stdout', json.value);
      }

      case 'stderr': {
        return this.#onStandardTerminalMessage('stderr', json.value);
      }
    }
  }
}
