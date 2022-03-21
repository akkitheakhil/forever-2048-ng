import { Tile } from '../../models/game-tiles.model';
import { InputService } from '../../controller/input.service';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { debounceTime, last, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Cell } from '../../models/game-cell.model';
import { AnyForUntypedForms } from '@angular/forms';
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
  cellList: Cell[] = [];

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


    const randomEmptyCellOne = this.getRandomEmptyCell();
    this.cellAddTile(randomEmptyCellOne);
    const randomEmptyCellTwo = this.getRandomEmptyCell();
    this.cellAddTile(randomEmptyCellTwo);
    this.tileList.push(randomEmptyCellOne);
    this.tileList.push(randomEmptyCellTwo);
  }

  generateCells(): void {
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        this.cellList.push({ x: i, y: j });
      }
    }
  }

  getEmptyCells(): Tile[] {
    return this.cellList.filter(cell => cell.tile === null || cell.tile === undefined);
  }

  getRandomEmptyCell(): Tile {
    const emptyCells = this.getEmptyCells();
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const cell = emptyCells[randomIndex];
    return { x: cell.x, y: cell.y, value: Math.random() > 0.5 ? 2 : 4 };
  }

  getCellsByColumn(): [Tile[]] {
    return this.cellList.reduce((cellGrid: any, cell: any) => {
      cellGrid[cell.x] = cellGrid[cell.x] || [];
      cellGrid[cell.x][cell.y] = cell;
      return cellGrid;
    }, []);
  }

  getCellsByRow(): [Tile[]] {
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
      this.gameMovement(key);
    });
  }

  private canMove(cells: any) {
    return cells.some((group: any) => group.some((cell: Cell, index: number) => {
      if (index === 0) { return false; }
      if (cell?.tile?.value == null) {
        return false;
      }
      const moveToPos = group[index - 1];
      const moveToCell = this.findCellByPos(moveToPos);
      return this.cellCanAccept(moveToCell, cell.tile.value);
    }));
  }

  private cellAddTile(tile: Tile) {
    this.cellList.find(cell => cell.x === tile.x && cell.y === tile.y).tile = tile;
  }

  private cellCanAccept(cell: Cell, value: number) {
    return (cell.tile === null || cell.tile === undefined)
      || (cell.mergeTile === null || cell.mergeTile === undefined)
      && cell.tile.value === value;
  }

  private findCellByPos(pos: { x: number; y: number }) {
    return this.cellList.find(cell => cell.x === pos.x && cell.y === pos.y);
  }
  private findCellIndexByPos(pos: { x: number; y: number }) {
    return this.cellList.findIndex(cell => cell.x === pos.x && cell.y === pos.y);
  }

  private findTileIndexByPos(pos: { x: number; y: number }) {
    return this.tileList.findIndex(tile => tile.x === pos.x && tile.y === pos.y);
  }
  private gameMovement(direction: string) {

    switch (direction) {
      case 'ArrowUp':
        this.moveUp();
        break;
      case 'ArrowDown':
        this.moveDown();
        break;
      case 'ArrowLeft':
        //this.moveLeft();
        break;
      case 'ArrowRight':
        //this.moveRight();
        break;
    }
  }

  private moveUp() {
    const cellsByColumn = this.getCellsByColumn();
    const canMove = this.canMove(cellsByColumn);
    console.log(canMove);

    if (canMove) {
      this.slideTiles(cellsByColumn);
    }
  }

  private moveDown() {
    const cellsByColumn = this.getCellsByColumn();
    const cols = cellsByColumn.map((column: any) => [...column].reverse());
    const canMove = this.canMove(cols);
    console.log(canMove);

    if (canMove) {
      this.slideTiles(cols);
    }
  }

  private slideTiles(cells: any) {
    cells.flatMap((group: any) => {
      for (let i = 1; i < group.length; i++) {
        const cell = group[i];
        if (cell.tile === null || cell.tile === undefined) { continue; }
        let lastValidCell;
        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j];
          const canAccept = this.cellCanAccept(moveToCell, cell.tile.value);
          if (!canAccept) { break; }
          lastValidCell = moveToCell;
        }

        if (lastValidCell != null) {
          if (lastValidCell.tile !== null && lastValidCell.tile !== undefined) {
            lastValidCell.mergeTile = cell.tile;
            lastValidCell.tile.value = lastValidCell.tile.value * 2;

          } else {
            lastValidCell.tile = cell.tile;
          }
          cell.tile = null;
        }
        this.moveTile(lastValidCell);
      }
    });
  }

  private moveTile(_cell: Cell) {
    console.log(JSON.stringify(_cell));
    const cellIndex = this.findCellIndexByPos(_cell);
    const tileIndex = this.findTileIndexByPos(_cell.tile);

    if (cellIndex === -1 || tileIndex === -1) {
      return;
    }

    this.tileList[tileIndex].x = _cell.x;
    this.tileList[tileIndex].y = _cell.y;
    this.cellList[this.findCellIndexByPos(_cell.tile)].tile = undefined;
    // if (_cell.mergeTile !== null && _cell.mergeTile !== undefined) {
    //   this.tileList[tileIndex].value = _cell.mergeTile.value;

    // }
  }


}
