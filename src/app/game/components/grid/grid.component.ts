import { Tile } from '../../models/game-tiles.model';
import { InputService } from '../../controller/input.service';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { Cell } from '../../models/game-cell.model';
import { GameService } from '../../services/game.service';
@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit, OnDestroy {

  @Input() gridSize: number;
  @Input() cellSize: number;
  @Input() cellGap: number;

  tileList: Tile[] = [];
  cellList: Cell[] = [];

  private destroy$ = new Subject();
  private isGameOver = false;

  constructor(@Inject(DOCUMENT) private document: Document,
    private inputService: InputService,
    private gameService: GameService
  ) { }

  ngOnInit(): void {
    this.gameStart();
    this.handleInputEvents();
    this.restartGame();
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
      debounceTime(500),
      takeUntil(this.destroy$),
    ).subscribe((key: string) => {
      if (this.isGameOver) {
        return;
      }
      this.gameMovement(key);
    });
  }

  restartGame(): void {
    this.gameService.restartGame$.pipe(takeUntil(this.destroy$),).subscribe((restart) => {
      if (!restart) {
        return;
      }
      this.tileList = [];
      this.cellList = [];
      this.gameStart();
      this.gameService.score$.next(0);
      this.isGameOver = false;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private canMove(cells: any) {
    return cells.some((group: any) => group.some((cell: Cell, index: number) => {
      if (index === 0) { return false; }

      if (cell?.tile?.value == null) {
        return false;
      }

      const moveToPos = group[index - 1];
      const moveToCell = this.findCellByPos(moveToPos);
      return this.cellCanAccept(moveToCell, Number(cell.tile.value));
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
    return this.cellList.find(cell => cell?.x === pos?.x && cell?.y === pos?.y);
  }
  private findCellIndexByPos(pos: { x: number; y: number }) {
    return this.cellList.findIndex(cell => cell?.x === pos?.x && cell?.y === pos?.y);
  }

  private findTileIndexByPos(pos: { x: number; y: number }) {
    return this.tileList.findIndex(tile => tile?.x === pos?.x && tile?.y === pos?.y);
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
        this.moveLeft();
        break;
      case 'ArrowRight':
        this.moveRight();
        break;
    }

    const cellsByColumn = this.getCellsByColumn();
    const cols = cellsByColumn.map((column: any) => [...column].reverse());
    const cellsByRow = this.getCellsByRow();
    const rows = cellsByRow.map((row: any) => [...row].reverse());
    const canMoveUp = this.canMove(cellsByColumn);
    const canMoveDown = this.canMove(cols);
    const canMoveLeft = this.canMove(cellsByRow);
    const canMoveRight = this.canMove(rows);

    if (!canMoveUp && !canMoveDown && !canMoveLeft && !canMoveRight) {
      this.handleGameOver();
    }

  }

  private moveUp() {
    const cellsByColumn = this.getCellsByColumn();
    const canMove = this.canMove(cellsByColumn);
    console.log(canMove);

    if (canMove) {
      this.slideTiles(cellsByColumn);
      this.generateNewTile();
    }
  }

  private moveDown() {
    const cellsByColumn = this.getCellsByColumn();
    const cols = cellsByColumn.map((column: any) => [...column].reverse());
    const canMove = this.canMove(cols);
    if (canMove) {
      this.slideTiles(cols);
      this.generateNewTile();
    }
  }

  private moveLeft() {
    const cellsByRow = this.getCellsByRow();
    const canMove = this.canMove(cellsByRow);

    if (canMove) {
      this.slideTiles(cellsByRow);
      this.generateNewTile();
    }
  }

  private moveRight() {
    const cellsByRow = this.getCellsByRow();
    const rows = cellsByRow.map((row: any) => [...row].reverse());
    const canMove = this.canMove(rows);
    if (canMove) {
      this.slideTiles(rows);
      this.generateNewTile();
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
    if (!_cell || !_cell.tile) {
      return;
    }
    const cellIndex = this.findCellIndexByPos(_cell);
    const tileIndex = this.findTileIndexByPos(_cell.tile);
    const mergeTile = _cell.mergeTile;
    if (cellIndex === -1 || tileIndex === -1) {
      return;
    }
    this.tileList[tileIndex].x = _cell.x;
    this.tileList[tileIndex].y = _cell.y;
    const cellTileIndex = this.findCellIndexByPos(_cell.tile);
    this.cellList[cellTileIndex].tile = null;
    this.cellList[cellTileIndex].mergeTile = null;
    this.cellList[cellIndex].tile = this.tileList[tileIndex];
    if (mergeTile) {
      const value = Number(this.tileList[tileIndex].value) + Number(mergeTile.value);
      this.tileList[tileIndex].value = value;
      this.removeMergeTile(mergeTile);
      this.calculateScore(value);
    }

  }

  private generateNewTile() {
    const randomEmptyCellOne = this.getRandomEmptyCell();
    this.cellAddTile(randomEmptyCellOne);
    this.tileList.push(randomEmptyCellOne);
  }

  private removeMergeTile(pos: { x: number; y: number }) {
    const cellIndex = this.findCellIndexByPos(pos);
    const tileIndex = this.findTileIndexByPos(pos);
    this.cellList[cellIndex].mergeTile = null;
    this.cellList[cellIndex].tile = null;
    this.tileList.splice(tileIndex, 1);
  }

  private calculateScore(_score: number) {
    const score = this.gameService.score$.getValue() + _score;
    this.gameService.score$.next(score);
  }

  private handleGameOver() {
    this.tileList = [];
    // this.cellList = [];
    this.isGameOver = true;
    'GAME'.split('').forEach((letter: string, index: number) => {
      const tile = { x: index, y: 1, value: letter.toUpperCase() };
      this.tileList.push(tile);
    });
    'OVER'.split('').forEach((letter: string, index: number) => {
      const tile = { x: index, y: 2, value: letter.toUpperCase() };
      this.tileList.push(tile);
    });
  }
}
