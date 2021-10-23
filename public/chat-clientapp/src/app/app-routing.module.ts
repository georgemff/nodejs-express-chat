import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MainComponent} from "./components/main/main.component";
import {AuthGuard} from "./guards/auth.guard";
import {UserResolver} from "./resolver/user.resolver";
import {MainGuard} from "./guards/main.guard";

const routes: Routes = [
  {path: '', redirectTo: '/main', pathMatch: 'full'},
  {path: 'main', component: MainComponent, canActivate: [MainGuard]},
  {path: 'chat', loadChildren: () => import("./components/chat/chat.module").then(m => m.ChatModule), canActivate: [AuthGuard], resolve: {user: UserResolver}}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
