import { Injectable, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Observable, Subject, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { Link, Links } from "../../Interfaces/Link";
import { Folder, Folders } from "../../Interfaces/Folder";
import { UserService } from "../user/user.service";
import { FoldersService } from "./folders/folders.service";

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
  linksUpdated(): Observable<void> {
    return this.linksSubject.asObservable();
  }

  notify() {
    this.linksSubject.next();
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

  searchLinkInFolder(query: string, folderId: string): Observable<Link[]> {
    return this.http
      .get<Links>(
        `${this.apiUrl}/folders/search_link/${folderId}/${
          this.userService.getUser()?.user.id
        }/?q=${query}`,
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
    return this.http.get<Settings>(`${this.apiUrl}/user/settings/${userId}`, {
      withCredentials: true,
    });
  }

  submitSettings(previews: boolean, userId: string) {
    return this.http.put(
      `${this.apiUrl}/user/submit_settings/${userId}`,
      {
        previews: previews,
      },
      {
        withCredentials: true,
      },
    );
  }
}

interface Settings {
  id: string;
  userId: string;
  previews: boolean;
}
