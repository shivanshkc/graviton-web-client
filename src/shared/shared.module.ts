import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DotComponent } from './components/dot/dot.component';

@NgModule({
  declarations: [DotComponent],
  imports: [CommonModule],
  exports: [DotComponent],
})
export class SharedModule {}
