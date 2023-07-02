import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HighchartsChartModule } from 'highcharts-angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MaterialModule } from '../material.module';
import { ChartModelComponent } from './components/chart-model/chart-model.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';

@NgModule({
    imports: [CommonModule, MaterialModule, LayoutRoutingModule, TranslateModule, NgbDropdownModule,
         NgApexchartsModule, HighchartsChartModule],
    declarations: [LayoutComponent, SidebarComponent, HeaderComponent, ChartModelComponent]
})
export class LayoutModule {}
