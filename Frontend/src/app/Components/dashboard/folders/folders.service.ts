import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { Observable, Subject } from "rxjs";
import { UserService } from "../../user/user.service";

@Injectable({
  providedIn: "root",
})
export class FoldersService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}
  private apiUrl = environment.apiUrl;
  private foldersSubject = new Subject<void>();

  // Notifiers for updates
  notifyFolders() {
    this.foldersSubject.next();
  }
  foldersUpdated(): Observable<void> {
    return this.foldersSubject.asObservable();
  }

  async createFolder(name: string) {
    await this.http
      .post(
        `${this.apiUrl}/folders/create`,
        {
          name: name,
          userID: this.userService.getUser()?.user.id,
        },
        {
          withCredentials: true,
        },
      )
      .subscribe(() => {
        this.notifyFolders();
      });
  }

  async editFolder(id: string, name: string) {
    await this.http
      .put(
        `${this.apiUrl}/folders/edit`,
        {
          id: id,
          name: name,
          userID: this.userService.getUser()?.user.id,
        },
        {
          withCredentials: true,
        },
      )
      .subscribe(() => {
        this.notifyFolders();
      });
  }

  async deleteFolder(id: string) {
    await this.http
      .delete(`${this.apiUrl}/folders/delete`, {
        body: {
          id: id,
          userID: this.userService.getUser()?.user.id,
        },
        withCredentials: true,
      })
      .subscribe(() => {
        this.notifyFolders();
      });
  }

  shareFolder(password: string, share: boolean, folderId: string) {
    return this.http.post(
      `${this.apiUrl}/folders/share/`,
      {
        id: folderId,
        userID: this.userService.getUser()?.user.id,
        password: password,
        share: share,
      },
      { withCredentials: true },
    );
  }

  unshareFolder(id: string, share: boolean) {
    return this.http.put(
      `${this.apiUrl}/folders/unshare`,
      { id: id, userID: this.userService.getUser()?.user.id, share: share },
      { withCredentials: true },
    );
  }
}
