import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubmitComponent } from './pages/submit/submit.component';
import { AnswersComponent } from './pages/answers/answers.component';

const routes: Routes = [
  { path: '', redirectTo: 'submit', pathMatch: 'full' },
  { path: 'submit', component: SubmitComponent },
  { path: 'answers', component: AnswersComponent },
  { path: '**', redirectTo: 'submit' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
