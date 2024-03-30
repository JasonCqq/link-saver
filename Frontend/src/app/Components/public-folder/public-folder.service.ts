import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Link } from "src/app/Interfaces/Link";

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

  getPublicFolder(id: string) {
    return this.http.get<PublicFolder>(`${this.apiUrl}/folders/public/${id}`);
  }
}
