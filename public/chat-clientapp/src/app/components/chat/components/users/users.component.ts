import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent {

  @Input() users: Array<{ id: string; nickname: string, active?: boolean}>;
  @Output() chooseTarget: EventEmitter<string> = new EventEmitter<string>();
}
