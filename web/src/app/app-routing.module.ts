import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChartReposComponent }   from './chart-repos.component';
import { ReleasesComponent }      from './releases.component';

const routes: Routes = [
  { path: '', redirectTo: '/chart-repos', pathMatch: 'full' },
  { path: 'chart-repos',  component: ChartReposComponent },
  { path: 'releases',     component: ReleasesComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}