"use client";

export interface MakeRequestOptions extends RequestInit {
  redirectOnUnauthorized?: boolean;
}

export const makeRequest = async (input: RequestInfo | URL, init: MakeRequestOptions = {}) => {
  const { redirectOnUnauthorized = true, ...rest } = init;

  const response = await fetch(input, {
    cache: "no-store",
    ...rest,
  });

  if (response.status === 401 && redirectOnUnauthorized) {
    if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
      window.location.replace("/auth");
    }
    throw new Error("Unauthorized");
  }

  return response;
};
