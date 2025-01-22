import { afterNextRender, Injectable } from '@angular/core';
import { ConfigService } from './config-service';
import { HttpClient } from '@angular/common/http';
import { Router, RouterOutlet } from '@angular/router';
import { httpReponseContext } from '../../models/httpReponseContext';
import { userToken } from '../../models/userTokenModel';

@Injectable({
  providedIn: 'root'
})
export class LoginService {


  constructor(
    private configSvc: ConfigService,
    private router: Router,
    private http: HttpClient, 
  ) {
  }

  isLoggedIn(){
      var userTokenString = localStorage.getItem("userToken");
      if(userTokenString == null) return false;
      var userToken = JSON.parse(userTokenString);
      if(!this.tokenValid(userToken)){
        return false;
      }
      return true;
  }

  tokenValid(token: userToken){
    //TODO: check actual JWT token for validity, currently testing token timeout for offline testing purposes
    //if(token.token.isValid){return true;}
    var now = new Date().getTime();
    var exp = new Date(token.expTime).getTime();
    console.log(exp)
    console.log(now)
    if(exp < now){
      console.log("Token timeout hit")
      console.log(token)
      console.log(new Date())
      return false;
    } else {      
      console.log(token)
      console.log(new Date())
      return true;
    }
  }
  async login(username : string, password: string){    
    var retVal = new httpReponseContext(false,{},"dafault login error, check code for issue");
    if(this.configSvc.offline){
      console.log(password)
      if(username == "JohnDoe" && password == "password"){        
        var retVal = new httpReponseContext(true,{},"test");
        retVal.success = true
        localStorage.setItem("userToken",JSON.stringify(this.genUserToken(username,{})));
        localStorage.setItem("userName",username);
        return retVal;
      } else {
        return new httpReponseContext(false,{},"Invalid username / password combination. In Offline mode please use JohnDoe and password")      
        }
    } else {
      this.http.get(this.configSvc.apiUrl + 'user/getUsers').subscribe({
        next: (v) => console.log(v),
        error: (e) => console.error(e),
        complete: () => console.info('complete') 
      })
    }
    return retVal;
  }

  genUserToken(username : string, token: Object){
    var retval = new userToken();
    var date = new Date();
    retval.expTime = new Date(date.getTime() + this.configSvc.tokenTimeOutDefault);
    retval.username = username;
    var token = token;
    return retval;
  }
  clearUserToken(){
    localStorage.removeItem("userToken")
    localStorage.removeItem("userName")
  }

  logout(){
    this.clearUserToken();
    this.router.navigate(['/login/signin']);
  }
}
