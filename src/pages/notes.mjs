import { getLocation, goToNotFound } from "../router.mjs";
import notesContentSource from "../../data/notes-source.mjs";

const HTMLParser = new DOMParser();
const markdownParser = new marked.Marked()
    .use(markedFootnote())
    .use(markedGfmHeadingId.gfmHeadingId())
    .use(markedKatex({ nonStandard: true }))
    .use(markedDirective.createDirectives());

const contentRoot = "https://raw.githubusercontent.com/bhfsilva/anotacoes/refs/heads/main";
const internalPaths = Object.keys(notesContentSource);

let cache = {};

function getPathBySource(source) {
    return internalPaths.find((path) => (notesContentSource[path] === source));
}

function focusById(id) {
    const scrollTop = () => window.scrollTo({ top: 0 });

    id = decodeURI(id?.replace("#", ""));
    if (!id) {
        scrollTop();
        return;
    }

    const element = document.getElementById(id);
    if (!element) {
        scrollTop();
        return;
    }

    element.scrollIntoView({ block: "start" });
    element.focus({ preventScroll: true });
}

function renderMarkdownPage(url) {
    const currentPath = url.internal.path;
    const source = notesContentSource[currentPath];

    if (!source)
        goToNotFound();

    const cachePageContent = cache[currentPath];
    if (cachePageContent) {
        document.body.innerHTML = cachePageContent;
        return;
    }

    const format = (markdown) => {
        const frontmatter = /^-{3}.*?-{3}/s;
        const markdownBlockId = /\s\^(.+-ref)$/gm;

        const directiveBlockId = (_, id) => (`:{#${id}}`);

        return markdown
            .replace(frontmatter, "")
            .replace(markdownBlockId, directiveBlockId);
    }

    const toHTML = (markdown) => {
        const resolveQuoteType = (blockquote) => {
            const firstChild = blockquote.firstElementChild;
            const text = firstChild.textContent;

            const quoteTypeRegex = /\[!(.+)\]/g;

            const type = quoteTypeRegex.exec(text)?.[1];
            if (!type)
                return;

            let content = text.replace(quoteTypeRegex, "").trim();
            if (!content)
                content = type.toUpperCase();

            blockquote.setAttribute("data-type", type);

            const css = window.getComputedStyle(blockquote);
            const color = css.getPropertyValue("--color");

            firstChild.style.color = `rgb(${color})`;
            firstChild.style.fontWeight = "bold";   

            const icon = css.getPropertyValue("--icon");
            if (!icon) {
                firstChild.textContent = content;
                return;
            }

            firstChild.innerHTML = `
                <i class="bi bi-${icon.replaceAll("'", "")}"></i> ${content}
            `;
        }

        const resolveLink = (link) => {
            const isExternalLink = (link.origin != url.origin);
            if (isExternalLink) {
                link.target = "_blank";
                return;
            }

            const isFootnoteLink = link.id.includes("footnote-ref");
            if (isFootnoteLink)
                link.textContent = `[${link.textContent}]`;

            const getHref = (link) => {
                const origin = url.internal.origin;
                const root = url.pathname;

                const source = link.pathname.replace(root, "");
                const path = getPathBySource(source);
                if (path)
                    return `${origin}#${path}`;

                return `${origin}#${url.internal.path}`;
            }

            const getHeadingAnchor = (link) => {
                const invalidChars = /[.()^]/g;
                return decodeURI(link.hash)
                    .toLowerCase()
                    .replaceAll(" ", "-")
                    .replace(invalidChars, "");
            }

            link.href = (getHref(link) + getHeadingAnchor(link));
            return link;
        }

        const html = HTMLParser.parseFromString(markdownParser.parse(markdown), "text/html");
        html.querySelectorAll("blockquote").forEach(resolveQuoteType);
        html.querySelectorAll("a").forEach(resolveLink);

        return html;
    }

    const renderNavBar = () => {
        const currentIndex = internalPaths.indexOf(currentPath);

        const previousPath = (currentIndex === 0)
            ? undefined : internalPaths.at(currentIndex - 1);

        const nextPath = (currentIndex + 1) === (internalPaths.length - 1)
            ? undefined : internalPaths.at(currentIndex + 1);

        const toLink = (path, label) => {
            if (!path)
                return "<span></span>";

            return `<a href="#${path}">${label}</a>`;
        }

        return `
            <nav class="note-navbar">
                ${toLink(previousPath, "<< prev")}
                <a href="#/">[home]</a>
                ${toLink(nextPath, "next >>")}
            </nav>
        `;
    }

    const check = (response) => {
        if (!response.ok)
            throw new Error();

        return response.text();
    }

    const render = (data) => {
        const markdown = format(data);
        const html = toHTML(markdown);

        const pageContent = `
            <theme-switcher></theme-switcher>
            ${renderNavBar()}
            ${html.body.innerHTML}
            ${renderNavBar()}
        `;

        document.body.innerHTML = pageContent;
        focusById(url.internal.hash);

        cache = {};
        cache[currentPath] = pageContent;
    }

    const contentURL = `${contentRoot}/${source}`;
    fetch(contentURL)
        .then(check)
        .then(render)
        .catch(() => goToNotFound());
}

export default {
    render() {
        const url = getLocation();
        renderMarkdownPage(url);
        focusById(url.internal.hash);
    }
}
