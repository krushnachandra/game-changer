import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MaterialModule } from '../../material.module';

import { PageHeaderModule } from '../../shared';
import { DetailDialogComponent } from './detail-dialog/detail-dialog.component';

import { WatchlistRoutingModule } from './watchlist-routing.module';
import { WatchlistComponent } from './watchlist.component';

@NgModule({
    imports: [CommonModule, WatchlistRoutingModule, PageHeaderModule, MatTableModule, MatPaginatorModule, MatButtonModule
        , MaterialModule, MatDialogModule,NgApexchartsModule],
    declarations: [WatchlistComponent, DetailDialogComponent],
    entryComponents: [DetailDialogComponent]
})
export class WatchlistModule {}
