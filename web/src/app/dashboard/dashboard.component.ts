import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigService } from '../services/config-service';
import { DashService } from '../services/dashboard-service';
import { HostBinding } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';
import { RecentItemsComponent } from './recent-items/recent-items.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RecentItemsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  // schemas: [NO_ERRORS_SCHEMA]
})
export class DashboardComponent {
  constructor(
    public configSvc: ConfigService,
    public dashSvc: DashService,
    public sanitizer: DomSanitizer,
  ){
  }
  ngOnint(){
    console.log(this.dashSvc.loadDashBoard())
  }
  @HostBinding('style')
  get myStyle(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('display: flex; flex-grow: 1');
  }
}
