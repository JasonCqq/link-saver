import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, throwError } from "rxjs";
import { environment } from "../../../../environments/environment";
import { UserService } from "../../user/user.service";

interface sortBy {
  sortBy: string;
}

@Injectable({
  providedIn: "root",
})
export class MainNavService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}
  private apiUrl = environment.apiUrl;

  private titleSubject = new BehaviorSubject<string>("Dashboard");
  title$ = this.titleSubject.asObservable();

  private massEditSubject = new BehaviorSubject<boolean>(false);
  massEdit$ = this.massEditSubject.asObservable();
  massEditIDs: string[] = [];

  private sortBySubject = new BehaviorSubject("");
  sortBy$ = this.sortBySubject.asObservable();

  setSortBy(res: string) {
    this.sortBySubject.next(res);
  }

  getSortBy() {
    return this.sortBySubject.value;
  }

  toggleMassEdit() {
    this.massEditIDs = [];
    this.massEditSubject.next(!this.massEditSubject.value);
  }

  submitMassEdit(massTitle: string, massFolder: string, massBookmark: boolean) {
    return this.http
      .put(
        `${this.apiUrl}/link/mass_edit`,
        {
          userID: this.userService.getUser()?.user.id,
          massIDs: this.massEditIDs,
          massTitle: massTitle,
          massFolder: massFolder,
          massBookmark: massBookmark,
        },
        { withCredentials: true },
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        }),
      );
  }

  submitMassResDel(massDelete: boolean, massRestore: boolean) {
    return this.http
      .put(
        `${this.apiUrl}/link/mass_restoreDelete`,
        {
          userID: this.userService.getUser()?.user.id,
          massIDs: this.massEditIDs,
          massDelete: massDelete,
          massRestore: massRestore,
        },
        { withCredentials: true },
      )
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        }),
      );
  }

  addMassID(id: string) {
    const isPresent = this.massEditIDs.findIndex((ids) => ids === id);
    isPresent === -1
      ? this.massEditIDs.push(id)
      : this.massEditIDs.splice(isPresent, 1);
  }

  getSortByValue() {
    return this.http
      .get<sortBy>(`${this.apiUrl}/preferences/sortBy`, {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          if (res) {
            this.setSortBy(res.sortBy);
          }
        },
      });
  }

  submitSortBy(sortBy: string) {
    return this.http
      .post<sortBy>(
        `${this.apiUrl}/preferences/sortBy`,
        {
          sortBy: sortBy,
        },
        { withCredentials: true },
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.setSortBy(sortBy);
          }
        },
      });
  }

  changeTitle(title: string) {
    this.titleSubject.next(title);
  }

  getTitle() {
    return this.titleSubject.value;
  }
}
