import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CosDetailsPage } from './cos-details.page';

const routes: Routes = [
  {
    path: '',
    component: CosDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CosDetailsPageRoutingModule {}
