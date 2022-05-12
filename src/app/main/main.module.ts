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
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import { UserInfoComponent } from './components/user-info/user-info.component';

import { NgxPhotoEditorModule } from 'ngx-photo-editor';
import { ChatComponent } from './components/chat/chat.component';
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
        path: 'userInfo',
        component: UserInfoComponent
      },
      {
        path: 'message/:guyId',
        component: ChatComponent
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
    UserInfoComponent
  ],
  entryComponents: [AddReviewComponent],
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
    MatSidenavModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    MatListModule,
    FormsModule,
    NgxPhotoEditorModule
  ],
})
export class MainModule { }
