import { HttpClient } from '@angular/common/http';
import { Injectable, APP_INITIALIZER } from '@angular/core';
import { ConfigService } from './config-service';



@Injectable()
export class DashService {



  constructor(private config: ConfigService) {
  }

  loadDashBoard(){
    console.log("Using " + this.config.apiUrl + "call to load dashboard")
  }

}
