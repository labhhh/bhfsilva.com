export function createLinkElement(source) {
    if (!source)
        return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = source
    return link;
}
