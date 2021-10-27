import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges,} from "@angular/core";

type UserT = Array<{ id: string; nickname: string, active?: boolean, newMessageFrom?: boolean, avatarColor?: string }>

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})

export class UsersComponent {

  @Input() users: UserT;
  @Output() chooseTarget: EventEmitter<{ id: string, nickname: string }> = new EventEmitter<{ id: string, nickname: string }>();

  colors: { key: string, value: string }[] = [
    {
      key: "c1",
      value: "#3F51B5"
    },
    {
      key: "c2",
      value: "#9971FC"
    },
    {
      key: "c3",
      value: "#AF33B4"
    },
    {
      key: "c4",
      value: "#07C4A0"
    },
    {
      key: "c5",
      value: "#E93958"
    },
    {
      key: "c6",
      value: "#4AB8D5"
    }]

  getRandomInt(): number {
    return Math.floor(Math.random() * 6);
  }

  getRandomColorClass() {
    const classes: any = {}
    const randCol = this.colors[this.getRandomInt()] as { key: string, value: string }
    classes[randCol.key] = true
    return classes
  }

}
