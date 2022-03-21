import { Subject, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  score$ = new BehaviorSubject<number>(0);

  restartGame$ = new Subject<boolean>();

  constructor() { }

}
