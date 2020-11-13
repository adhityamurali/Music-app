import { Component, OnInit } from '@angular/core';
import { SongService } from 'src/app/song.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Song } from 'src/app/models/song.model';
import { List } from 'src/app/models/list.model';

@Component({
  selector: 'app-song-view',
  templateUrl: './song-view.component.html',
  styleUrls: ['./song-view.component.scss']
})
export class SongViewComponent implements OnInit {

  lists: List[];
  songs: Song[];
  allSongsFlag:boolean = false;
  listId :string;
  list : any;
  selectedListId: string;

  constructor(private songService: SongService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    
    this.songService.getLists().subscribe((lists: List[]) => {
      console.log(lists)
      this.lists = lists;
        this.getSongsOnList(0)
        console.log(this.songs)
    })

    
    
  }


  onDeleteListClick() {
    this.songService.deleteList(this.selectedListId).subscribe((res: any) => {
      this.router.navigate(['/lists']);
      console.log(res);
    })
  }

  onDeleteSongClick(index) {
    let deleteId = this.songs[index]._id
    let deleteIdIndex = this.list.songs.findIndex(x=>x == deleteId)
    this.list.songs.splice(deleteIdIndex,1)
    console.log(this.list.songs)
    this.songService.updateList(this.listId, this.list).subscribe((res) => {
      console.log(res)
    })

  }

  getSongsOnList(i){
    console.log('populating songs on clicked list',i,this.listId)
    console.log(this.lists)
    this.listId = this.lists[i]._id
    this.list = this.lists[i]
    this.songs = this.lists[i].songs;
    
  }

  
  showAllSongs(){
    console.log('Show all songs')
    if(this.allSongsFlag){
      this.allSongsFlag = false
    }else{
      this.allSongsFlag = true
      this.songService.getAllSongs().subscribe((songs: Song[]) => {
        console.log(songs)
        this.songs = songs;
      })
    }

    
  }


  addItem(newItem: string) {
    console.log(newItem)
    
      let pushFlag = this.list.songs.some(x=>x._id ==this.songs[newItem]._id)
      console.log(pushFlag)
      if(!pushFlag){
        this.list.songs.push(this.songs[newItem])  
      }else{
        console.log('song exits in the list')
      }  
    
    console.log(this.list)
  }

  updateList() {
    console.log(this.list)
    this.songService.updateList(this.listId, this.list).subscribe((res) => {
      console.log(res)
      this.allSongsFlag = false
      this.songs = this.list.songs
    })
  }

}
