import { Request, Response } from "express";

import type { Canvas } from "canvas";

import { drawImage } from "./draw/draw.js";
import { parseQueryString } from "./draw/utils.js";


export const imageRoute = async (req: Request, res: Response) => {
    // toCanvas returns a HTMLCanvasElement, but we're actually in
    // a node environment, so we need to cast it to a Canvas
    // Canvas has createPNGStream, HTMLCanvasElement does not
    const qs = parseQueryString(req.query);
    try {
        const stage = await drawImage(qs);
        (stage.toCanvas() as unknown as Canvas).createPNGStream().pipe(res)    
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {   
            res.status(500).send({
                "error": err.toString(),
                "stack": err.stack
            });
        }
    }
};