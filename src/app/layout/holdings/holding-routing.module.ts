import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HoldingComponent } from './holding.component';

const routes: Routes = [
    {
        path: '',
        component: HoldingComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HoldingRoutingModule {}
