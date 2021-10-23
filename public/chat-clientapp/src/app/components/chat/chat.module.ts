import {NgModule} from "@angular/core";
import {ChatComponent} from "./chat.component";
import {UsersComponent} from "./components/users/users.component";
import {ChatRoutingModule} from "./chat-routing.module";
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

@NgModule({
  declarations: [ChatComponent, UsersComponent],
  imports: [ChatRoutingModule, CommonModule, MatButtonModule, MatIconModule]
})

export class ChatModule {

}
