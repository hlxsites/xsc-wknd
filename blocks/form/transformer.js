import { requestTransformers, transformers } from './decorators/index.js';

export default {
  transformDOM: async (formDef, form) => {
    transformers.forEach(
      (fn) => fn.call(this, formDef, form),
    );
  },
  transformRequest: async (request, form) => requestTransformers.reduce(
    (promise, transformer) => promise.then((modifiedRequest) => transformer(modifiedRequest, form)),
    Promise.resolve(request),
  ),
};
