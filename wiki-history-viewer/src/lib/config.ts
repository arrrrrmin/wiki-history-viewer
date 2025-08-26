export interface ProjectSource {
    url: string;
    name: string;
}

export interface ProjectConfig {
    title: string;
    description: string;
    source: ProjectSource;
    author: string;
    credits: string;
    contact: string;
    introduction: string;
}


export const projectConfig: ProjectConfig = {
    title: "Wikirevia",
    description: "Visualize the revision history of wikipedia articles over time.",
    source: {
        url: "https://github.com/arrrrrmin/wiki-history-viewer",
        name: "Wikirevia"
    },
    author: "https://gravatar.com/defendorjoyfully5b71a1a62b",
    credits: "This projects is build on top of an open API provided by the Wikimedia Foundation and fueled by regional wikipedias, which are founded by donations. So you could consider donating.",
    contact: "hello [at] arrrrrmin [dot] dev",
    introduction: "Paste a valid wikipedia url into the input form and press submit. The first 200 revisions are loaded. Data is loaded from current to past data (left to right). If you need a larger context you can use the 'Load more'-button as long as there is data. If the API doesn't have more data you'll be visually notified and the button is disabled. When submitting a new URL the data is lost and the site will reset."
};


export interface QueryConfig {
    n: number;
    decay: number;
}

export const queryConfig: QueryConfig = {
    n: 10,
    decay: 300
}
