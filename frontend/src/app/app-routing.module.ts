import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SongViewComponent } from './pages/song-view/song-view.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewSongComponent } from './pages/new-song/new-song.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/signup-page/signup-page.component';
import { EditListComponent } from './pages/edit-list/edit-list.component';
import { EditSongComponent } from './pages/edit-song/edit-song.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'new-list', component: NewListComponent },
  { path: 'edit-list/:listId', component: EditListComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignupPageComponent },
  { path: 'lists', component: SongViewComponent },
  { path: 'lists/:listId', component: SongViewComponent },
  { path: 'lists/:listId/new-song', component: NewSongComponent },
  { path: 'lists/:listId/edit-song/:songId', component: EditSongComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
