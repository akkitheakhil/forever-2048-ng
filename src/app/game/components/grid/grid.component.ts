import { Tile } from '../../models/game-tiles.model';
import { InputService } from '../../controller/input.service';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit {

  @Input() gridSize: number;
  @Input() cellSize: number;
  @Input() cellGap: number;

  tileList: Tile[] = [];
  cellList: Tile[] = [];

  constructor(@Inject(DOCUMENT) private document: Document,
    private inputService: InputService
  ) { }

  ngOnInit(): void {
    this.gameStart();
    this.handleInputEvents();
  }

  gameStart(): void {
    this.generateCells();
    const grid = this.document.querySelector('[data-game-grid]') as HTMLElement;
    grid.style.setProperty('--grid-size', `${this.gridSize}`);
    grid.style.setProperty('--cell-size', `${this.cellSize}vmin`);
    grid.style.setProperty('--cell-gap', `${this.cellGap}vmin`);

    this.tileList.push(this.getRandomEmptyCell());
    this.tileList.push(this.getRandomEmptyCell());
  }

  generateCells(): void {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        this.cellList.push({ x: i, y: j });
      }
    }
  }

  getEmptyCells(): Tile[] {
    return this.cellList.filter(cell => this.tileList.find(tile => tile.x === cell.x && tile.y === cell.y) === undefined);
  }

  getRandomEmptyCell(): Tile {
    const emptyCells = this.getEmptyCells();
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const cell = emptyCells[randomIndex];
    return { x: cell.x, y: cell.y, value: Math.random() > 0.5 ? 2 : 4 };
  }

  getCellsByColumn(): Tile[] {
    return this.cellList.reduce((cellGrid: any, cell: any) => {
      cellGrid[cell.x] = cellGrid[cell.x] || [];
      cellGrid[cell.x][cell.y] = cell;
      return cellGrid;
    }, []);
  }

  getCellsByRow(): Tile[] {
    return this.cellList.reduce((cellGrid: any, cell: any) => {
      cellGrid[cell.y] = cellGrid[cell.y] || [];
      cellGrid[cell.y][cell.x] = cell;
      return cellGrid;
    }, []);
  }

  handleInputEvents(): void {
    this.inputService.inputHandler$.pipe(switchMap((key: string) => of(key)),
      debounceTime(500)
    ).subscribe((key: string) => {
      console.log(key);
    });
  }


}
