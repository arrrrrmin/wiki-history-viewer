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

export class TitleNotFoundError extends WikipediaUrlError {
  constructor() {
    super('The Wikipedia page title is missing or invalid.');
    this.name = 'TitleNotFoundError';
  }
}
