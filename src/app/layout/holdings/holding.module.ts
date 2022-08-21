import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PageHeaderModule } from '../../shared';

import { HoldingRoutingModule } from './holding-routing.module';
import { HoldingComponent } from './holding.component';

@NgModule({
    imports: [CommonModule, HoldingRoutingModule, PageHeaderModule],
    declarations: [HoldingComponent]
})
export class HoldingModule {}
