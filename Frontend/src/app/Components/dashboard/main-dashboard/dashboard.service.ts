import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Observable, of } from "rxjs";
import { map, tap, catchError } from "rxjs/operators";
import { Link, Links } from "../../../Interfaces/Link";
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

  //   getFolders(): void {}
  //   getBookmarks(): void {}
  //   getUpcoming(): void {}
  //   getTrash(): void {}
  //   getSettings(): void {}
}
