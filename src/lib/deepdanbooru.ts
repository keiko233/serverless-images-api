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

  // https://danbooru.donmai.us/tags.json?search[name]=
  private async _DanbooruTagSearch(name: string) {
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

  public async getTag(options?: { maxTagSearchDepth?: number }) {
    // Use percentage instead of absolute count, default to 40% of all tags
    const maxTagPercentage = options?.maxTagSearchDepth ?? 0.4;
    // Maximum absolute number of tags to process
    const maxAbsoluteTags = 30;

    await this._DeepDanbooruNSH(this.image);

    if (!this.danbooruTag) {
      throw new Error("No Danbooru tag");
    }

    const tags: DetailDeepDanbooruTag[] = this.danbooruTag;

    // Sort tags by score from high to low before querying
    const sortedTags = [...tags].sort((a, b) => b.score - a.score);

    // Calculate max tags to process as percentage of total
    const maxTagsToProcess = Math.min(
      maxAbsoluteTags,
      Math.max(1, Math.floor(sortedTags.length * maxTagPercentage)),
    );

    // danbooru api has limited, dont use concurrent queries
    // cloudflare workers have request limit
    // refrence: https://developers.cloudflare.com/workers/platform/limits/#subrequests
    for (let i = 0; i < Math.min(maxTagsToProcess, sortedTags.length); i++) {
      const tag = sortedTags[i];
      tag.detail = await this._DanbooruTagSearch(tag.tag);

      // category 4 is character
      if (tag.detail?.category == 4) {
        this.character = tag.detail;
        // Stop processing more tags once we find a character
        break;
      }
    }

    this.message("all task is done.");

    return {
      tags,
      character: this.character,
    };
  }
}
