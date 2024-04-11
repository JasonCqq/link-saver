import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";
import { DashboardService } from "../../dashboard.service";
import { UserService } from "src/app/Components/user/user.service";
import { FoldersService } from "../../folders/folders.service";
import { BehaviorSubject } from "rxjs";

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
  private linkLoaderSubject = new BehaviorSubject<boolean>(false);
  linkLoader$ = this.linkLoaderSubject.asObservable();

  async submitLinkForm(
    url: string,
    folder: string,
    bookmarked: boolean,
    remind: Date,
  ) {
    this.linkLoaderSubject.next(true);
    console.log("HELLO");
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
          this.linkLoaderSubject.next(false);
        },
        error: (error) => {
          alert(error.error);
          this.linkLoaderSubject.next(false);
        },
      });
  }
}
