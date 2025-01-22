import { Component } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { ConfigService } from '../../services/config-service';
import { HttpClient } from '@angular/common/http';
import {DatePipe} from '@angular/common';
import { HostBinding } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recent-items',
  standalone: true,
  imports: [MatTableModule,DatePipe],
  templateUrl: './recent-items.component.html',
  styleUrl: './recent-items.component.scss'
})
export class RecentItemsComponent {
  
  constructor(
    private configSvc: ConfigService,
    private http: HttpClient, 
    public sanitizer: DomSanitizer,
    private router: Router,
  ){
    this.getRecentItems();
  }

  displayedColumns: string[] = ['title', 'date'];
  dataSource: Array<any> = [];

  getRecentItems(){
    if(this.configSvc.offline){
      //return default item
      var timeSpan = 0
      var retVal = [];
      var now =new Date();
      for(var i = 0; i < 8; i++){
        var rand = Math.floor(Math.random() * 20000);
        timeSpan += rand;
        retVal.push({"id": i, "title": "Title " + i, "date": new Date(now.getTime() - timeSpan)})
      }
      this.dataSource = retVal;
      

    } else {
      this.http.get(this.configSvc.apiUrl + 'user/getRecentItems').subscribe({
        next: (v) => {},
        error: (e) => {},
        complete: () => {},
      })
    }

  }

  select(id: number ){
    this.router.navigate(['main/investigation/' + id])
  }
  
  @HostBinding('style')
  get myStyle(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('display: flex; flex-grow: 1, flex-direction: column');
  }




}
