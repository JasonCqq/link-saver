import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MainNavService {
  constructor() {}

  private titleSubject = new BehaviorSubject<string>("Dashboard");
  title$ = this.titleSubject.asObservable();

  changeTitle(title: string) {
    this.titleSubject.next(title);
  }

  getTitle() {
    return this.titleSubject.value;
  }
}
