import { Injectable, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Observable, Subject, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { Link, Links } from "../../Interfaces/Link";
import { Folder, Folders } from "../../Interfaces/Folder";
import { UserService } from "../user/user.service";

// // Throttle tab switching from user
//, { withCredentials: true }

@Injectable({
  providedIn: "root",
})
export class DashboardService implements OnInit {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}
  private apiUrl = environment.apiUrl;

  // Notifiers for updates
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

  // User Information
  user: any;
  ngOnInit(): void {
    this.getUser();
  }
  getUser(): void {
    this.userService.getUser()?.user;
  }

  // Error Handler
  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  getLinks(): Observable<Link[]> {
    return this.http
      .get<Links>(
        `${this.apiUrl}/link/links/${this.userService.getUser()?.user.id}`,
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.links),
        catchError(this.handleError<Link[]>("getLinks()", [])),
      );
  }

  getBookmarks(): Observable<Link[]> {
    return this.http
      .get<Links>(
        `${this.apiUrl}/link/bookmarks/${this.userService.getUser()?.user.id}`,
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.links),
        catchError(this.handleError<Link[]>("getBookmarks()", [])),
      );
  }

  getUpcoming(): Observable<Link[]> {
    return this.http
      .get<Links>(
        `${this.apiUrl}/link/upcoming/${this.userService.getUser()?.user.id}`,
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.links),
        catchError(this.handleError<Link[]>("getUpcoming()", [])),
      );
  }

  getTrash(): Observable<Link[]> {
    return this.http
      .get<Links>(
        `${this.apiUrl}/link/trash/${this.userService.getUser()?.user.id}`,
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.links),
        catchError(this.handleError<Link[]>("getTrash()", [])),
      );
  }

  getFolders(): Observable<Folder[]> {
    return this.http
      .get<Folders>(
        `${this.apiUrl}/folders/${this.userService.getUser()?.user.id}`,
        { withCredentials: true },
      )
      .pipe(
        map((response) => response.folders),
        catchError(this.handleError<Folder[]>("getFolders()", [])),
      );
  }

  deleteAllTrash() {
    return this.http
      .delete<Links>(
        `${this.apiUrl}/link/deleteAll/${this.userService.getUser()?.user.id}`,
        {
          withCredentials: true,
        },
      )
      .pipe(catchError(this.handleError("deleteAllTrash()", [])))
      .subscribe();
  }

  searchLink(query: string, linkType: string): Observable<Link[]> {
    return this.http
      .get<Links>(
        `${this.apiUrl}/link/search/${
          this.userService.getUser()?.user.id
        }/?q=${query}&t=${linkType}`,
        {
          withCredentials: true,
        },
      )
      .pipe(
        map((response) => response.links),
        catchError(this.handleError<Link[]>("searchlink()", [])),
      );
  }

  getSettings(userId: string): Observable<Settings> {
    return this.http.get<Settings>(`${this.apiUrl}/user/settings/${userId}`);
  }

  submitSettings(
    previews: boolean,
    emailNotifications: boolean,
    userId: string,
  ) {
    return this.http.put(`${this.apiUrl}/user/submit_settings/${userId}`, {
      previews: previews,
      emailNotifications: emailNotifications,
    });
  }
}

interface Settings {
  id: string;
  userId: string;
  previews: boolean;
  emailNotifications: boolean;
}

// Add async and try catch statements to all functions
