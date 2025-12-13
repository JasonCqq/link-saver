import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";
import { UserService } from "src/app/Components/user/user.service";
import { BehaviorSubject } from "rxjs";

interface RenderResponse {
  method: "iframe" | "shadowdom";
  content: string;
}

@Injectable({
  providedIn: "root",
})
export class LinkService {
  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  private apiUrl = environment.apiUrl;

  // Thumbnail state for link-item/main-nav/settings
  private thumbnailsSubject = new BehaviorSubject<boolean>(
    this.userService.getUser()?.settings.previews ?? true
  );
  thumbnails$ = this.thumbnailsSubject.asObservable();

  setThumbnail(state: boolean) {
    this.thumbnailsSubject.next(state);
  }

  parseLink(id: string, url: string) {
    return this.http.post<RenderResponse>(
      `${this.apiUrl}/link/parse`,
      {
        id: id,
        userID: this.userService.getUser()?.user.id,
        url: url,
      },

      {
        withCredentials: true,
      }
    );
  }

  async visitedLink(id: string) {
    await this.http
      .put(
        `${this.apiUrl}/link/visit`,
        {
          id: id,
          userID: this.userService.getUser()?.user.id,
        },
        { withCredentials: true }
      )
      .subscribe();
  }

  editLink(id: string, title: string, folder: string, bookmarked: boolean) {
    return this.http.put(
      `${this.apiUrl}/link/edit`,
      {
        id: id,
        userID: this.userService.getUser()?.user.id,
        title: title,
        folder: folder,
        bookmarked: bookmarked,
      },

      {
        withCredentials: true,
      }
    );
  }

  async moveToTrash(id: string) {
    await this.http
      .put(
        `${this.apiUrl}/link/delete`,
        {
          id: id,
          userID: this.userService.getUser()?.user.id,
        },
        {
          withCredentials: true,
        }
      )
      .subscribe();
  }

  async restoreLink(id: string) {
    await this.http
      .put(
        `${this.apiUrl}/link/restore`,
        {
          id: id,
          userID: this.userService.getUser()?.user.id,
        },
        {
          withCredentials: true,
        }
      )
      .subscribe();
  }

  permanentDelete(id: string) {
    return this.http.delete(`${this.apiUrl}/link/perma_delete`, {
      body: {
        id: id,
        userID: this.userService.getUser()?.user.id,
      },

      withCredentials: true,
    });
  }
}
