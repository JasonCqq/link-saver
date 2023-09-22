import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";

@Injectable({
  providedIn: "root",
})
export class LinkService {
  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  // Retrieve all user's links from database.
}
