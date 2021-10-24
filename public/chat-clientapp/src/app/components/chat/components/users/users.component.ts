import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from "@angular/core";
type UserT = Array<{ id: string; nickname: string, active?: boolean}>
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent {

  @Input() users: UserT;
  @Output() chooseTarget: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }

}
