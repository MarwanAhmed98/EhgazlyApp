import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private observer: MutationObserver | null = null;
  private isArabicMode = false;

  async translatePage(): Promise<void> {
    this.isArabicMode = true;
    await this.scanAndTranslate(document.body);
    if (!this.observer) {
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.scanAndTranslate(node as HTMLElement);
            }
          });
        });
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  private async scanAndTranslate(rootElement: HTMLElement): Promise<void> {
    const textNodes: { node: Text; original: string }[] = [];
    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT);
    let currentNode = walker.nextNode();

    while (currentNode) {
      const text = currentNode.textContent?.trim();
      if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
        textNodes.push({ node: currentNode as Text, original: text });
      }
      currentNode = walker.nextNode();
    }
    await Promise.all(
      textNodes.map(async item => {
        try {
          const translated = await this.translateText(item.original);
          item.node.textContent = translated;
        } catch (err) {
          console.error("Translation error:", err);
        }
      })
    );
  }

  private async translateText(text: string): Promise<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0]?.map((item: any) => item[0]).join('') ?? text;
  }

  stopTranslation() {
    this.isArabicMode = false;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}