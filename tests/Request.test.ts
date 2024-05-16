import { Request, StorageMode, CacheNames } from "../src/Request";
import { InMemoryStorageProvider } from "../src/InMemoryStorageProvider";
import { CacheEntryOptions } from "../src/CacheEntryOptions";
import { FetchMock } from "jest-fetch-mock";

describe("Request", () => {
  let request: Request;

  beforeEach(() => {
    let url = "https://api.example.com";
    request = new Request({
        method: "GET",
        url: "",
        headers: {},
        credentials: "same-origin",
        serializer: JSON.stringify,
        parser: (response: Response) => response.json(),
        success: (response) => { },
        error: (reason) => { },
        retry: (attempt) => { },
        storageMode: StorageMode.NetworkFirst,
        cache: CacheNames.Default,
        cacheKey: "",
        timeout: 60000,
        retryAttempts: 3,
        retryDelay: 1000
    });
    
    fetchMock.doMock();
  });

  it("should create a GET request with default options", () => {
    const getRequest = Request.get("https://api.example.com");

    expect(getRequest).toBeInstanceOf(Request);
    expect(getRequest["options"]).toEqual({
      method: "GET",
      url: "https://api.example.com",
      headers: { "Accept": "application/json" },
      data: undefined,
      credentials: "same-origin",
      serializer: JSON.stringify,
      parser: expect.any(Function),
      success: expect.any(Function),
      error: expect.any(Function),
      retry: expect.any(Function),
      storageMode: StorageMode.NetworkFirst,
      cache: CacheNames.Default,
      cacheKey: "https://api.example.comundefined",
      timeout: 60000,
      retryAttempts: 3,
      retryDelay: 1000
    });
  });

  it("should create a POST request with custom options", () => {
    const postRequest = Request.post("https://api.example.com", { name: "John Doe" });

    expect(postRequest).toBeInstanceOf(Request);
    expect(postRequest["options"]).toEqual({
      method: "POST",
      url: "https://api.example.com",
      data: { name: "John Doe" },
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "same-origin",
      serializer: JSON.stringify,
      parser: expect.any(Function),
      success: expect.any(Function),
      error: expect.any(Function),
      retry: expect.any(Function),
      storageMode: StorageMode.NetworkOnly,
      cache: CacheNames.Default,
      cacheKey: "https://api.example.com{\"name\":\"John Doe\"}",
      timeout: 60000,
      retryAttempts: 3,
      retryDelay: 1000
    });
  });

  it("should set authentication provider", () => {
    const authenticationProvider = { authenticationFailed: jest.fn(), authenticate: jest.fn() };
    request.withAuthenticationProvider(authenticationProvider);

    expect(request["options"].authenticationProvider).toBe(authenticationProvider);
  });

  it("should add headers to the request", () => {
    const headers = { "Authorization": "Bearer token" };
    request.withHeaders(headers);

    expect(request["options"].headers).toEqual(headers);
  });

  it("should add a cancellation token to the request", () => {
    const cancellationToken = { canceled: false };
    request.withCancellationToken(cancellationToken);

    expect(request["options"].cancellationToken).toBe(cancellationToken);
  });

  it("should set credentials for the request", () => {
    const credentials = "include";
    request.withCredentials(credentials);

    expect(request["options"].credentials).toBe(credentials);
  });

  it("should set the serializer for the request", () => {
    const serializer = (data: any) => JSON.stringify(data);
    request.withSerializer(serializer);

    expect(request["options"].serializer).toBe(serializer);
  });

  it("should set the parser for the request", () => {
    const parser = (response: Response) => response.json();
    request.withParser(parser);

    expect(request["options"].parser).toBe(parser);
  });

  it("should set the success callback for the request", () => {
    const successCallback = (response: any) => console.log(response);
    request.onSuccess(successCallback);

    expect(request["options"].success).toBe(successCallback);
  });

  it("should set the error callback for the request", () => {
    const errorCallback = (reason: any) => console.error(reason);
    request.onError(errorCallback);

    expect(request["options"].error).toBe(errorCallback);
  });

  it("should set the retry callback for the request", () => {
    const retryCallback = (attempt: number) => console.log(`Retry attempt: ${attempt}`);
    request.onRetry(retryCallback);

    expect(request["options"].retry).toBe(retryCallback);
  });

  it("should set the storage mode for the request", () => {
    const storageMode = StorageMode.StorageAndUpdate;
    request.withStorageMode(storageMode);

    expect(request["options"].storageMode).toBe(storageMode);
  });

  it("should set the cache for the request", () => {
    const cacheName = CacheNames.InMemory;
    const cacheProvider = new InMemoryStorageProvider();
    request.withCache(cacheName, cacheProvider);

    expect(request["options"].cache).toBe(cacheName);
  });

  it("should set the cache key for the request", () => {
    const cacheKey = "cache-key";
    request.withCacheKey(cacheKey);

    expect(request["options"].cacheKey).toBe(cacheKey);
  });

  it("should set the timeout for the request", () => {
    const timeout = 30000;
    request.withTimeout(timeout);

    expect(request["options"].timeout).toBe(timeout);
  });

  it("should set the number of retry attempts for the request", () => {
    const retryAttempts = 5;
    request.withRetryAttempts(retryAttempts);

    expect(request["options"].retryAttempts).toBe(retryAttempts);
  });

  it("should set the retry delay for the request", () => {
    const retryDelay = 2000;
    request.withRetryDelay(retryDelay);

    expect(request["options"].retryDelay).toBe(retryDelay);
  });

  it("should abort the request and call the error callback", () => {
    const errorCallback = jest.fn();
    request.withCancellationToken
    request.onError(errorCallback);

    request.send();
    request.abort();

    expect(request["abortController"]).not.toBeNull();
    expect(errorCallback).toHaveBeenCalledWith(new Error("The request was aborted."));
  });

  it("should handle network being offline and reject the promise", async () => {
    const timeout = -1000;

    expect(request.withTimeout(timeout).send()).rejects.toEqual("System is offline");
  });
});