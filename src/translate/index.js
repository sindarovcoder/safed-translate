const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const createHttpError = require('http-errors');
const { extractTooManyRequestsInfo } = require('./helpers');

const defaults = {
  from: 'auto',
  to: 'en',
  host: 'translate.google.com',
};

async function translate(inputText, options) {
  return new Translator(inputText, options).translate();
}

class Translator {
  constructor(inputText, options) {
    this.inputText = inputText;
    this.options = Object.assign({}, defaults, options);
  }

  async translate() {
    const url = this.buildUrl();
    const fetchOptions = this.buildFetchOptions();
    const res = await fetch(url, fetchOptions);
    if (!res.ok) throw await this.buildError(res);
    const raw = await res.json();
    const text = this.buildResText(raw);
    return { text, raw };
  }
  buildUrl() {
    const { host } = this.options;
    return [
      `https://${host}/translate_a/single`,
      '?client=gtx',
      '&dt=t',   // Asosiy tarjima
      '&dt=rm',  // Romanizatsiya (balki farq bo‘lsa ishlaydi)
      '&dt=qc',  // Tarjima sifati va kontekst nazorati
      '&dt=at',  // Alternativ tarjimalar
      '&dt=bd',  // Kontekst va batafsil tushuntirish
      '&dt=ss',  // Sinonimlar (agar mavjud bo‘lsa)
      '&dt=md',  // So‘z turkumlari (ot, fe’l, sifat)
      '&dj=1',   // JSON formatida natija olish
    ].join('');
  }

  buildBody() {
    const { from, to } = this.options;
    const params = new URLSearchParams({
      sl: from,
      tl: to,
      text: this.inputText,
    });
    return params.toString();
  }

  buildFetchOptions() {
    const res = Object.assign({}, this.options.fetchOptions);
    res.method = 'POST';
    res.headers = Object.assign({}, res.headers, {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'uz-UZ,uz;q=0.9,en-US;q=0.8,en;q=0.7',
    });
    res.body = this.buildBody();
    return res;
  }


  buildResText(raw) {
    return raw.sentences
      .filter(s => 'trans' in s)
      .map(s => s.trans)
      .join('');
  }

  async buildError(res) {
    if (res.status === 429) {
      const text = await res.text();
      const { ip, time, url } = extractTooManyRequestsInfo(text);
      const message = `${res.statusText} IP: ${ip}, Time: ${time}, Url: ${url}`;
      return createHttpError(res.status, message);
    } else {
      return createHttpError(res.status, res.statusText);
    }
  }
}

module.exports = { translate };