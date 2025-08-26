export const wikipediaUrlExample = 'https://fr.wikipedia.org/wiki/Louvre';

export class WikipediaUrlError extends Error {
  constructor(message: string) {
    super(`${message} - Example: ${wikipediaUrlExample}`);
    this.name = 'WikipediaUrlError';
  }
}

export class WrongProtocolError extends WikipediaUrlError {
  constructor() {
    super('The URL must use HTTPS.');
    this.name = 'WrongProtocolError';
  }
}

export class WrongHostnameError extends WikipediaUrlError {
  constructor() {
    super('The URL must be a valid Wikipedia domain.');
    this.name = 'WrongHostnameError';
  }
}

export class UnsupportedLanguageError extends WikipediaUrlError {
  constructor(lang: string) {
    super(`The language code "${lang}" is not supported by Wikipedia.`);
    this.name = 'UnsupportedLanguageError';
  }
}

export class PathnameError extends WikipediaUrlError {
  constructor() {
    super('The URL must follow the format /wiki/<title>.');
    this.name = 'PathnameError';
  }
}

export class UnsupportedProjectError extends WikipediaUrlError {
  constructor(url: string) {
    super(`The url '${url}' includes an unsupported wikimedia project. Currently only 'wiki' (wikipedia) is supported.`);
    this.name = 'UnsupportedProjectError';
  }
}

export class WikimediaAPIAccountError extends WikipediaUrlError {
  public username?: string;
  public project?: string;
  public lang?: string;

  constructor(username?: string, project?: string, lang?: string) {
    super(`Your Wikimedia account '${username}' us currently not loggin in to '${lang}/${project}'.`);
    this.name = 'WikimediaAPIAccountError';
    this.username = username;
    this.project = project;
    this.lang = lang;
  }
}