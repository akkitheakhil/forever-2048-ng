import { DOCUMENT } from '@angular/common';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tiles',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.scss'],
})
export class TilesComponent implements OnInit, AfterViewChecked {

  @ViewChild('tile') tile!: ElementRef;
  private tileValue: number;
  private xCoordinate: number;
  private yCoordinate: number;


  constructor(@Inject(DOCUMENT) private document: Document) { }


  public get value(): number {
    return this.tileValue;
  }

  @Input() set value(value: number) {
    this.tileValue = value;
  }

  @Input() set x(x: number) {
    this.xCoordinate = x;
  }

  @Input() set y(y: number) {
    this.yCoordinate = y;
  }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    this.createTile();
  }

  createTile() {
    this.tile.nativeElement.classList.add(`tile__${this.value}`);
    this.tile.nativeElement.style.setProperty(
      '--text-lightness',
      `${this.value <= 8 ? 10 : 90}%`
    );
    this.tile.nativeElement.style.setProperty('--x', this.xCoordinate.toString());
    this.tile.nativeElement.style.setProperty('--y', this.yCoordinate.toString());
  }

}
