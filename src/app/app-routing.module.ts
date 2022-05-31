import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { ComposerComponent } from './composer/composer.component';
import { ExampleComponent } from './example/example.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  { path: '', component: ComposerComponent },
  { path: 'composer', component: ComposerComponent },
  { path: 'about', component: AboutComponent },
  { path: 'example', component: ExampleComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

}
