import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { TimerComponent } from './components/timer/timer.component';
import { HomeComponent } from './home.component';

const routes: Routes = [{ path: '**', component: HomeComponent }];

@NgModule({
  declarations: [HomeComponent, TimerComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class HomeModule {}
