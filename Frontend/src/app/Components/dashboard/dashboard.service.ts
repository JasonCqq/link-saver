import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Observable, of } from "rxjs";
import { map, tap, catchError } from "rxjs/operators";
import { Link, Links } from "../../Interfaces/Link";
// // Throttle tab switching from user

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;

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

  //   getFolders(): void {}
  //   getSettings(): void {}
}
