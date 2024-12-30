import { Image } from "konva/lib/shapes/Image.js";
import { ParsedQs } from "qs";
import { Konva } from "./konva.js";

export function loadImage(imageURL: string): Promise<Image> {
    return new Promise((resolve, reject) => {
        Konva.Image.fromURL(
            imageURL,
            resolve,
            reject
        );
    })
}

export async function loadSongJacket(jacketId: string): Promise<Image> {
    const padded = jacketId.padStart(3, '0'); 
    const url = `http://localhost:3000/jackets/jacket_s_${padded}.png`;
    return loadImage(url);
}

export type ClearState = "fc" | "ap";

export function parseQueryString(query: ParsedQs): Record<string, ClearState> {
    const result: Record<string, ClearState> = {};
    for (const [key, value] of Object.entries(query)) {
        if (value === "fc" || value === "ap") {
            result[key] = value;
        }
    }
    return result;
}