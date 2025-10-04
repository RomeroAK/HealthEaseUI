import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatbotService, ChatbotResponse, ChatMessage } from '../../services/chatBot/chatbot.service';

@Component({
  selector: 'app-ai-chat-modal',
  templateUrl: './ai-chat-modal.component.html',
  styleUrls: ['./ai-chat-modal.component.css'],
  standalone: false
})
export class AiChatModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  messages: { sender: string, text: string }[] = [];
  userInput = '';
  sessionId: string | null = null;
  loading = false;

  constructor(private chatbotService: ChatbotService) {}

  ngOnInit() {
    this.messages = [
      { sender: 'ai', text: 'Hi! How can I help you today?' }
    ];
  }

  sendMessage() {
    if (!this.userInput.trim()) return;
    const userMsg = this.userInput;
    this.messages.push({ sender: 'user', text: userMsg });
    this.loading = true;
    if (!this.sessionId) {
      this.chatbotService.startChatSession().subscribe({
        next: (session: any) => {
          this.sessionId = typeof session === 'string' ? session : session.id;
          this.sendToBot(userMsg);
        },
        error: () => { this.loading = false; }
      });
    } else {
      this.sendToBot(userMsg);
    }
    this.userInput = '';
  }

  sendToBot(message: string) {
    this.chatbotService.sendMessage(message, this.sessionId!).subscribe({
      next: (res: ChatbotResponse) => {
        this.messages.push({ sender: 'ai', text: res.message });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onClose() {
    this.close.emit();
    this.sessionId = null;
    this.messages = [
      { sender: 'ai', text: 'Hi! How can I help you today?' }
    ];
  }
}
