import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  async translatePage(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const textNodes: { node: Text; original: string }[] = [];

    document.querySelectorAll('*').forEach(el => {
      el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
            textNodes.push({ node: node as Text, original: text });
          }
        }
      });
    });

    await Promise.all(
      textNodes.map(async item => {
        try {
          const translated = await this.translateText(item.original);
          item.node.textContent = item.node.textContent!.replace(item.original, translated);
        } catch {
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
}