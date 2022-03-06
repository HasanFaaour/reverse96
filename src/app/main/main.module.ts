import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainComponent } from './container/main/main.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
];

@NgModule({
  declarations: [
    MainComponent,
    TopNavComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
  ]
})
export class MainModule { }
