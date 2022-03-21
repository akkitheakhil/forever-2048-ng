import { Subject } from 'rxjs';
import { GameConstants } from '../constants/game-constants';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InputService {


  touchInput$ = new Subject<string>();
  inputHandler$ = new Subject<string>();
  isInputPaused = false;

  touchInfo: { startTouchData?: Touch; startTime?: any; endTime?: any; endTouchData?: Touch };
  constructor() { }

  handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (this.isInputPaused) {
      return;
    }
  }

  handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    if (this.isInputPaused) {
      return;
    }
    const startTouchData = e.changedTouches[0];
    const startTime: any = new Date();

    this.touchInfo = { startTouchData, startTime };
  }

  handleTouchEnd(e: TouchEvent) {
    e.preventDefault();
    if (this.isInputPaused) {
      return;
    }
    const endTouchData = e.changedTouches[0];
    const endTime: any = new Date() as any - this.touchInfo.startTime;
    if (endTime > GameConstants.allowedGestureTime) {
      this.restoreInput();
      return;
    }
    const distanceX = endTouchData.pageX - this.touchInfo.startTouchData.pageX;
    const distanceY = endTouchData.pageY - this.touchInfo.startTouchData.pageY;
    let direction;
    if (Math.abs(distanceX) >= GameConstants.thresholdDistance) {
      direction = (distanceX > 0 ? 'ArrowRight' : 'ArrowLeft');
    } else if (Math.abs(distanceY) >= GameConstants.thresholdDistance) {
      direction = (distanceY > 0 ? 'ArrowDown' : 'ArrowUp');
    }
    this.inputHandler$.next(direction);
  }

  pauseInput() {
    this.isInputPaused = true;
  }

  restoreInput() {
    this.isInputPaused = false;
  }

}
