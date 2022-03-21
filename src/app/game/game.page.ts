import { GameService } from './services/game.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {

  gameScore$ = this.gameService.score$;
  constructor(private gameService: GameService) { }

  ngOnInit() {
  }

  handleRestartGame() {
    this.gameService.restartGame$.next(true);
  }

}
