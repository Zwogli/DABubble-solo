import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Channel } from 'src/app/models/channel.class';
import { User } from 'src/app/models/user.class';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ResponsiveService } from 'src/app/services/responsive.service';

@Component({
  selector: 'app-navbar-searchbar',
  templateUrl: './navbar-searchbar.component.html',
  styleUrls: ['./navbar-searchbar.component.scss']
})
export class NavbarSearchbarComponent {
  @ViewChild('searchbarNavbar') searchbarNavbar!: ElementRef;
  currentUser!:User;
  allUsers!:User[];
  allChannels!:Channel[];
  searchbarActive:boolean = false;
  searchCacheChannel: any[] = [];
  searchCacheUser: any[] = [];
  searchterm!:string;
  private currentUserIsDestroyed$ = new Subject<boolean>();

  constructor(
    private authService: AuthService,
    public firestoreService: FirestoreService,
    public rs: ResponsiveService,  
  ){}

  ngOnInit(){
    this.setCurrentUser();
    this.setAllUser();
    this.setAllChannels();
  }

  ngOnDestroy() {
    this.currentUserIsDestroyed$.next(true);
  }

  setCurrentUser() {
    this.firestoreService.currentUser$
    .pipe(takeUntil(this.currentUserIsDestroyed$))
    .subscribe((user: User) => {
      this.currentUser = user;
    } )
  }

  setAllUser() {
    this.firestoreService.allUsers$
    .pipe(takeUntil(this.currentUserIsDestroyed$))
    .subscribe((users: User[]) => {
      this.allUsers = users;
    } )
  }

  setAllChannels() {
    this.firestoreService.allChannels$
    .pipe(takeUntil(this.currentUserIsDestroyed$))
    .subscribe((channels: Channel[]) => {
      this.allChannels = channels;
    } )
  }

  /**
   * manage search
   */
  searchFor(){
    let value = this.searchbarNavbar.nativeElement.value;
    let searchedItem = value.slice(1).toLowerCase();
    let filterItem = value.slice(0,1);
    this.searchbarActive = true;
    this.resetSearchCache();
    if(value.length == 0){
      this.searchbarActive = false;
    }
    if(this.isFiltered('#', filterItem, searchedItem)){
      this.searchForChannel(searchedItem);
    }else if(this.isFiltered('@', filterItem, searchedItem)){
      this.searchForUser(searchedItem);
    }
  }

  resetSearchCache(){
    this.searchCacheChannel = [];
    this.searchCacheUser = [];
  }

  isFiltered(selectedElem:string, filterItem:string, searchedItem:string){
    return filterItem === selectedElem &&
    this.isMinLength(searchedItem)
  }

  isMinLength(searchedItem:string){
    return searchedItem.length > 1
  }

  /**
   * search item
   */
  searchForChannel(searchedItem: string){
    return this.allChannels.forEach((channel:Channel) => {
      let channelName = channel.name.toLowerCase();
      if(channelName.includes(searchedItem)){
        this.searchCacheChannel.push(channel);
      }
    })
  }

  searchForUser(searchedItem: string){
    return this.allUsers.forEach((user:User) => {
      let userName = user.name.toLowerCase();
      if(userName.includes(searchedItem)){
        this.searchCacheUser.push(user);
      }
    })
  }

}