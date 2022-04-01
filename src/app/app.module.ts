import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../shared/shared.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  // The HttpClientModule is imported here so the custom icons can be loaded in the HomeComponent.
  // This has to be imported here, and not in HomeModule.
  // The exact reason is unclear but could be because the IconRegistry call is made in the constructor
  // of the HomeComponent, which must've been called earlier.
  imports: [BrowserModule, AppRoutingModule, SharedModule, BrowserAnimationsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
