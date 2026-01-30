import { BaseComponent } from "../../shared/base-component.mjs";

export class ThemeSwitcher extends BaseComponent {
    constructor() {
        super();
    }

    static ID = "theme-switcher";

    styles =  (`
        button {
            font-size: calc(var(--font-size) + 10px);
            color: var(--text-color);
            border-radius: 90px;
            background: none;
            padding: 3px 5px;
        }
    `);

    html = (`
        <button>
            <i class="bi bi-sun"></i>
        </button>
    `);

    connectedCallback() {
        super.connectedCallback();

        this.includeIcons();
        const element = this.getHTMLElement();

        const switchTheme = () => {
            const icon = element.firstElementChild;
            const isDark = (document.body.dataset.theme === "dark");

            document.body.dataset.theme = isDark ? "light" : "dark";
            icon.className = isDark ? "bi bi-moon" : "bi bi-sun";
        }

        element.addEventListener("click", switchTheme);
    }
}
