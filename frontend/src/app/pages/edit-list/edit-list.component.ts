import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SongService } from 'src/app/song.service';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss']
})
export class EditListComponent implements OnInit {

  constructor(private route: ActivatedRoute, private taskService: SongService, private router: Router) { }

  listId: string;

  
  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.listId = params.listId;
        console.log(params.listId);
      }
    )
  }

  updateList(title: string) {
    this.taskService.updateList(this.listId, {}).subscribe(() => {
      this.router.navigate(['/lists', this.listId]);
    })
  }

}
