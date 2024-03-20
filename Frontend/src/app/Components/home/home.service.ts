import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stat`);
  }
}
