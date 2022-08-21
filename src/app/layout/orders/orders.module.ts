import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../../app/material.module';
import { PageHeaderModule } from '../../shared';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';

@NgModule({
    imports: [CommonModule, OrdersRoutingModule, PageHeaderModule,MaterialModule],
    declarations: [OrdersComponent]
})
export class OrdersModule {}
