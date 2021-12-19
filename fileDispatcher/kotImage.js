import path from "path";
import url from 'url';
import fs from 'fs';

import { kotsPicturesPath } from "../index.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const notFoundKotImage = path.join(__dirname, "../static/imgs/notfound.png");

export const dispatchKotImage = (req, res) => {
    const filePath = path.join(kotsPicturesPath, req.params.imageName);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.sendFile(notFoundKotImage);
    }
}