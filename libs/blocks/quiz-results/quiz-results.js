import { createTag } from '../../utils/utils.js';
import { getMetadata, handleStyle } from '../section-metadata/section-metadata.js';

export const LOADING_ERROR = 'Could not load quiz results:';

async function loadFragments(el, experiences) {
  const { default: createFragment } = await import('../fragment/fragment.js');
  // eslint-disable-next-line no-restricted-syntax
  for (const href of experiences) {
    /* eslint-disable no-await-in-loop */
    const a = createTag('a', { href });
    el.append(a);
    await createFragment(a);
  }
}

function redirectPage(quizUrl, debug, message) {
  const url = (quizUrl) ? quizUrl.text : 'https://adobe.com';
  window.lana.log(message);

  if (debug === 'quiz-results') {
    // eslint-disable-next-line no-console
    console.log(`${message}, redirecting to: ${url}`);
  } else {
    window.location = url;
  }
}

function setAnalytics(hashValue, debug) {
  /* eslint-disable no-underscore-dangle */
  window.alloy_load ??= {};
  window.alloy_load.data ??= {};
  window.alloy_all ??= {};
  window.alloy_all.data ??= {};
  window.alloy_all.data._acxpevangelist ??= {};
  window.alloy_all.data._acxpevangelist.digitalData ??= {};
  window.alloy_all.data._acxpevangelist.digitalData.page ??= {};
  window.alloy_all.data._acxpevangelist.digitalData.page.pageInfo ??= {};
  window.alloy_all.data._acxpevangelist.digitalData.page.pageInfo.customHash = hashValue;
  if (debug === 'quiz-results') {
    // eslint-disable-next-line no-console
    console.log('Setting a custom hash for pageload to: ', hashValue);
  }
}

export default async function init(el, debug = null, localStoreKey = null) {
  const data = getMetadata(el);
  const params = new URL(document.location).searchParams;
  const quizUrl = data['quiz-url'];
  const BASIC_KEY = 'basicFragments';
  const NESTED_KEY = 'nestedFragments';
  const HASH_KEY = 'pageloadHash';

  /* eslint-disable no-param-reassign */
  // handle these two query param values in this way to facilitate unit tests
  localStoreKey ??= params.get('quizKey');
  debug ??= params.get('debug');

  el.replaceChildren();

  let results = localStorage.getItem(localStoreKey);
  if (!results) {
    redirectPage(quizUrl, debug, `${LOADING_ERROR} local storage missing`);
    return;
  }

  try {
    results = JSON.parse(results);
  } catch (e) {
    redirectPage(quizUrl, debug, `${LOADING_ERROR} invalid JSON in local storage`);
    return;
  }

  if (data['nested-fragments'] && el.classList.contains('nested')) {
    const nested = results[NESTED_KEY][data['nested-fragments'].text];
    if (nested) loadFragments(el, nested);
  } else if (el.classList.contains('basic')) {
    const basic = results[BASIC_KEY];
    const pageloadHash = results[HASH_KEY];

    if (!basic || basic.length === 0) {
      redirectPage(quizUrl, debug, `${LOADING_ERROR} Basic fragments are missing`);
      return;
    }

    if (pageloadHash) {
      setAnalytics(pageloadHash, debug);
    }

    loadFragments(el, basic);
  } else {
    window.lana.log(`${LOADING_ERROR} The quiz-results block is misconfigured`);
    return;
  }

  if (data.style) {
    el.classList.add('section');
    handleStyle(data.style.text, el);
  }
  el.classList.add('show');
}
