import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { DashboardService } from "../../dashboard.service";

@Injectable({
  providedIn: "root",
})
export class LinkFormService {
  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
  ) {}
  private apiUrl = environment.apiUrl;

  async submitLinkForm(
    url: string,
    folder: string,
    bookmarked: boolean,
    remind: Date,
  ) {
    try {
      await this.http
        .post(`${this.apiUrl}/link/create`, {
          url: url,
          folder: folder,
          bookmarked: bookmarked,
          remind: remind,
        })
        .subscribe(() => {
          if (bookmarked) {
            this.dashboardService.notifyBookmark();
          }
          if (remind) {
            this.dashboardService.notifyUpcoming();
          }
          this.dashboardService.notifyLinks();
        });
    } catch (err) {
      console.log("POST call failed", err);
      throw err;
    }
  }
}
