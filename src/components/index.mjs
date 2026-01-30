import { LoadingSpinner } from "./loading-spinner/index.mjs";
import { ThemeSwitcher } from "./theme-switcher/index.mjs";

const registry = {
    [ThemeSwitcher.ID]: ThemeSwitcher,
    [LoadingSpinner.ID]: LoadingSpinner
};

function bind([id, component]) {
    window.customElements.define(id, component);
}

export default function registerComponents() {
    Object.entries(registry).forEach(bind);
}
