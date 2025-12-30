import type { HTTPMethodCallback } from './http-method.callback.js';

export interface HTTPMethods {
    /**
     * The GET method requests a representation of the specified resource. Requests using GET should only retrieve data and should not contain a request content.
     */
    get(
        path: string,
        callback: HTTPMethodCallback
    ): void;

    /**
     * The HEAD method asks for a response identical to a GET request, but without a response body.
     */
    head(
        path: string,
        callback: HTTPMethodCallback
    ): void;

    /**
     * The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server.
     */
    post(
        path: string,
        callback: HTTPMethodCallback
    ): void;

    /**
     * The PUT method replaces all current representations of the target resource with the request content.
     */
    put(
        path: string,
        callback: HTTPMethodCallback
    ): void;

    /**
     * The DELETE method deletes the specified resource.
     */
    delete(
        path: string,
        callback: HTTPMethodCallback
    ): void;

    /**
     * The CONNECT method establishes a tunnel to the server identified by the target resource.
     */
    connect(
        path: string,
        callback: HTTPMethodCallback
    ): void;

    /**
     * The OPTIONS method describes the communication options for the target resource.
     */
    options(
        path: string,
        callback: HTTPMethodCallback
    ): void;

    /**
     * The TRACE method performs a message loop-back test along the path to the target resource.
     */
    trace(
        path: string,
        callback: HTTPMethodCallback
    ): void;

    /**
     * The PATCH method applies partial modifications to a resource.
     */
    patch(
        path: string,
        callback: HTTPMethodCallback
    ): void;
}