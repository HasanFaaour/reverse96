import {ChatService} from '../../services/chat.service'

export class ChatMessage  {

  constructor (
    private _author: string,
    private _content: string,
    private chatService: ChatService,
    private _edited: boolean,
    private _date: Date = new Date(),
    private _id: number = -5,
    private _replyTo: string|null = null,
    private _replyId: number|null = null,
    private _replyAuthor: string|null = null,
    private _seen: boolean = false,
    private _selected = false
  ) {}

  send(chatId: number): void {
    this.chatService.send(this._author, this._content, chatId);
  }

  delete(chatId: number): void {
    if (this._id != -5) {
      this.chatService.delete(this._id, chatId);
    }
  }

  edit(chatId: number, newContent: string): void {
    if (this._id != -5) {
      this._content = newContent;
      this.chatService.edit(this._id, chatId, this._content);
    }
  }

  reply(chatId: number, message: ChatMessage) {
    this.chatService.send(message.author, message.content, chatId, this._id);
  }

  select ():void {
    this._selected = true
  }

  get author (): string {
    return this._author;
  }

  get content (): string {
    return this._content;
  }

  get date (): Date {
    return this._date;
  }

  get toObject (): {username: string, message: string, date: Date} {
    return {username: this._author, message: this._content, date: this._date};
  }

  get replyTo () : {id: number, author: string, content: string}|null {
    if (this._replyAuthor && this._replyId && this._replyTo) {
      return {id: this._replyId, author: this._replyAuthor, content: this._replyTo};
    }
    else {
      return null;
    }
  }

  get id (): number {
    return this._id;
  }

  get seen (): boolean {
    return this._seen;
  }

  get edited (): boolean {
    return this._edited;
  }

  get selected (): boolean {
    return this._selected;
  }

}

export class Bubble {
  private list: ChatMessage[];
  private l;

  constructor (private _author: string) {
    this.list = [];
    this.l = 0;
  }

  push (message: ChatMessage) {
    if (message.author != this._author) {
      return;
    } 

    else {
      this.list.push(message);
      this.l++;
    }
  }

  get length(): number {
    return this.l;
  }

  get author(): string {
    return this._author;
  }

  get messages(): ChatMessage[] {
    return this.list;
  }

}

export class MessageList {
  private list: Bubble[];
  private head: number;
  private count: number;
  private _index: any;

  constructor() {
    this.list = [];
    this._index = [];
    this.head = -1;
    this.count = 0;
  }

  push (message: ChatMessage): void {
    this.count++;
    this._index[message.id.toString()+':'] = message;
    if (this.head < 0) {
      let newBubble = new Bubble(message.author);
      newBubble.push(message);

      this.list.push(newBubble);
      this.head++;
      return;
    }

    let lastBubble = this.list[this.head];
    if (message.author == lastBubble.author) {
      lastBubble.push(message);
    }

    else {
      let newBubble = new Bubble(message.author);
      newBubble.push(message);

      this.list.push(newBubble);
      this.head++;
    }
  }

  get bubbles(): Bubble[] {
    return this.list;
  }

  get messageCount(): number {
    return this.count;
  }

  get bubbleCount(): number {
    return this.head + 1;
  }

  get index(): any {
    return this._index;
  }

  get length(): number {
    return this.head + 1;
  }
}
  