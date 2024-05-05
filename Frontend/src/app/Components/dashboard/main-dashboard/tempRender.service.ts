import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Link } from "src/app/Interfaces/Link";

@Injectable({
  providedIn: "root",
})
export class TempRenderService {
  constructor() {}

  private addLink = new Subject<Link>();
  addLink$ = this.addLink?.asObservable();

  pushLink(res: Link) {
    this.addLink.next(res);
  }

  private editLink = new Subject<Link>();
  editLink$ = this.editLink?.asObservable();

  updateLink(res: Link) {
    this.editLink.next(res);
  }
}
