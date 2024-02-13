import { Component, Input, Output, OnInit, EventEmitter } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { DashboardService } from "../dashboard.service";
import { Link } from "src/app/Interfaces/Link";
import { debounceTime } from "rxjs";

@Component({
  selector: "app-main-nav",
  templateUrl: "./main-nav.component.html",
  styleUrls: ["./main-nav.component.scss"],
})
export class MainNavComponent implements OnInit {
  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.query.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => this.searchLinks());
  }

  // Will need user's id to search eventually
  @Input() title: string = "Dashboard";

  @Output() searchResults: EventEmitter<Link[]> = new EventEmitter<Link[]>();

  createForm: boolean = false;
  toggleForm(): void {
    this.createForm = !this.createForm;
  }

  query = new FormGroup({
    linkQuery: new FormControl(),
  });

  searchLinks(): void {
    this.dashboardService
      .searchLink(this.query.value.linkQuery || "", this.title)
      .subscribe((result) => {
        this.searchResults.emit(result);
      });
    console.log(this.searchResults);
  }
}
