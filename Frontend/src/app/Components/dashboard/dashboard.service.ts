import { Injectable, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Observable, Subject, of } from "rxjs";
import { map, tap, catchError } from "rxjs/operators";
import { Link, Links } from "../../Interfaces/Link";
import { Folder, Folders } from "../../Interfaces/Folder";
import { UserService } from "../user/user.service";
// // Throttle tab switching from user

@Injectable({
  providedIn: "root",
})
export class DashboardService implements OnInit {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}
  private apiUrl = environment.apiUrl;

  // Notifiers
  private linksSubject = new Subject<void>();
  private bookmarkSubject = new Subject<void>();
  private upcomingSubject = new Subject<void>();
  notifyLinks() {
    this.linksSubject.next();
  }
  linksUpdated(): Observable<void> {
    return this.linksSubject.asObservable();
  }
  notifyBookmark() {
    this.bookmarkSubject.next();
  }
  bookmarkUpdated() {
    return this.bookmarkSubject.asObservable();
  }
  notifyUpcoming() {
    this.upcomingSubject.next();
  }
  upcomingUpdated() {
    return this.upcomingSubject.asObservable();
  }

  user: any;

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    this.userService.getUser();
    // .subscribe()
  }

  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  // All links
  getLinks(): Observable<Link[]> {
    return this.http.get<Links>(`${this.apiUrl}/link/links`).pipe(
      map((response) => response.links),
      tap((_) => console.log("Received links")),
      catchError(this.handleError<Link[]>("getLinks()", [])),
    );
  }

  getBookmarks(): Observable<Link[]> {
    return this.http.get<Links>(`${this.apiUrl}/link/bookmarks`).pipe(
      tap((response) => {
        console.log("Response", response);
      }),
      map((response) => response.links),
      tap((_) => console.log("Received Bookmarks")),
      catchError(this.handleError<Link[]>("getBookmarks()", [])),
    );
  }

  getUpcoming(): Observable<Link[]> {
    return this.http.get<Links>(`${this.apiUrl}/link/upcoming`).pipe(
      map((response) => response.links),
      tap((_) => console.log("Received Upcomings")),
      catchError(this.handleError<Link[]>("getUpcoming()", [])),
    );
  }

  getTrash(): Observable<Link[]> {
    return this.http.get<Links>(`${this.apiUrl}/link/trash`).pipe(
      map((response) => response.links),
      tap((_) => console.log("Received Trash")),
      catchError(this.handleError<Link[]>("getTrash()", [])),
    );
  }

  getFolders(): Observable<Folder[]> {
    console.log("test", this.user);
    if (this.user) {
      return this.http
        .get<Folders>(`${this.apiUrl}/folders/${this.user.id}`)
        .pipe(
          map((response) => response.folders),
          tap((_) => console.log("Received Folders")),
          catchError(this.handleError<Folder[]>("getFolders()", [])),
        );
    } else {
      return of<Folder[]>([]);
    }
  }

  //   getSettings(): void {}
}
