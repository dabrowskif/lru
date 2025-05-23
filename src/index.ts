type Item = {
  value: unknown;
  key: string;
  prev?: Item;
  next?: Item;
};

export class LRU {
  private readonly map: Record<string, Item | undefined>;
  private listHead?: Item;
  private listTail?: Item;
  private listItems = 0;

  constructor(private readonly opts: { maxItems: number }) {
    this.map = {};
  }

  set(key: string, value: string) {
    const item = this.map[key];

    if (item) {
      item.value = value;

      if (item.next && item.prev) {
        // if in the middle
        // reassign surround
        item.next.prev = item.prev;
        item.prev.next = item.next;
        // replace head
        this.listHead!.next = item;
        item.prev = this.listHead;
        item.next = undefined;
        this.listHead = item;
      } else if (item.next && !item.prev) {
        // if is tail
        // reassign tail
        item.next.prev = undefined;
        this.listTail = item.next;
        // reassign head
        item.next = undefined;
        item.prev = this.listHead;
        this.listHead!.next = item;
        this.listHead = item;
      } else if (!item.next) {
        // if is head or only item - just replace value
        item.value = value;
      }
    } else {
      const item: Item = {
        key,
        value: value,
      };

      if (this.listHead) {
        item.prev = this.listHead;
        this.listHead.next = item;
        this.listHead = item;
      } else {
        this.listHead = item;
        this.listTail = item;
      }

      this.map[key] = item;
      this.listItems++;

      if (this.listItems > this.opts.maxItems) {
        const tailKey = this.listTail!.key;
        this.listTail!.next!.prev = undefined;
        this.listTail = this.listTail!.next;
        this.map[tailKey] = undefined;
      }
    }
  }

  get<T>(key: string) {
    const item = this.map[key];

    if (item) {
      if (item.next && item.prev) {
        // if in the middle
        // reassign surround
        item.next.prev = item.prev;
        item.prev.next = item.next;
        // replace head
        this.listHead!.next = item;
        item.prev = this.listHead;
        item.next = undefined;
        this.listHead = item;
      } else if (item.next && !item.prev) {
        // if is tail
        // reassign tail
        item.next.prev = undefined;
        this.listTail = item.next;
        // reassign head
        item.next = undefined;
        item.prev = this.listHead;
        this.listHead!.next = item;
        this.listHead = item;
      }
    }

    return item?.value as T | undefined;
  }

  has(key: string) {
    return this.map[key] ? true : false;
  }

  /**
   * Purely for testing
   */
  logAll() {
    let curr = this.listHead;
    while (curr) {
      console.log(curr.key, {
        value: curr.value,
      });
      curr = curr.prev;
    }
  }
}
