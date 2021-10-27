import {NgModule} from "@angular/core";
import {DropdownMenuComponent} from "./dropdown-menu.component";
import {MatIconModule} from "@angular/material/icon";
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [DropdownMenuComponent],
  imports: [
    MatIconModule,
    CommonModule
  ],
  exports: [DropdownMenuComponent]
})

export class DropdownMenuModule {

}
