import fs from "fs";

const TEMP_FOLDER = "C:\\Users\\user\\Desktop\\Gabrieli\\lighthouse-temp";

// შექმნა, თუ არ არსებობს
if (!fs.existsSync(TEMP_FOLDER)) fs.mkdirSync(TEMP_FOLDER);

// ENV ფერებლები Lighthouse-სთვის
process.env.TEMP = TEMP_FOLDER;
process.env.TMP = TEMP_FOLDER;
