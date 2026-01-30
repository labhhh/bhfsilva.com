const roots = {
    books: { "/notes/books": "dev/livros" }
};

function build(domainPaths) {
    const map = {};

    const resolve = ([domain, paths]) => {
        const root = roots[domain];

        if (!root) return;

        const [[ pageRoot, sourceRoot ]] = Object.entries(root);

        const bind = (pagePath, sourcePath) => {
            map[`${pageRoot}${pagePath}`] = `${sourceRoot}${sourcePath}`;
        };

        Object.entries(paths).forEach(([path, source]) => bind(path, source));
    };

    Object.entries(domainPaths).forEach(resolve);
    return map;
}

export default build({
    books: {
        "/sicp": "/sicp/_indice.md",
        "/sicp/chapter-1": "/sicp/capitulo-1/_indice.md",
        "/sicp/chapter-1/subchapter-1-1": "/sicp/capitulo-1/subcapitulo-1-1.md",
        "/sicp/chapter-1/subchapter-1-2": "/sicp/capitulo-1/subcapitulo-1-2.md"
    }
});
