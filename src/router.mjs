const routes = {
    "/": "index",
    "/404": "not-found",
    "/notes/**": "notes"
}

export function goToNotFound() {
    location.replace("#/404");
}

if (location.pathname.includes("/index.html") || location.hash === "")
    location.assign("#/");

export function getLocation() {
    const href = location.href;
    const url = new URL(href);

    const [ origin, path, hash ] = href.split("#");

    url.internal = {
        hash: decodeURI(hash),
        origin: origin,
        path: path
    }

    return url;
}

function getPathPrefixRegex() {
    const containsWildcard = (path) => (path.includes("/**"));

    const sanitize = (path) => (
        path.replaceAll("**", "").replaceAll("/", "\\/")
    );

    const regex = Object.keys(routes)
        .filter(containsWildcard)
        .map(sanitize)
        .join("|");

    return new RegExp(`((?:${regex})).+`);
}

const pathPrefixRegex = getPathPrefixRegex();

function getPageByPath(path) {
    const prefix = pathPrefixRegex.exec(path)?.[1];
    const exists = (routes.hasOwnProperty(path) || prefix);

    if (!exists)
        return;

    if (prefix)
        path = (prefix + "**");

    return routes[path];
}

function render(page) {
    document.title = "bhfsilva" + getLocation().internal.path;
    document.body.innerHTML = `<loading-spinner></loading-spinner>`;

    const source = `./pages/${page}.mjs`;
    import(source)
        .then((module) => module.default.render())
        .catch(() => goToNotFound());
}

function navigate() {
    const path = getLocation().internal.path;
    const page = getPageByPath(path);

    if (!page) {
        goToNotFound();
        return;
    }

    render(page);
}

export default function initRouter() {
    window.addEventListener("hashchange", () => navigate());
    navigate();
}
