import { ClearState, loadImage, loadSongJacket } from "./utils.js";

import { getSongData, Song } from "./chartData.js";
import { Image } from "konva/lib/shapes/Image.js";
import { Konva } from "./konva.js";


const WIDTH = 1000;
const HEIGHT = 1500;
const HEADER_HEIGHT = 32;

const FC_COLOR = '#FE83FE';
const BG_IMAGE_URL = 'http://localhost:3000/backgrounds/hug.png';

const FONT = 'Itim';

let bgImage: Image | null;

const getBgImage = async () => {
    if (!bgImage) {
        bgImage = await loadImage(BG_IMAGE_URL);
    }
    return bgImage;
}

const GUTTER_WIDTH = 30;
const GUTTER_HEIGHT = 35;
const CARD_WIDTH = (WIDTH - (GUTTER_WIDTH * 4)) / 3;
const CARD_HEIGHT = (HEIGHT - HEADER_HEIGHT - (GUTTER_HEIGHT * 11)) / 10;

const apFcCommonProps = {
    x: 0,
    y: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    opacity: 1,
    cornerRadius: 2,
    shadowColor: '#00194a',
    shadowBlur: 5,
    shadowOffset: { x: 0, y: 2 },
    shadowOpacity: 0.
}

const apBaseCard = new Konva.Rect({
    ...apFcCommonProps,
    // AP styling - gradient border + slight gradient background
    strokeWidth: 5,
    strokeLinearGradientStartPoint: { x: CARD_WIDTH / 2, y: 0 },
    strokeLinearGradientEndPoint: { x: CARD_WIDTH / 2, y: CARD_HEIGHT },
    strokeLinearGradientColorStops: [0, '#FF8EFF', 1, '#00E3C7'],
    fillLinearGradientStartPoint: { x: CARD_WIDTH, y: 0 },
    fillLinearGradientEndPoint: { x: 0, y: CARD_HEIGHT },
    fillLinearGradientColorStops: [0, 'white', 1, '#f2feff'],
});

const fcBaseCard = new Konva.Rect({
    ...apFcCommonProps,
    // FC styling - single color border + white background
    strokeWidth: 2,
    stroke: FC_COLOR,
    fill: 'white'
});
apBaseCard.cache();
fcBaseCard.cache();

// difficulty indicators
const BADGE_WIDTH = 37;
const BADGE_HEIGHT = 22;

// color of badge depends on difficulty category of chart
// append is a bit of a gradient to match the ingame styling
const badgeColors = {
    'Expert': { fill: '#FF457A' },
    'Master': { fill: '#781c94' },
    'Append': {
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: BADGE_WIDTH, y: BADGE_HEIGHT },
        fillLinearGradientColorStops: [0, '#7857ff', 1, '#fcacf7'],
        strokeWidth: 2,
        stroke: 'white',
    }
};

type Difficulty = keyof typeof badgeColors;

const makeBadgeRect = (diff: Difficulty) => {
    const badge = new Konva.Rect({
        ...badgeColors[diff],
        width: BADGE_WIDTH,
        height: BADGE_HEIGHT,
        opacity: 1,
        cornerRadius: 10,
    });
    badge.cache();
    return badge;
}

const badges = {
    'Expert': makeBadgeRect("Expert"),
    'Master': makeBadgeRect("Master"),
    'Append': makeBadgeRect("Append")
}

