
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HostBinding } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';
import { ConfigService } from '../services/config-service';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { LoginService } from '../services/login.service';
import { stringify } from 'querystring';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,ReactiveFormsModule, RouterOutlet],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  
  hide = signal(true);
  loginFormGroup!: FormGroup;
  errorMessage: string = "";
  showError: BehaviorSubject<boolean> = new BehaviorSubject(false);


  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  constructor(
    public configSvc: ConfigService,
    public sanitizer: DomSanitizer,
    private router: Router,
    public loginSvc: LoginService,
  ){
    if(this.loginSvc.isLoggedIn()){
      
    this.router.navigate(['/' + "main"]);
    }
    this.loginFormGroup = new FormGroup({
      userName: new FormControl('JohnDoe',[Validators.required]),
      password: new FormControl('password',[Validators.required]),
    });
    console.log(this.loginFormGroup)
  }

  @HostBinding('style')
  get myStyle(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('display: flex; flex-grow: 1');
  }

  
  validLogin(){
    if(this.loginFormGroup.valid){
      console.log("valid")
      return true;
    } else {
      console.log("invalid")
      return false;
    }
  }

  async login(){
    if(!this.validLogin()){
      this.showErrorTimer(this.configSvc.errorTime);
      return;
    }
    console.log("start login")
    var username = this.loginFormGroup.get("userName")?.value
    var password = this.loginFormGroup.get("password")?.value
    var result = await this.loginSvc.login(username,password);
    if(!result.success){
      console.log("login call failed")
      this.errorMessage = result.errorMessage;
      this.showErrorTimer(this.configSvc.errorTime);
      return;
    }

   
    this.router.navigate(['/' + "main"]);
    
  }
  register(){
    console.log("register")
  }
  async showErrorTimer(ms: number){
    this.showError.next(true);
    return setTimeout(() => {
      console.log("error timer hit")
      this.showError.next(false)
      this.errorMessage = "";
      console.log(this.showError)
    },ms);
  }
}
