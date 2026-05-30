import invariant from "invariant";

declare module "fvtt-types/configuration" {
  interface AssumeHookRan {
    init: never;
  }
}

function log(...args: unknown[]): void {
  logger.log("Honey Badger |", ...args);
}

Hooks.on("createToken", (tokenDocument) => {
  maybeDrawBadge({ tokenDocument });
});

function badgeAllTokens(): void {
  for (const token of canvas.tokens?.placeables ?? []) {
    maybeDrawBadge({ token });
  }
}

Hooks.on("ready", () => {
  badgeAllTokens();
});

Hooks.on("canvasReady", () => {
  badgeAllTokens();
});

function parseTokenTag(s: string): string | null {
  let match = s.match(/\((.*)\)\s*$/);
  return match?.[1] ?? null;
}

function maybeDrawBadge({
  tokenDocument,
  token,
}:
  | { tokenDocument: TokenDocument; token?: never }
  | { tokenDocument?: never; token: Token }): void {
  if (!token) {
    const foundToken = tokenDocument!.id ? canvas.tokens?.get(tokenDocument!.id) : null;
    if (!foundToken) {
      log("No token found with id", { id: tokenDocument!.id });
      return;
    }
    token = foundToken;
  }

  const badgeText = parseTokenTag(token.name);
  if (!badgeText) return;

  const BADGE_NAME = "honey-badger-badge";
  if (token.getChildByName(BADGE_NAME)) return;

  const dims = getTokenDimensions(token);
  const gridSize = canvas.grid?.size ?? 100;
  const pip = gridSize / 100;
  const container = new PIXI.Container();
  container.name = BADGE_NAME;
  container.zIndex = 100;
  const scale = dims.scale > 1 ? Math.pow(dims.scale, 0.7) : 1;

  container.x = dims.width - 20 * pip * dims.scale;
  container.y = dims.height - 10 * pip - 20 * pip * dims.scale;

  const shadow = new PIXI.Graphics();
  shadow.beginFill(0x000000);
  shadow.drawCircle(2 * pip, 2 * pip, 16 * pip * scale);
  shadow.alpha = 0.5;
  const blur = new PIXI.BlurFilter();
  blur.blur = 6 * pip;
  shadow.filters = [blur];
  container.addChild(shadow);

  const bg = new PIXI.Graphics();
  bg.beginFill(0x404040);
  bg.drawCircle(0, 0, 15 * pip * scale);
  bg.beginFill(0xa0a0a0);
  bg.drawCircle(0, 0, 13 * pip * scale);
  container.addChild(bg);

  const text = new PIXI.Text(badgeText, {
    fontSize: 18 * pip * scale,
    fill: "black",
    align: "center",
  });
  text.anchor.set(0.5);
  container.addChild(text);

  token.sortableChildren = true;
  token.addChild(container);
}

function getTokenDimensions(token: Token): {
  width: number;
  height: number;
  size: number;
  scale: number;
} {
  invariant(canvas, "canvas must be initialized");
  invariant(canvas.grid, "canvas must have a grid");
  const width = token.w ?? token.document.width * canvas.grid.size;
  const height = token.h ?? token.document.height * canvas.grid.size;
  const textureScaleX = Number(token.document.texture?.scaleX ?? 1);
  const textureScaleY = Number(token.document.texture?.scaleY ?? 1);
  const actorScale = Math.max(
    Math.abs(textureScaleX),
    Math.abs(textureScaleY),
    0.1,
  );

  return {
    width,
    height,
    size: Math.max(width, height),
    scale: actorScale,
  };
}