// AP / FC indicator in bottom-right corner
const DIAMOND_WIDTH = 36;
const DIAMOND_HEIGHT = 36;
const appendShape = {
    points: [
        0, 0,
        DIAMOND_WIDTH / 2, DIAMOND_HEIGHT / 7,
        DIAMOND_WIDTH, 0,
        DIAMOND_WIDTH - (DIAMOND_WIDTH / 7), DIAMOND_HEIGHT / 2,
        DIAMOND_WIDTH, DIAMOND_HEIGHT,
        DIAMOND_WIDTH / 2, DIAMOND_HEIGHT - (DIAMOND_HEIGHT / 7),
        0, DIAMOND_HEIGHT,
        DIAMOND_WIDTH / 7, DIAMOND_HEIGHT / 2,
        0, 0
    ]
};
const normalShape = {
    points: [
        // FC shape
        DIAMOND_WIDTH / 2, 0,
        DIAMOND_WIDTH, DIAMOND_HEIGHT / 2,
        DIAMOND_WIDTH / 2, DIAMOND_HEIGHT,
        0, DIAMOND_HEIGHT / 2,
        DIAMOND_WIDTH / 2, 0
    ]
};
const apFill = {
    fillPriority: 'linear-gradient',
    fillLinearGradientStartPoint: { x: DIAMOND_WIDTH / 2, y: 0 },
    fillLinearGradientEndPoint: { x: DIAMOND_WIDTH / 2, y: DIAMOND_HEIGHT },
    fillLinearGradientColorStops: [0, '#FF8EFF', 0.3, '#FF8EFF', 0.7, '#00E3C7', 1, '#00E3C7'],
}
const normalFill = {
    fill: FC_COLOR
}
const commonProps = {
    closed: true,
    opacity: 1,
    stroke: 'black',
    strokeWidth: 2,
    shadowColor: '#00194a',
    shadowBlur: 5,
    shadowOffset: { x: 0, y: 2 },
    shadowOpacity: 0.5
}
const apAppendShape = new Konva.Line({
    ...commonProps,
    ...appendShape,
    ...apFill
});

const fcAppendShape = new Konva.Line({
    ...commonProps,
    ...appendShape,
    ...normalFill
});
const apNormalShape = new Konva.Line({
    ...commonProps,
    ...normalShape,
    ...apFill
});
const fcNormalShape = new Konva.Line({
    ...commonProps,
    ...normalShape,
    ...normalFill
});

const NOT_AP_SCORE_REDUCTION = 1;

