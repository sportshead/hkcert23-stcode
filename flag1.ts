import { decodeST, encodeQR } from "./stcode.ts";
import { readFileSync, writeFileSync } from "fs";

const flag1 = decodeST(readFileSync("./flag1.svg"));
console.log(flag1);

writeFileSync("./flag1-qr.svg", encodeQR(flag1));
console.log("written to ./flag1-qr.svg");
