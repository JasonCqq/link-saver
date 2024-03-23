import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { DashboardService } from "../../dashboard.service";
import { FoldersService } from "../../folders/folders.service";
import { UserService } from "src/app/Components/user/user.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LinkService {
  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private foldersService: FoldersService,
    private userService: UserService,
  ) {}
  private apiUrl = environment.apiUrl;

  private thumbnails = new BehaviorSubject<boolean | undefined>(
    this.userService.getUser()?.settings.previews,
  );

  thumbnails$ = this.thumbnails.asObservable();
  toggleThumbnail() {
    this.thumbnails.next(!this.thumbnails.value);
  }

  async editLink(
    id: string,
    title: string,
    folder: string,
    bookmarked: boolean,
    remind: Date,
  ) {
    await this.http
      .put(
        `${this.apiUrl}/link/edit/${id}/${this.userService.getUser()?.user.id}`,
        {
          title: title,
          folder: folder,
          bookmarked: bookmarked,
          remind: remind,
        },

        {
          withCredentials: true,
        },
      )
      .subscribe(() => {
        if (bookmarked) {
          this.dashboardService.notifyBookmark();
        }
        if (remind) {
          this.dashboardService.notifyUpcoming();
        }
        this.dashboardService.notifyLinks();
        this.foldersService.notifyFolders();
      });
  }

  async moveToTrash(id: string) {
    await this.http
      .put(
        `${this.apiUrl}/link/delete/${id}/${
          this.userService.getUser()?.user.id
        }`,
        {},
        {
          withCredentials: true,
        },
      )
      .subscribe();
  }

  async restoreLink(id: string) {
    await this.http
      .put(
        `${this.apiUrl}/link/restore/${id}/${
          this.userService.getUser()?.user.id
        }`,
        {},
        {
          withCredentials: true,
        },
      )
      .subscribe();
  }

  async permanentDelete(id: string) {
    await this.http
      .delete(
        `${this.apiUrl}/link/perma_delete/${id}/${
          this.userService.getUser()?.user.id
        }`,
        {
          withCredentials: true,
        },
      )
      .subscribe();
  }
}
