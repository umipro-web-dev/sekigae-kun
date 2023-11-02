import * as fs from "fs";

const date = new Date();
const dateString = date.toLocaleDateString();
const timeString = date.toLocaleTimeString().slice(0, -3);
const fullString = `${dateString} ${timeString}`;

fs.writeFileSync("./public/lastUpdatedDate.txt", fullString, "utf-8");