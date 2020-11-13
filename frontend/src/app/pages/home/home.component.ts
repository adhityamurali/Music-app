import { Component, OnInit,Output,EventEmitter } from '@angular/core';
import { SongService } from 'src/app/song.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Song } from 'src/app/models/song.model';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit {

  @Output() newItemEvent = new EventEmitter<string>();
  songs: Song[];
  currentItem : string;
  searchText:string;

  selectedListId: string;

  constructor(private songService: SongService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
          this.songService.getAllSongs().subscribe((songs: Song[]) => {
            console.log(songs)
            this.songs = songs;
          })   
  }

  addNewItem(value: string) {
    this.newItemEvent.emit(value);
  }
  filterSongs(searchtext){
    console.log(searchtext)
    this.songs = this.songs.filter(x=>x.title == searchtext)
    console.log(this.songs)
  }
  changeFn(e) {
    console.log(e)
  }
}
