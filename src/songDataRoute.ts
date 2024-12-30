import { getSongData } from "./draw/chartData.js";
import { Request, Response } from "express";

export const songDataRoute = async (req: Request, res: Response) => {
    const data = await getSongData();
    res.send(data);
}