import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";

@Injectable({
  providedIn: "root",
})
export class LinkService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;

  async moveToTrash(id: string) {
    try {
      await this.http
        .put(`${this.apiUrl}/link/delete`, {
          id: id,
        })
        .subscribe();
    } catch (err) {
      console.log("POST call failed", err);
      throw err;
    }
  }

  async permanentDelete(id: string) {
    try {
      await this.http
        .delete(`${this.apiUrl}/link/perma_delete/${id}`)
        .subscribe();
    } catch (err) {
      console.log("POST call failed", err);
      throw err;
    }
  }
}
