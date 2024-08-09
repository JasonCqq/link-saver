import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";
import { UserService } from "src/app/Components/user/user.service";
import { FoldersService } from "../../folders/folders.service";
import { TempRenderService } from "../../main-dashboard/tempRender.service";

@Injectable({
  providedIn: "root",
})
export class LinkFormService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private folderService: FoldersService,
    private tempRenderService: TempRenderService,
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
        `${this.apiUrl}/link/create`,
        {
          userID: this.userService.getUser()?.user.id,
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
        next: (res: any) => {
          this.tempRenderService.pushLink(res.link);
          this.folderService.notifyFolders();
        },
        error: (error) => {
          alert(error.error);
        },
      });
  }
}
