import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewCosPage } from './new-cos.page';

const routes: Routes = [
  {
    path: '',
    component: NewCosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewCosPageRoutingModule {}
