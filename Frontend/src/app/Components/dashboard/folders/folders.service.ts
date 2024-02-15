import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FoldersService {
  constructor(private http: HttpClient) {}
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
        .post(`${this.apiUrl}/folders/create`, {
          name: name,
        })
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
        .put(`${this.apiUrl}/folders/edit/${id}`, {
          name: name,
        })
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
        .delete(`${this.apiUrl}/folders/delete/${id}`)
        .subscribe(() => {
          this.notifyFolders();
        });
    } catch (err) {
      console.log(err);
    }
  }
}
