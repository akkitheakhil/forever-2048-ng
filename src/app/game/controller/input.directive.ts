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


}
