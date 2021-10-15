declare class ClipboardItem {
  constructor(data: { [mimeType: string]: Blob | Promise<Blob> })
}

declare const ClipboardItem: {
  prototype: ClipboardItem
  new (objects: Record<string, Blob>): ClipboardItem
}

interface Clipboard {
  read?(): Promise<Array<ClipboardItem>>
  write?(items: Array<ClipboardItem>): Promise<void>
}
