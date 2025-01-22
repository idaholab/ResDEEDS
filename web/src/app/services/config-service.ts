import { HttpClient } from '@angular/common/http';
import { Injectable, APP_INITIALIZER } from '@angular/core';
import { environemnt } from '../../environments/environment';



@Injectable()
export class ConfigService {
  
    apiUrl!: string;
    configUrl!: string;
    offline!: boolean;;
    errorTime!: number;
    tokenTimeOutDefault !: number;



  constructor(private http: HttpClient) {
    console.log("config conrtuctor")
    this.loadConfig();

  }

  /**
   *
   */
  loadConfig() {
      this.configUrl = '/assets/config.json';

      this.apiUrl = 
        environemnt.api.protocol + "//" +
        environemnt.api.url + ":" +
        environemnt.api.port

      this.offline = environemnt.offlineTesting;
      this.errorTime = environemnt.errorMessageTime;
      this.tokenTimeOutDefault = environemnt.tokenTimeOutDefault;
    //   return this.http.get(this.configUrl)
    //     .toPromise()
    //     .then((data: any) => {
    //         console.log(data)
    //       let apiPort = data.api.port != "" ? ":" + data.api.port : "";
    //       let apiProtocol = data.api.protocol + "://";
    //       if (localStorage.getItem("apiUrl") != null) {
    //         this.apiUrl = localStorage.getItem("apiUrl") + "/" + data.api.apiIdentifier + "/";
    //       } else {
    //         console.log(data)
    //         this.apiUrl = apiProtocol + data.api.url + apiPort + "/" + data.api.apiIdentifier + "/";
    //       }
    //       console.log(this.apiUrl)
          
    //     }).catch(error => console.log('Failed to load config file: ' + (<Error>error).message));
    // }
    }
}
