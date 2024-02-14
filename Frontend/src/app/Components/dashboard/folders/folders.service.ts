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
}
