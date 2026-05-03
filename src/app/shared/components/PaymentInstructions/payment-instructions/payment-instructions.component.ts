import { Component, signal, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-payment-instructions',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-instructions.component.html',
  styleUrl: './payment-instructions.component.scss'
})
export class PaymentInstructionsComponent implements OnInit, OnDestroy {
  readonly steps = [
    { id: '01', text: 'Open your banking or wallet app.' },
    { id: '02', text: 'Enter the details provided above or scan the QR code.' },
    { id: '03', text: 'Complete the transfer of the exact booking amount.' },
    { id: '04', text: 'Take a screenshot of the successful transaction.' },
    { id: '05', text: 'Click \'I have paid\' below to upload your proof.' }
  ];

  copiedType = signal<string | null>(null);
  timeLeft = signal<string>('15:00');
  private timerInterval: any;
  private secondsRemaining = 900; // 15 minutes

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.secondsRemaining > 0) {
        this.secondsRemaining--;
        const mins = Math.floor(this.secondsRemaining / 60);
        const secs = this.secondsRemaining % 60;
        this.timeLeft.set(`${mins}:${secs.toString().padStart(2, '0')} minutes`);
      } else {
        clearInterval(this.timerInterval);
        this.timeLeft.set('Expired');
      }
    }, 1000);
  }

  copyToClipboard(text: string, type: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      this.copiedType.set(type);
      setTimeout(() => this.copiedType.set(null), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  }

}
