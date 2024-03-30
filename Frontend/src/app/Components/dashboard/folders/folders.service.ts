import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Observable, Subject } from "rxjs";
import { UserService } from "../../user/user.service";
import { map } from "rxjs";

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
    try {
      await this.http
        .post(
          `${this.apiUrl}/folders/create/${
            this.userService.getUser()?.user.id
          }`,
          {
            name: name,
          },
          {
            withCredentials: true,
          },
        )
        .subscribe(() => {
          this.notifyFolders();
        });
    } catch (err) {
      console.log(err);
    }
  }

  async editFolder(id: string, name: string) {
    try {
      await this.http
        .put(
          `${this.apiUrl}/folders/edit/${id}/${
            this.userService.getUser()?.user.id
          }`,
          {
            name: name,
          },
          {
            withCredentials: true,
          },
        )
        .subscribe(() => {
          this.notifyFolders();
        });
    } catch (err) {
      console.log(err);
    }
  }

  async deleteFolder(id: string) {
    try {
      await this.http
        .delete(
          `${this.apiUrl}/folders/delete/${id}/${
            this.userService.getUser()?.user.id
          }`,
          {
            withCredentials: true,
          },
        )
        .subscribe(() => {
          this.notifyFolders();
        });
    } catch (err) {
      console.log(err);
    }
  }

  shareFolder(password: string, share: boolean, folderId: string) {
    return this.http.post(
      `${this.apiUrl}/folders/share/${folderId}/${this.userService.getUser()?.user.id}`,
      {
        password: password,
        share: share,
      },
      { withCredentials: true },
    );
  }
}
