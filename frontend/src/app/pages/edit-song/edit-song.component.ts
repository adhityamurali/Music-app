import { Component, OnInit } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { SongService } from 'src/app/song.service';

@Component({
  selector: 'app-edit-song',
  templateUrl: './edit-song.component.html',
  styleUrls: ['./edit-song.component.scss']
})
export class EditSongComponent implements OnInit {

  constructor(private route: ActivatedRoute, private songService: SongService, private router: Router) { }

  songId: string;
  listId: string;

  
  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.songId = params.songId;
        this.listId = params.listId;
      }
    )
  }

  updateSong(title: string) {
    this.songService.updateSong(this.listId, this.songId, title).subscribe(() => {
      this.router.navigate(['/lists', this.listId]);
    })
  }

}
