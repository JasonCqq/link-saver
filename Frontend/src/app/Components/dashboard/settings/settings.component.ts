import { Component, OnInit } from "@angular/core";
import { UserService } from "../../user/user.service";
import { FormControl, FormGroup } from "@angular/forms";
import { DashboardService } from "../dashboard.service";
import { LinkService } from "../links/link-item/link-item.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private dashboardService: DashboardService,
    private linkService: LinkService,
  ) {}

  user: any;

  ngOnInit(): void {
    this.user = this.userService.getUser();

    if (this.user) {
      this.preferenceForm.patchValue({
        previews: this.user.settings.previews,
      });
    }
  }

  preferenceForm = new FormGroup({
    previews: new FormControl(),
  });

  changesApplied = false;

  submitForm(): void {
    this.dashboardService
      .submitSettings(this.preferenceForm.value.previews, this.user.user.id)
      .subscribe((res) => {
        this.changesApplied = true;
        this.userService.updateUser(res);
        this.linkService.toggleThumbnail();
      });
  }

  deletePrompt: boolean = false;
  deletePromptError: boolean = false;
  toggleDeletePrompt(): void {
    this.deletePrompt = !this.deletePrompt;
  }

  deleteAccount(): void {
    if (
      (<HTMLInputElement>document.getElementById("delete-confirm")).value !==
      "abracadabra"
    ) {
      this.deletePromptError = true;
    } else if (
      (<HTMLInputElement>document.getElementById("delete-confirm")).value ===
      "abracadabra"
    ) {
      this.userService.deleteAccount();
    }
  }
}
