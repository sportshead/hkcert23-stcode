import { XMLBuilder, XMLParser } from "fast-xml-parser";
import QRCode from "qrcode-svg";

/*
<svg ...>
<rect rx="0" y="0" width="256" height="256" style="fill:#ffffff;shape-rendering:crispEdges;"/>
<rect rx="0" y="0" width="256" height="256" style="fill:#ffffff;shape-rendering:crispEdges;"/>
...
</svg>
 */
const xmlOptions = {
    ignoreAttributes: false,
    unpairedTags: ["rect"],
    ignoreDeclaration: true,
};
const parser = new XMLParser(xmlOptions);
const builder = new XMLBuilder(xmlOptions);

interface SVGXml {
    svg: {
        rect: {
            "@_rx"?: string;
        }[];
    };
}

export function decodeST(svg: string | Buffer): string {
    const xml: SVGXml = parser.parse(svg);

    let bits: boolean[] = [];
    for (const rect of xml.svg.rect) {
        if ("@_rx" in rect) {
            bits.push(rect["@_rx"] === "1");
        }
    }
    return bitsToAscii(bits);
}

export function encodeST(svg: string | Buffer, secret: string): string {
    const xml: SVGXml = parser.parse(svg);
    //duplicate qr squares for more st space
    xml.svg.rect.push(...xml.svg.rect.slice(1).map((obj) => ({ ...obj })));

    //duplicate qr squares for more st space (again cause im monkey and cbf to make algo for it)
    xml.svg.rect.push(...xml.svg.rect.slice(1).map((obj) => ({ ...obj })));
    const bits = asciiToBits(secret);
    console.log(xml.svg.rect.length, bits.length);

    for (let i = 0; i < bits.length; i++) {
        // skip first rect
        xml.svg.rect[i + 1]["@_rx"] = bits[i] ? "1" : "0";
    }

    return `<?xml version="1.0" standalone="yes"?>
${builder.build(xml).replaceAll(/(<rect.+?)>/g, "$1/>")}`;
}

export function encodeQR(data: string) {
    return new QRCode(data).svg();
}

export function bitsToAscii(bits: boolean[]): string {
    return bits
        .reduce((acc, cur) => acc + (cur ? "1" : "0"), "")
        .match(/\d{8}/g)!
        .reduce((acc, cur) => acc + String.fromCharCode(parseInt(cur, 2)), "");
}

export function asciiToBits(str: string): boolean[] {
    return [...str].flatMap((char) =>
        [...char.charCodeAt(0).toString(2).padStart(8, "0")].map(
            (b) => b === "1",
        ),
    );
}
