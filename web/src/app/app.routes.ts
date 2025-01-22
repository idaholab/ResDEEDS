import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutLoginComponent } from './layout-login/layout-login.component';
import { AboutComponent } from './about/about.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PasswordRestoreComponent } from './password-restore/password-restore.component';
import { AuthGuardGeneral } from './services/authGuards/auth-guard-general';
import { InvestigationMainComponent } from './investigation/investigation-main/investigation-main.component';

export const routes: Routes = [
    

    { path: '', redirectTo: 'login/signin', pathMatch: 'full' }, //default route
    {
        path: 'login', 
        component: LayoutLoginComponent,
        children: [
            {
                path: "signin",
                component: LoginComponent                
            },
            {
                path: "register",
                component: RegisterComponent                
            },
            {
                path: "passowrdReset",
                component: PasswordRestoreComponent,                
            },
            { path: '**', component: NotFoundComponent }
        ]
    },

    {
        path: 'main', 
        component: LayoutComponent,
        children: [
            {
                path: "",
                redirectTo: 'dashboard' , 
                pathMatch: 'full' 
            },
            {
                path: "dashboard",
                component: DashboardComponent,
                canActivate: [AuthGuardGeneral]        
            },
            {
                path: "investigation/:id",
                component: InvestigationMainComponent,
                canActivate: [AuthGuardGeneral]        
            },
            {
                path: "about",
                component: AboutComponent,
                canActivate: [AuthGuardGeneral]
            },
            {
                path: "user",
                component: UserManagementComponent,
                canActivate: [AuthGuardGeneral],
            },
            { path: '**', component: NotFoundComponent }
        ]
    },

];
