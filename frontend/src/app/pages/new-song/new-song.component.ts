import { Component, OnInit } from '@angular/core';
import { SongService } from 'src/app/song.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Song } from 'src/app/models/song.model';

@Component({
  selector: 'app-new-song',
  templateUrl: './new-song.component.html',
  styleUrls: ['./new-song.component.scss']
})
export class NewSongComponent implements OnInit {

  constructor(private songService: SongService, private route: ActivatedRoute, private router: Router) { }

  listId: string;
  
  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.listId = params['listId'];
      }
    )
  }

  createSong(title: string) {
    this.songService.createSong(title, this.listId).subscribe((newSong: Song) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    })
  }

}
