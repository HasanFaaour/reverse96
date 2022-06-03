import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainComponent } from './container/main/main.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { SideBarComponent } from './components/side-bar/side-bar.component';
import { HomeComponent } from './components/home/home.component';

import { ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AddReviewComponent } from './components/add-review/add-review.component';
import { ChatComponent } from './components/chat/chat.component';
import { NotificationComponent } from './components/notification/notification.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import { ComponentsComponent } from './components/components.component';
import { MapReviewComponent } from './components/map-review/map-review.component';
import { AppComponent } from '../app.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import {MatTabsModule} from '@angular/material/tabs'
import { UserInfoComponent } from './components/user-info/user-info.component';
import { AddPlaceComponent } from './components/add-place/add-place.component';

import { NgxPhotoEditorModule } from 'ngx-photo-editor';

import { NgbAlertModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'home'
      },
      {
        path: 'userInfo',
        redirectTo: 'user'
      },
      {
        path: 'userInfo/:username',
        redirectTo: 'user/:username'
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'login',
        component:LoginComponent        
      },
      
      {
        path: 'signup',
        component: SignupComponent
      },

      {
        path: 'logout',
        component: LogoutComponent
      },
      {
        path: 'map-reviws',
        component: MapReviewComponent
      },
      {
        path: 'reviews/add',
        component: AddReviewComponent
      },
      {
        path: 'user',
        component: UserInfoComponent
      },
      {
        path: 'user/:username',
        component: UserInfoComponent
      },
      {
        path: 'message',
        component: ChatComponent
      },
      {
        path: 'message/:guyId',
        component: ChatComponent
      },
      {
        path: 'map',
        component: AddPlaceComponent
      },
      {
        path: 'notifications',
        component: NotificationComponent
      }
    ],
  },
];

@NgModule({
  declarations: [
    MainComponent,
    TopNavComponent,
    FooterComponent,
    SideBarComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    LogoutComponent,
    AddReviewComponent,
    ComponentsComponent,
    ChatComponent,
    MapReviewComponent,
    UserInfoComponent,
    AddPlaceComponent,
    NotificationComponent
  ],
  entryComponents: [AddPlaceComponent],
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    MatListModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatBadgeModule,
    MatTabsModule,
    FormsModule,
    NgxPhotoEditorModule,
    MatProgressSpinnerModule,
    NgbPaginationModule,
    NgbAlertModule,
    ReactiveFormsModule,
    FormsModule
  ],
})
export class MainModule { }
