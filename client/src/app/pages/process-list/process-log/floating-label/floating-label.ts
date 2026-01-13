import { Component, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-floating-label',
  imports: [],
  templateUrl: './floating-label.html',
  styleUrl: './floating-label.scss',
})
export class FloatingLabel implements OnInit, OnDestroy {
  #clock?: number;
  dots = signal('');

  ngOnInit(): void {
    this.#clock = setInterval(() => {
      let dots = this.dots();
      if (dots.length < 3) {
        dots += '.';
      } else {
        dots = '';
      }

      this.dots.set(dots);
    }, 250);
  }

  ngOnDestroy(): void {
    typeof this.#clock === 'number' &&
    clearTimeout(this.#clock);
  }
}
