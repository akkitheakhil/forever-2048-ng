import { Tile } from './game-tiles.model';

export class Cell {
  tile?: Tile;
  x: number;
  y: number;
  mergeTile?: Tile;
}
