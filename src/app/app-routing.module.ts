import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './main/components/login/login.component';
import { SignupComponent } from './main/components/signup/signup.component';

const routes: Routes = [  
  {
    path: '',
    loadChildren: () => import('./main/main.module').then((m) => m.MainModule),
  },

  {path:'login', component: LoginComponent},

  {path:'signup', component: SignupComponent}
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule { }