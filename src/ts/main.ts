import invariant from "invariant";

declare module "fvtt-types/configuration" {
  interface AssumeHookRan {
    init: never;
  }
}

const BADGE_NAME = "honey-badger-badge";

function log(...args: unknown[]): void {
  logger.log("Honey Badger |", ...args);
}

Hooks.on("createToken", (tokenDocument) => {
  maybeDrawBadge({ tokenDocument });
});

Hooks.on("ready", () => {
  badgeAllTokens();
});

Hooks.on("canvasReady", () => {
  badgeAllTokens();
});

Hooks.on("updateToken", (tokenDocument, changes) => {
  if (!("name" in changes)) return;
  const token = tokenDocument.id ? canvas.tokens?.get(tokenDocument.id) : null;
  if (!token) return;
  token.getChildByName(BADGE_NAME)?.destroy();
  maybeDrawBadge({ token });
});

function badgeAllTokens(): void {
  for (const token of canvas.tokens?.placeables ?? []) {
    maybeDrawBadge({ token });
  }
}

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

  const r = 15 * pip * scale;
  const style = new PIXI.TextStyle({ fontSize: 18 * pip * scale, fill: "black", align: "center" });
  const metrics = PIXI.TextMetrics.measureText(badgeText, style);
  const pad = 8 * pip * scale;
  const isPill = metrics.width > r * 1.4;
  const halfW = isPill ? metrics.width / 2 + pad : 0;

  function drawBadgeBackgroundShape(g: PIXI.Graphics, radius: number, offset = 0): void {
    if (isPill) {
      g.drawRoundedRect(-halfW - offset, -radius - offset, (halfW + offset) * 2, (radius + offset) * 2, radius + offset);
    } else {
      g.drawCircle(0, 0, radius + offset);
    }
  }

  const shadow = new PIXI.Graphics();
  shadow.beginFill(0x000000);
  drawBadgeBackgroundShape(shadow, r, 1 * pip);
  shadow.alpha = 0.5;
  const blur = new PIXI.BlurFilter();
  blur.blur = 6 * pip;
  shadow.filters = [blur];
  shadow.position.set(2 * pip, 2 * pip);
  container.addChild(shadow);

  const bg = new PIXI.Graphics();
  bg.beginFill(0x404040);
  drawBadgeBackgroundShape(bg, r);
  bg.beginFill(0xa0a0a0);
  drawBadgeBackgroundShape(bg, r - 2 * pip);
  container.addChild(bg);

  const text = new PIXI.Text(badgeText, style);
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
