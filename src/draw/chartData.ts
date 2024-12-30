
const API_URL_CSV = 'https://docs.google.com/spreadsheets/d/1B8tX9VL2PcSJKyuHFVd2UT_8kYlY4ZdwHwg9MfWOPug/export?format=csv&gid=610789839';
import { parse } from '@vanillaes/csv';
import { Image } from 'konva/lib/shapes/Image.js';
import { loadSongJacket } from './utils.js';

export type Difficulty = "Expert" | "Master" | "Append";

export const isDifficulty = (s: string): s is Difficulty => {
    return ["Expert", "Master", "Append"].includes(s);
}

export type Song = {
    songNameEn: string;
    songNameJp: string;
    diffConstant: number;
    diffLevel: string;  // e.g. can be "APD 30"
    noteCount: number;
    difficulty: Difficulty;
    songId: string;
    uid: string;
}

type SongMap = Record<string, Song>;

let songData: SongMap = {};

async function getChartData() {
    const response = await fetch(API_URL_CSV);
    const text = await response.text();
    const data: string[][] = parse(text);  // this is now an array of arrays
    const dataWithoutFirstRow = data.slice(1);  // first row is header
    const newSongData: SongMap = {};
    dataWithoutFirstRow.forEach(row => {
        const songId = row[6];
        const diffConstant = parseFloat(row[2]);
        if (songId === '' || Number.isNaN(diffConstant)) {
            // skip this row, we don't have enough information to use this chart
            console.log('skipping row', row);
        }
        const songNameEn = row[0];
        const songNameJp = row[1];
        const diffLevel = row[3];
        const noteCount = parseInt(row[4]);
        const difficulty = isDifficulty(row[5]) ? row[5] : "Expert";
        if (!isDifficulty(row[5])) {
            console.warn(`Song ${songNameEn} has an unknown difficulty, falling back to Expert`)
        }
        const uid = songId + difficulty;
        const newRow = {
            songNameEn: songNameEn,
            songNameJp: songNameJp,
            diffConstant: diffConstant,
            diffLevel: diffLevel,
            noteCount: noteCount,
            difficulty: difficulty,
            songId: songId,
            uid: uid,
        };
        newSongData[uid] = newRow;
    });
    return newSongData;
}

// periodically refresh the data every 12 hours
setInterval(async () => {
    console.log('Refreshing chart data');
    const newSongData = await getChartData();
    songData = newSongData;
}, 1000 * 60 * 60 * 12);  // refresh every 12 hours

songData = await getChartData();

export function getSongData(): SongMap {
    return songData;
}