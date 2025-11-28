import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user/user.service";
import { MainNavService } from "../main-nav/main-nav.service";
// import { Menu } from "primeng/menu";
import { MenuItem } from "primeng/api";
import { Router } from "@angular/router";

@Component({
  selector: "app-main-sidebar",
  templateUrl: "./main-sidebar.component.html",
  styleUrls: ["./main-sidebar.component.scss"],
  standalone: false,
})
export class MainSidebarComponent implements OnInit {
  constructor(
    private userService: UserService,
    private mainNavService: MainNavService,
    private router: Router
  ) {}
  user: any;

  massEditting: boolean = false;

  items: MenuItem[] | undefined;
  visible: boolean = false;

  ngOnInit(): void {
    this.user = this.userService.getUser()?.user;

    this.items = [
      {
        label: "General",
        items: [
          {
            label: "Dashboard",
            icon: "pi pi-table",
            command: () => {
              this.changeTitle("Dashboard");
              this.router.navigate(["/dashboard"]);
            },
          },
          {
            label: "Folders",
            icon: "pi pi-folder",
            command: () => {
              this.changeTitle("Folders");
              this.router.navigate(["/dashboard/folders"]);
            },
          },
          {
            label: "URL Bank",
            icon: "pi pi-database",
            command: () => {
              this.changeTitle("URLBank");
              this.router.navigate(["/dashboard/urlbank"]);
            },
          },
          {
            label: "Bookmarks",
            icon: "pi pi-bookmark",
            command: () => {
              this.changeTitle("Bookmarks");
              this.router.navigate(["/dashboard"]);
            },
          },
          {
            label: "Trash",
            icon: "pi pi-trash",
            command: () => {
              this.changeTitle("Trash");
              this.router.navigate(["/dashboard"]);
            },
          },
        ],
      },

      {
        label: "Account",
        items: [
          {
            label: "Settings",
            icon: "pi pi-cog",
            command: () => {
              this.router.navigate(["/dashboard/settings"]);
            },
          },

          {
            label: "Home",
            icon: "pi pi-home",
            command: () => {
              this.router.navigate([""]);
            },
          },

          {
            label: "Logout",
            icon: "pi pi-sign-out",
            command: () => {
              this.logOut();
            },
          },
        ],
      },

      {
        label: "Profile",
        items: [
          {
            label: `${this.user.email}`,
            icon: "pi pi-envelope",
          },
        ],
      },
    ];

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
