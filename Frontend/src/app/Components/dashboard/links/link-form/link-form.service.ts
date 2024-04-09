import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { DashboardService } from "../../dashboard.service";
import { UserService } from "src/app/Components/user/user.service";
import { FoldersService } from "../../folders/folders.service";

@Injectable({
  providedIn: "root",
})
export class LinkFormService {
  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private userService: UserService,
    private folderService: FoldersService,
  ) {}
  private apiUrl = environment.apiUrl;

  async submitLinkForm(
    url: string,
    folder: string,
    bookmarked: boolean,
    remind: Date,
  ) {
    await this.http
      .post(
        `${this.apiUrl}/link/create/${this.userService.getUser()?.user.id}`,
        {
          url: url,
          folder: folder,
          bookmarked: bookmarked,
          remind: remind,
        },
        {
          withCredentials: true,
        },
      )
      .subscribe({
        next: () => {
          this.dashboardService.notify();
          this.folderService.notifyFolders();
        },
        error: (error) => {
          alert(error.error);
        },
      });
  }
}
