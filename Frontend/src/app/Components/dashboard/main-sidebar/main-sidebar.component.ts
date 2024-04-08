import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user/user.service";
import { MainNavService } from "../main-nav/main-nav.service";

@Component({
  selector: "app-main-sidebar",
  templateUrl: "./main-sidebar.component.html",
  styleUrls: ["./main-sidebar.component.scss"],
})
export class MainSidebarComponent implements OnInit {
  constructor(
    private userService: UserService,
    private mainNavService: MainNavService,
  ) {}
  user: any;

  massEditting: boolean = false;

  opened: any;

  ngOnInit(): void {
    this.user = this.userService.getUser()?.user;

    let isMobile =
      /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    isMobile ? (this.opened = false) : (this.opened = true);

    this.mainNavService.massEdit$.subscribe((bool) => {
      this.massEditting = bool;
    });
  }

  logOut(): void {
    this.userService.logOutUser();
  }

  changeTitle(title: string): void {
    this.mainNavService.changeTitle(title);
  }

  toggleMassEdit(): void {
    this.mainNavService.toggleMassEdit();
  }

  massEditForm: boolean = false;
  toggleMassEditForm(): void {
    this.massEditForm = !this.massEditForm;
  }
}
