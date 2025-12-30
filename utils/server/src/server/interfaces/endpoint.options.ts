import type { HTTPMethods } from './http-methods.js';

export interface EndpointOptions {
    type: keyof HTTPMethods;
    path?: string;
}