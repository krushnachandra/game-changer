import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'watchlist', pathMatch: 'prefix' },
            {path: 'dashboard',loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule)},
            // { path: 'charts', loadChildren: () => import('./charts/charts.module').then((m) => m.ChartsModule) },
            { path: 'orders', loadChildren: () => import('./orders/orders.module').then((m) => m.OrdersModule) },
            { path: 'watchlist', loadChildren: () => import('./watchlist/watchlist.module').then((m) => m.WatchlistModule) },

            { path: 'holdings', loadChildren: () => import('./holdings/holding.module').then((m) => m.HoldingModule) },
            // {
            //     path: 'bs-element',
            //     loadChildren: () => import('./bs-element/bs-element.module').then((m) => m.BsElementModule)
            // },
            // { path: 'grid', loadChildren: () => import('./grid/grid.module').then((m) => m.GridModule) },
            // {
            //     path: 'components',
            //     loadChildren: () => import('./bs-component/bs-component.module').then((m) => m.BsComponentModule)
            // },
            {
                path: 'positions',
                loadChildren: () => import('./positions/positions.module').then((m) => m.PositionsModule)
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule {}
