import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Link } from "src/app/Interfaces/Link";
import { Observable } from "rxjs";

interface PublicFolder {
  folderName: string;
  links: Link[];
  authorName: string;
}

@Injectable({
  providedIn: "root",
})
export class PublicFolderService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;

  getPublicFolder(id: string): Observable<PublicFolder> {
    return this.http.get<PublicFolder>(`${this.apiUrl}/folders/public/${id}`);
  }

  authorizeFolder(id: string, password: string): Observable<PublicFolder> {
    return this.http.post<PublicFolder>(`${this.apiUrl}/folders/public/${id}`, {
      password: password,
    });
  }
}
