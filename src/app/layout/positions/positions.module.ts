import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material.module';

import { PositionsRoutingModule } from './positions-routing.module';
import { PositionsComponent } from './positions.component';

@NgModule({
    imports: [CommonModule, PositionsRoutingModule,MaterialModule],
    declarations: [PositionsComponent]
})
export class PositionsModule {}
