import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Song } from './models/song.model';

@Injectable({
  providedIn: 'root'
})
export class SongService {

  constructor(private webReqService: WebRequestService) { }


  getLists() {
    return this.webReqService.get('lists');
  }

  getAllSongs() {
    return this.webReqService.get('songs');
  }

  createList(title: string) {
    // We want to send a web request to create a list
    return this.webReqService.post('lists', { title });
  }

  updateList(id: string, list: object) {
    // We want to send a web request to update a list
    return this.webReqService.patch(`lists/${id}`, list);
  }

  updateSong(listId: string, SongId: string, title: string) {
    // We want to send a web request to update a list
    return this.webReqService.patch(`lists/${listId}/Songs/${SongId}`, { title });
  }

  deleteSong(listId: string, SongId: string) {
    return this.webReqService.delete(`lists/${listId}/Songs/${SongId}`);
  }

  deleteList(id: string) {
    return this.webReqService.delete(`lists/${id}`);
  }

  getSongs(listId: string) {
    return this.webReqService.get(`lists/${listId}/Songs`);
  }

  

  createSong(title: string, listId: string) {
    // We want to send a web request to create a Song
    return this.webReqService.post(`lists/${listId}/Songs`, { title });
  }

  /* complete(Song: Song) {
    return this.webReqService.patch(`lists/${Song._listId}/Songs/${Song._id}`, {
      completed: !Song.completed
    });
  } */
}
