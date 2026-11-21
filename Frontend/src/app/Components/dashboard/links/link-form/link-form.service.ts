import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";
import { UserService } from "src/app/Components/user/user.service";
import { FoldersService } from "../../folders/folders.service";
import { TempRenderService } from "../../main-dashboard/tempRender.service";
import { Link } from "src/app/Interfaces/Link";

interface CreateLinkResponse {
  success?: Link[];
  fails?: { url: string; error: string }[];
  message?: string;
}

@Injectable({
  providedIn: "root",
})
export class LinkFormService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private folderService: FoldersService,
    private tempRenderService: TempRenderService
  ) {}
  private apiUrl = environment.apiUrl;

  async submitLinkForm(url: string, folder: string, bookmarked: boolean) {
    await this.http
      .post<CreateLinkResponse>(
        `${this.apiUrl}/link/create`,
        {
          userID: this.userService.getUser()?.user.id,
          urls: [url],
          folder: folder,
          bookmarked: bookmarked,
        },
        {
          withCredentials: true,
        }
      )
      .subscribe({
        next: (res) => {
          console.log("Link created successfully:", res);
          const createdLinks = Array.isArray(res?.success)
            ? res.success.filter((link): link is Link => Boolean(link?.id))
            : [];

          createdLinks.forEach((link) => this.tempRenderService.pushLink(link));

          if (createdLinks.length > 0) {
            this.folderService.notifyFolders();
          }

          if (res?.fails?.length || createdLinks.length === 0) {
            alert(res?.message || res?.fails?.[0]?.error || "Failed to save link");
          }
        },
        error: (error) => {
          alert(error.error);
        },
      });
  }
}
