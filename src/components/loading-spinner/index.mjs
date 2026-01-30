import { BaseComponent } from "../../shared/base-component.mjs";

export class LoadingSpinner extends BaseComponent {
    constructor() {
        super();
    }

    static ID = "loading-spinner";

    styles = (`
        @keyframes spin {
            0% { transform: rotate(-360deg); }
        }

        i {
            animation: spin 1s infinite;
            display: inline-block;
            margin-top: 20px;
            font-size: 35px;
            color: #828282;
        }
    `);

    html = (`
        <i class="bi bi-arrow-repeat"></i>
    `);

    connectedCallback() {
        super.connectedCallback();
        this.includeIcons();
    }
}
