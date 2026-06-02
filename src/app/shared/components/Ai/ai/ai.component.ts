import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { AiBotService } from '../../../../core/services/AiBot/ai-bot.service';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.scss',
  // Explicitly Default (not OnPush) to avoid missed detectChanges calls
  changeDetection: ChangeDetectionStrategy.Default
})
export class AiComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  private readonly toastService = inject(ToastService);
  private readonly aiBotService = inject(AiBotService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  isOpen = false;
  loading = false;
  loadingQuestions = false;
  questionsError = false;
  userInput = '';
  messages: ChatMessage[] = [];
  suggestedQuestions: string[] = [];
  skeletonItems = [1, 2, 3];

  private shouldScrollToBottom = false;

  ngOnInit(): void {
    // Pre-fetch so questions are ready when panel first opens
    this.fetchQuestions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;

    // Re-fetch only if previous attempt failed or list is empty
    if (this.isOpen && this.suggestedQuestions.length === 0 && !this.loadingQuestions) {
      this.fetchQuestions();
    }
  }

  /**
   * Single method responsible for loading questions.
   * Handles both plain array responses and wrapped { data: [...] } responses.
   */
  fetchQuestions(): void {
    this.loadingQuestions = true;
    this.questionsError = false;
    this.suggestedQuestions = [];

    this.aiBotService
      .GetAiQuestions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          // Guard: handle both raw array and wrapped object
          if (Array.isArray(res)) {
            this.suggestedQuestions = res as string[];
          } else if (res && Array.isArray(res.data)) {
            this.suggestedQuestions = res.data as string[];
          } else {
            this.suggestedQuestions = [];
          }

          this.loadingQuestions = false;
          this.questionsError = this.suggestedQuestions.length === 0;

          // Force change detection — critical fix when called outside Angular zone
          this.cdr.detectChanges();
        },
        error: () => {
          this.suggestedQuestions = [];
          this.loadingQuestions = false;
          this.questionsError = true;
          this.cdr.detectChanges();
        }
      });
  }

  selectQuestion(question: string): void {
    if (this.loading) return;
    this.userInput = question;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.loading) return;

    this.messages = [...this.messages, { role: 'user', content: text }];
    this.userInput = '';
    this.loading = true;
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();

    this.aiBotService
      .AskAi(text)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const answer = res?.data?.answer ?? '—';
          this.messages = [...this.messages, { role: 'ai', content: answer }];
          this.loading = false;
          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
        },
        error: () => {
          this.messages = [...this.messages, { role: 'ai', content: 'حدث خطأ، حاول مرة أخرى.' }];
          this.loading = false;
          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
        }
      });
  }

  trackByIndex(index: number): number {
    return index;
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* noop */ }
  }
}