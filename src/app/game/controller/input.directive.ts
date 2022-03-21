import { InputService } from './input.service';
import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appInput]'
})
export class InputDirective {

  constructor(private inputService: InputService) {
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.inputService.inputHandler$.next(event.key);
  }

  // get touch events
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.inputService.handleTouchStart(event);
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    this.inputService.handleTouchMove(event);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.inputService.handleTouchEnd(event);
  }
}
