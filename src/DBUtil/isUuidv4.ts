const v4 = new RegExp(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
);

export function isUuidv4(str: string) {
    const lowercase = str.toLowerCase();
    return lowercase.match(v4);
}
