import { readFile, writeFile } from "fs/promises";
import { encodeQR, encodeST } from "./stcode.ts";

const HOST = "http://stcode-3983gi.hkcert23.pwnable.hk:28211";
const flag1 = await readFile("./flag1-qr.svg", "utf8");

const res = await fetch(`${HOST}/flag2`, { redirect: "manual" });
const cookie = res.headers.get("Set-Cookie")!.split(";")[0];
console.log("got cookie", cookie);

const uploadSvg = (svg: string): Promise<string> => {
    const data = new FormData();
    data.append(
        "svg",
        new File([svg], "getpwned.svg", { type: "image/svg+xml" }),
    );
    return fetch(`${HOST}/flag2`, {
        method: "POST",
        headers: {
            Cookie: cookie,
        },
        body: data,
    }).then((res) => res.text());
};

const regex = /QRCode:\n(.+)\nSTCode:\n(.+)\n/;
let svg = flag1;
while (true) {
    const output = await uploadSvg(svg);
    console.log(output);

    const match = output.match(regex);
    if (!match) {
        throw match;
    }

    const [_, qr, st] = match;

    console.log(`qr: '${qr}'\nst: '${st}'`);
    svg = encodeST(encodeQR(qr), st);
    await writeFile("./flag2.debug.svg", svg);
}
