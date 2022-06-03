import { load } from "cheerio";
import p from "phin";
import c from "../../utils/options";
import { getPururinInfo, getUrl } from "../../utils/modifier";

export async function scrapeContent(url: string) {
  try {
    const res = await p(url);
    const $ = load(res.body);
    const title = $("div.content-wrapper h1").html();
    
    const tags: string[] = $("div.content-wrapper ul.list-inline li").map((i, elm) => {
      return getPururinInfo($(elm).text());
    }).get();

    const cover = $("meta[property='og:image']").attr("content");
    const extension = `.${cover?.split(".").pop()}`;
    const total: number = parseInt($("gallery-thumbnails").attr(":total") || "0");
    const id: number = parseInt($("gallery-thumbnails").attr(":id") || "0");

    const image = [];
    for (let i = 0; i < total; i++) {
      image.push(`${getUrl(cover?.replace("cover", `${i + 1}`) ?? "")}`);
    }

    const objectData = {
      title: title,
      id: id,
      tags: tags,
      type: extension,
      total: total,
      image: image
    };

    const data = {
      data: objectData,
      source: `${c.PURURIN}/gallery/${id}/janda`,
    };
    return data;
  } catch (err: any) {
    throw Error(err.message);
  }
}