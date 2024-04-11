import { Injectable, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";
import { DashboardService } from "../../dashboard.service";
import { FoldersService } from "../../folders/folders.service";
import { UserService } from "src/app/Components/user/user.service";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LinkService implements OnInit {
  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private foldersService: FoldersService,
    private userService: UserService,
  ) {}
  private apiUrl = environment.apiUrl;

  // Thumbnail state for link-item/main-nav/settings
  private thumbnailsSubject = new BehaviorSubject<boolean>(
    this.userService.getUser()?.settings.previews ?? true,
  );
  thumbnails$ = this.thumbnailsSubject.asObservable();
  toggleThumbnail() {
    this.thumbnailsSubject.next(!this.thumbnailsSubject.value);
  }
  setThumbnail(state: boolean) {
    this.thumbnailsSubject.next(state);
  }

  ngOnInit(): void {
    console.log(this.thumbnails$);
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
        this.dashboardService.notify();
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
