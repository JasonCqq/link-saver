import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";

@Injectable({
  providedIn: "root",
})
export class LinkFormService {
  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  async submitLinkForm(
    title: string,
    url: string,
    thumbnail: string,
    folder: string,
    bookmarked: boolean,
    remind: Date,
  ) {
    try {
      await this.http
        .post(`${this.apiUrl}/link/create`, {
          title: title,
          url: url,
          thumbnail: thumbnail,
          folder: folder,
          bookmarked: bookmarked,
          remind: remind,
        })
        .subscribe(
          (val) => {
            console.log("POST call successful value returned in body", val);
          },
          (response) => {
            console.log("POST call in error", response);
          },
          () => {
            console.log("The POST observable is now completed.");
          },
        );
    } catch (err) {
      console.log("POST call failed", err);
      throw err;
    }
  }
}
