import FormData from 'form-data';

const apikey = process.env.API_KEY;

function apikeyIsValid(key: any): key is string {
  if (typeof key !== 'string' || !key.length)
    throw new Error('Invalid API_KEY configured');

  return true;
}
apikeyIsValid(apikey);

export function appendApiKey(formData: FormData) {
  if (!apikeyIsValid(apikey)) return;

  formData.append('apikey', apikey);
}

export function appendURLApiKey(url: string) {
  if (!apikeyIsValid(apikey)) return '';

  return `${url}?apikey=${apikey}`;
}
