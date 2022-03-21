import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './game-routing.module';

import { GamePage } from './game.page';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { GridComponent } from './components/grid/grid.component';
import { TilesComponent } from './components/tiles/tiles.component';
import { InputDirective } from './controller/input.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GamePageRoutingModule,

  ],
  declarations: [GamePage, GameBoardComponent, GridComponent, TilesComponent, InputDirective]
})
export class GamePageModule { }
