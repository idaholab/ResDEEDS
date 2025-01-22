import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from './config-service';


@Injectable()
export class AuthService {
    

    constructor(
        private http: HttpClient, 
        private router: Router, 
        private configSvc: ConfigService, 
        private route: ActivatedRoute,
        ) {
    }

    userId(): number {
        return parseInt(localStorage.getItem('userId') ?? "0", 10);
    }

    getUsers(){
        return this.http.get(this.configSvc.apiUrl + 'user/getUsers');
    }
    getUserDetail(id :number){
        return this.http.get(this.configSvc.apiUrl + 'user/getUserDetail/' + id);
    }
    getRoles(){
        return this.http.get(this.configSvc.apiUrl + 'user/getRoles/');
    }
    getRoleDetail(id : number){
        return this.http.get(this.configSvc.apiUrl + 'user/getRoleDetail/' + id);
    }

    createRole(role: any){
        return this.http.post(this.configSvc.apiUrl + 'user/createRole/', { roleName: role.roleName })
    }
    updateUser(user: any){
        return this.http.post(this.configSvc.apiUrl + 'user/updateUser', user)
    }
    updateRole(role: any){
        return this.http.post(this.configSvc.apiUrl + 'user/updateRole', role)
    }
    deleteRole(roleid: any){
        return this.http.post(this.configSvc.apiUrl + 'user/deleteRole', roleid)
    }

   


}
