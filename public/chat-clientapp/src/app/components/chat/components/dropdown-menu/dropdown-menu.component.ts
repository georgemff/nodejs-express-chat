import {Component, ElementRef, HostListener, ViewChild} from "@angular/core";

@Component({
  selector: "app-dropdown-menu",
  templateUrl: "./dropdown-menu.component.html",
  styleUrls: ["./dropdown-menu.component.scss"]
})

export class DropdownMenuComponent {
  @HostListener("document:click", ["$event"])
  onClick(event: MouseEvent) {
    if (!this.dropdown?.nativeElement?.contains(event.target) ||
      this.items?.nativeElement?.contains(event.target)) {
      this.open = false;
    }
  }

  @ViewChild("dropdown") dropdown: ElementRef;
  @ViewChild("items") items: ElementRef;

  open: boolean = false;

  toggle() {
    this.open = !this.open;
  }
}
