import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SubmitComponent } from './pages/submit/submit.component';
import { AnswersComponent } from './pages/answers/answers.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminLogsComponent } from './pages/admin-logs/admin-logs.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';

import { AllowlistGuard } from './guards/allowList.guards';
import { AdminGuard } from './guards/admin.guards';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'denied', component: AccessDeniedComponent },

  // ✅ Only allowlisted users can access app pages
  { path: 'submit', component: SubmitComponent, canActivate: [AllowlistGuard] },
  { path: 'answers', component: AnswersComponent, canActivate: [AllowlistGuard] },

  // ✅ Admin-only
  { path: 'admin-logs', component: AdminLogsComponent, canActivate: [AdminGuard] },

  { path: '', redirectTo: 'submit', pathMatch: 'full' },
  { path: '**', redirectTo: 'submit' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
