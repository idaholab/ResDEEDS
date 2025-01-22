import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { ConfigService } from '../services/config-service';
import { HostBinding } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-layout-login',
  standalone: true,
  imports: [RouterOutlet,MatIconModule,MatSlideToggleModule,MatMenuModule,MatButtonModule],
  templateUrl: './layout-login.component.html',
  styleUrl: './layout-login.component.scss'
})
export class LayoutLoginComponent {

  constructor(
    public configSvc: ConfigService,
    private router: Router,
    public sanitizer: DomSanitizer,
  ){}

  
  ngOnint(){
    console.log("Run any initial api checks here")
  }
  
  @HostBinding('style')
  get myStyle(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle('height: 100%, width: 100%');
  }
}
