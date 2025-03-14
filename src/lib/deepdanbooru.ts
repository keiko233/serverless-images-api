// https://github.com/nanoskript/deepdanbooru-docker
// https://github.com/KichangKim/DeepDanbooru

import { fetchWithRetry } from "@/utils/retry";

interface DanbooruTagSearchItem {
  id: number;
  name: string;
  post_count: number;
  category: number;
  created_at: string;
  updated_at: string;
  is_deprecated: false;
  words: string[];
}

interface DeepDanbooruTag {
  score: number;
  tag: string;
}

interface DetailDeepDanbooruTag extends DeepDanbooruTag {
  detail?: DanbooruTagSearchItem | null;
}

export class DeepDanbooru {
  private image: Blob;
  private danbooruTag: DeepDanbooruTag[] | undefined;
  private searchTag: DanbooruTagSearchItem | undefined;
  private character: DanbooruTagSearchItem | undefined;
  private callback: ((message: string) => void) | undefined;
  private logs: string[] = [];

  constructor(image: Blob, callback?: (message: string) => void) {
    this.message("new DeepDanbooru");

    this.image = image;
    this.callback = callback;
  }

  private message(str: string) {
    this.logs.push(str);

    if (this.callback) {
      this.callback(str);
    }
  }

  public getLogs() {
    return this.logs;
  }

  // https://deepdanbooru.nsk.sh/deepdanbooru
  private async _DeepDanbooruNSH(image: Blob) {
    const form = new FormData();

    form.append("image", image);

    this.message("update image to deep danbooru AI interface.");

    try {
      const result = await fetchWithRetry(
        "https://deepdanbooru.nsk.sh/deepdanbooru",
        {
          method: "POST",
          mode: "cors",
          body: form,
        },
      );

      this.danbooruTag = await result.json();
    } catch (err) {
      this.message(`update image faild. ${JSON.stringify(err)}`);
    }

    this.message("update image success.");

    return this.danbooruTag;
  }

  private async _DanbooruTagSearch(name: string) {
    // https://danbooru.donmai.us/tags.json?search[name]=

    this.message(`searching tag ${name} on danbooru.`);

    let result: DanbooruTagSearchItem[] | null;

    try {
      const res = await fetchWithRetry(
        `https://danbooru.donmai.us/tags.json?search[name]=${name}`,
        { mode: "cors" },
      );

      result = await res.json();
    } catch (err) {
      this.message(`search tag faild. ${JSON.stringify(err)}`);

      console.log(err);

      throw new Error(`search tag faild.`);
    }

    this.message("search tag success.");

    if (result && result[0]) {
      this.searchTag = result[0];

      return this.searchTag;
    } else {
      return null;
    }
  }

  public async getTag() {
    await this._DeepDanbooruNSH(this.image);

    if (!this.danbooruTag) {
      throw new Error("No Danbooru tag");
    }

    const tags: DetailDeepDanbooruTag[] = this.danbooruTag;

    // danbooru api has limited, dont use concurrent queries
    for (const tag of tags) {
      tag.detail = await this._DanbooruTagSearch(tag.tag);

      // category 4 is character
      if (tag.detail?.category == 4) {
        this.character = tag.detail;
      }
    }

    this.message("all task is done.");

    return {
      tags,
      character: this.character,
    };
  }
}
