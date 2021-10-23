import {Component} from "@angular/core";
import {ApiService} from "../../services/api.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {StoreService} from "../../services/store.service";
import {Router} from "@angular/router";

@Component({
  selector: "app-main",
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})

export class MainComponent {
  public hide: boolean = true;
  public formGroup: FormGroup;

  constructor(
    private apiService: ApiService,
    private formBuilder: FormBuilder,
    private store: StoreService,
    private router: Router
  ) {
    this.formGroup = this.formBuilder.group({
      nickname: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
  }

  loginRegister(): void {
    if (this.formGroup.invalid)
      return;
    this.apiService.authOrRegister(this.formGroup.value)
      .subscribe((res) => {
        this.store.user = res.user;
        window.localStorage.setItem("jwt", res.user.jwt);
        this.router.navigate(["chat"])
      }, error => {
        console.error(error)
      })
  }

}
