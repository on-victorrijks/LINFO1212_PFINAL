import path from "path";

import { kotsPicturesPath } from "../index.js";

export const dispatchKotImage = (req, res) => {
    res.sendFile(path.join(kotsPicturesPath, req.params.imageName));
}