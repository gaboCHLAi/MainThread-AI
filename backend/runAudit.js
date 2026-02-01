import fs from "fs";
import path from "path";
import os from "os";

// os.tmpdir() ავტომატურად პოულობს დროებით ფოლდერს ნებისმიერ სისტემაზე (Windows-ზეც და Linux-ზეც)
const TEMP_FOLDER = path.join(os.tmpdir(), "lighthouse-temp");

// შექმნა, თუ არ არსებობს
if (!fs.existsSync(TEMP_FOLDER)) {
  fs.mkdirSync(TEMP_FOLDER, { recursive: true });
}

// ENV ცვლადები Lighthouse-სთვის
process.env.TEMP = TEMP_FOLDER;
process.env.TMP = TEMP_FOLDER;

console.log("Lighthouse temp folder is at:", TEMP_FOLDER);
