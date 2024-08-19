import {isAppRouter} from '../utils/isAppRouter';
import {callback} from './callback';
import {createOrg} from './createOrg';
import {login} from './login';
import {logout} from './logout';
import {setup} from './setup';
import {health} from './health';
import {register} from './register';
import AppRouterClient from '../routerClients/AppRouterClient';
import PagesRouterClient from '../routerClients/PagesRouterClient';
import RouterClient from '../routerClients/RouterClient';
import {config} from '../config/index';

/**
 * @type {Record<string,(routerClient: RouterClient) => Promise<void>>}
 */
const routeMap = {
  create_org: createOrg,
  register,
  setup,
  login,
  logout,
  health,
  kinde_callback: callback
};

/**
 *
 * @param {string} endpoint
 * @returns
 */
const getRoute = (endpoint) => {
  return routeMap[endpoint];
};
/**
 * @param {object} [request]
 * @param {string} [endpoint]
 * @param {{onError?: () => void; config: {audience?: string | string[], clientId?: string, clientSecret?: string, issuerURL?: string, siteUrl?: string, postLoginRedirectUrl?: string, postLogoutRedirectUrl?: string}}} [options]
 * @returns {(req, res) => any}
 */
export default (request, endpoint, options) => {
  if (!config.clientOptions.authDomain)
    throw new Error(
      "The environment variable 'KINDE_ISSUER_URL' is required. Set it in your .env file"
    );

  if (!config.clientOptions.clientId && !options?.config?.clientId)
    throw new Error(
      "env variable 'KINDE_CLIENT_ID' is not set and not passed in options"
    );

  if (!config.clientOptions.clientSecret && !options?.config?.clientSecret)
    throw new Error(
      "env variable 'KINDE_CLIENT_SECRET' is not set and not passed in options"
    );

  if (!config.clientOptions.redirectURL && !options?.config?.siteUrl)
    throw new Error(
      "env variable 'KINDE_SITE_URL' is not set and not passed in options"
    );

  // For backwards compatibility in app router
  if (typeof request == 'object' && typeof endpoint == 'string') {
    // @ts-ignore
    return appRouterHandler(request, {params: {kindeAuth: endpoint}}, options);
  }
  /**
   *
   * @param {import('next').NextApiRequest | Request} req
   * @param {import('next').NextApiResponse | Response} res
   */
  return async function handler(req, res) {
    return isAppRouter(req)
      ? // @ts-ignore
        appRouterHandler(req, res, options)
      : // @ts-ignore
        pagesRouterHandler(req, res, request);
  };
};

/**
 *
 * @param {import('next/server').NextRequest} req
 * @param {{params: {kindeAuth: string}}} res
 * @param {{onError?: () => void}} options
 * @returns
 */
const appRouterHandler = async (req, res, options) => {
  const {params} = res;
  let endpoint = params.kindeAuth;
  endpoint = Array.isArray(endpoint) ? endpoint[0] : endpoint;
  const route = getRoute(endpoint);

  return route
    ? // @ts-ignore
      await route(new AppRouterClient(req, res, options))
    : new Response('This page could not be found.', {status: 404});
};

/**
 *
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 * @param {{domain: string, clientId: string, clientSecret: string}} clientOptions
 * @returns
 */
const pagesRouterHandler = async (req, res, clientOptions) => {
  let {
    query: {kindeAuth: endpoint}
  } = req;
  endpoint = Array.isArray(endpoint) ? endpoint[0] : endpoint;
  if (!endpoint) {
    throw Error('Please check your Kinde setup');
  }
  const route = getRoute(endpoint);
  return route
    ? // @ts-ignore
      await route(new PagesRouterClient(req, res, clientOptions))
    : res.status(404).end();
};
