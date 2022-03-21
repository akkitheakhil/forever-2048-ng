import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputService {

  inputHandler$ = new Subject<string>();

  constructor() { }
}
