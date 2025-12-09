import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-viewer",
  templateUrl: "./viewer.component.html",
  styleUrl: "./viewer.component.scss",
  standalone: false,
})
export class ViewerComponent implements OnInit {
  constructor() {}

  @Input() itemData: any;
  @Output() closeEmbedEmit = new EventEmitter();

  close() {
    this.closeEmbedEmit.emit();
  }

  ngOnInit(): void {
    console.log(this.itemData);
  }
}
