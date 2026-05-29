declare module "fvtt-types/configuration" {
  interface AssumeHookRan {
    init: never
  }
};

function log(...args: unknown[]): void {
  logger.log("Honey Badger |", ...args);
}

Hooks.on("createToken", (token, options, userId) => {
  const tag = parseTokenTag(token.name);
  log("createToken", { name: token.name, tag, token, options, userId });
});

Hooks.on("updateToken", (token, change, options, userId) => {
  const tag = parseTokenTag(token.name);
  log("updateToken", { name: token.name, tag, token, change, options, userId });
});

function parseTokenTag(s: string): string | null {
  let match = s.match(/\((.*)\)\s*$/);
  return match?.[1] ?? null;
}
