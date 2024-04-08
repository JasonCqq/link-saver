import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MainNavService {
  constructor() {}

  private titleSubject = new BehaviorSubject<string>("Dashboard");
  title$ = this.titleSubject.asObservable();

  private massEditSubject = new BehaviorSubject<boolean>(false);
  massEdit$ = this.massEditSubject.asObservable();
  massEditIDs: string[] = [];

  toggleMassEdit() {
    this.massEditIDs = [];
    this.massEditSubject.next(!this.massEditSubject.value);
  }

  addMassID(id: string) {
    const isPresent = this.massEditIDs.findIndex((ids) => ids === id);
    isPresent === -1
      ? this.massEditIDs.push(id)
      : this.massEditIDs.splice(isPresent, 1);
  }

  changeTitle(title: string) {
    this.titleSubject.next(title);
  }

  getTitle() {
    return this.titleSubject.value;
  }
}
