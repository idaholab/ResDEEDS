import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { userToken } from '../../models/userTokenModel';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet,MatIconModule,MatSlideToggleModule,MatMenuModule,MatButtonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  userName: string = "User Not Set"


  constructor(
    private router: Router,
    private loginSvc: LoginService,
  ) {}
  public test(){
    console.log("TEST")
  }

  public getUserName(){
     var userTokenString = localStorage.getItem("userToken");
     if(userTokenString == null){
      console.log("User has navigated to the main layout without being logged in. Please check AuthGuards")
      return "User Token Error";
     }
     return JSON.parse(userTokenString).username;
  }
  public navigate(url: string){
    //do any work needed before swapping urls (checking for save, leave confirmation, etc)
    console.log(url)
    this.router.navigate(['/main/' + url]);

  }
  public logout(){
    this.loginSvc.logout();
  }

}
