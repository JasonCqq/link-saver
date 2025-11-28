import { animate, transition, style, trigger } from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { Theme } from "./theme.service";

// Animations
const enterTransition = transition(":enter", [
  style({
    opacity: 0,
  }),
  animate("0.1s ease-in-out", style({ opacity: 1 })),
]);

const exitTransition = transition(":leave", [
  style({
    opacity: 1,
  }),
  animate("0.1s ease-in-out", style({ opacity: 0 })),
]);
const fadeIn = trigger("fadeIn", [enterTransition]);
const fadeOut = trigger("fadeOut", [exitTransition]);

export { fadeIn, fadeOut };

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    standalone: false
})
export class AppComponent implements OnInit {
  constructor(private themeService: Theme) {}

  title = "LinkStorage";

  ngOnInit(): void {
    this.themeService.detectColorScheme();
  }
}