export async function drawImage(clearData: Record<string, ClearState>) {
    const songs = await getSongData();

    const unsortedSongList: Song[] = [];

    Object.entries(clearData).forEach(([uid, clearState]) => {
        if (clearState === 'fc') {
            unsortedSongList.push({
                ...songs[uid],
                diffConstant: songs[uid].diffConstant - NOT_AP_SCORE_REDUCTION,
            });
        }
        if (clearState === 'ap') {
            unsortedSongList.push(songs[uid]);
        }
    });

    const final = unsortedSongList.sort((a, b) => b.diffConstant - a.diffConstant);

    const top30Songs = final.slice(0, 30);

    const ranking = top30Songs.reduce((acc, song) => acc + song.diffConstant, 0) / 30;

    const stage = new Konva.Stage({
        width: WIDTH,
        height: HEIGHT
    });
    const bgLayer = new Konva.Layer({ id: 'bgLayer', listening: false });

    stage.add(bgLayer);

    bgLayer.add(await getBgImage());
    bgLayer.draw();

    const mainLayer = new Konva.Layer({ id: 'mainLayer', listening: false });
    stage.add(mainLayer);

    // top bar
    const topBar = new Konva.Rect({
        x: 0,
        y: 0,
        width: WIDTH,
        height: HEADER_HEIGHT,
        fill: '#b4ccfa',
        opacity: 1,
        shadowColor: '#00194a',
        shadowBlur: 5,
        shadowOffset: { x: 0, y: 2 },
        shadowOpacity: 0.5,
    });

    // add some text to the top left corner
    const text = new Konva.Text({
        x: 5,
        y: 5,
        text: 'Your best 30 charts',
        fontSize: 24,
        fontFamily: FONT,
        fill: 'black',
    });

    // ...and another text to the top right corner
    const text2 = new Konva.Text({
        x: 0,
        y: 5,
        width: WIDTH - 5,
        height: HEADER_HEIGHT,
        align: 'right',
        text: `Ranking: ${ranking.toFixed(2)}`,
        fontSize: 24,
        fontFamily: FONT,
        fill: 'black',
    });
    mainLayer.add(topBar, text, text2);


    const imageDrawPromises: Promise<void>[] = [];
    for (let idx = 0; idx < top30Songs.length; idx++) {
        const song = top30Songs[idx];
        // draw the base card
        const gridX = idx % 3;
        const gridY = Math.floor(idx / 3);
        const HEADER_HEIGHT = 32;
        const xPos = gridX * CARD_WIDTH + (GUTTER_WIDTH * (gridX + 1));
        const yPos = HEADER_HEIGHT + (gridY * CARD_HEIGHT) + (GUTTER_HEIGHT * (gridY + 1));

        const card = clearData[song.uid] === 'ap' ? apBaseCard : fcBaseCard;

        const clone = card.clone({
            x: xPos,
            y: yPos,
        });
        clone.cache();
        mainLayer.add(clone);

        // image on left side of card
        const JACKET_PADDING = 15;
        const JACKET_WIDTH = CARD_HEIGHT - (JACKET_PADDING * 2);
        imageDrawPromises.push(
            loadSongJacket(song.songId)
                .then(img => {
                    img.setAttrs({
                        x: xPos + JACKET_PADDING,
                        y: yPos + JACKET_PADDING,
                        width: JACKET_WIDTH,
                        height: JACKET_WIDTH
                    })
                    mainLayer.add(img);
                })
                .catch(_ => {
                    console.error('Failed to load jacket for', song.songId);
                })
        );
        // song name
        const levelText = new Konva.Text({
            x: xPos + (2 * JACKET_PADDING) + JACKET_WIDTH,
            y: yPos + JACKET_PADDING,
            width: CARD_WIDTH - (3 * JACKET_PADDING) - JACKET_WIDTH,
            height: JACKET_WIDTH,
            text: song.songNameEn,
            fontSize: 20,
            fill: 'black',
            fontFamily: FONT,
            lineHeight: 1.2,
            ellipsis: true,
            wrap: 'word',
            align: 'left',
            verticalAlign: 'middle',
        });
        mainLayer.add(levelText);

        // difficulty number badge
        const BADGE_X = xPos - (BADGE_WIDTH / 2);
        const BADGE_Y = yPos - (BADGE_HEIGHT / 2);

        const difficultyRect = badges[song.difficulty].clone({
            x: BADGE_X,
            y: BADGE_Y
        });

        const difficultyText = new Konva.Text({
            x: BADGE_X,
            y: BADGE_Y + 1,
            width: BADGE_WIDTH,
            height: BADGE_HEIGHT,
            text: `${song.diffConstant.toFixed(1)}`,
            fontFamily: FONT,
            fontSize: 14,
            fill: 'white',
            lineHeight: 2,
            ellipsis: true,
            wrap: 'word',
            align: 'center',
            verticalAlign: 'middle',
        });
        mainLayer.add(difficultyRect, difficultyText);
        
        // indicator in lower right corner showing FC or AP
        // the shape is a diamond for normal charts and a weird shape for Append charts
        // the fill is a gradient for AP and a solid color for FC
        const indicatorShape = 
            clearData[song.uid] === 'ap'
                ? song.difficulty === 'Append'
                    ? apAppendShape
                    : apNormalShape
                : song.difficulty === 'Append'
                    ? fcAppendShape
                    : fcNormalShape;
            
        const DIAMOND_X = xPos + CARD_WIDTH - (DIAMOND_WIDTH / 2);
        const DIAMOND_Y = yPos + CARD_HEIGHT - (DIAMOND_HEIGHT / 2);
        const indicatorClone = indicatorShape.clone({
            x: DIAMOND_X,
            y: DIAMOND_Y
        });
        indicatorClone.cache();
        mainLayer.add(indicatorClone);

        const diamondText = new Konva.Text({
            x: DIAMOND_X,
            y: DIAMOND_Y,
            width: DIAMOND_WIDTH,
            height: DIAMOND_HEIGHT,
            text: clearData[song.uid] === 'ap' ? 'AP' : 'FC',
            fontSize: 12,
            fill: 'white',
            fontFamily: FONT,
            align: 'center',
            verticalAlign: 'middle',
        });
        mainLayer.add(indicatorClone, diamondText);
    }
    await Promise.all(imageDrawPromises);
    mainLayer.draw();


    return stage;
}