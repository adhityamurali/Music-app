import { Component, OnInit } from '@angular/core';
import { SongService } from 'src/app/song.service';
import { Router } from '@angular/router';
import { List } from 'src/app/models/list.model';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  constructor(private songService: SongService, private router: Router) { }

  ngOnInit() {
  }

  createList(title: string) {
    this.songService.createList(title).subscribe((list: List) => {
      console.log(list);
      // Now we navigate to /lists/song._id
      this.router.navigate([ '/lists', list._id ]); 
    });
  }

}
