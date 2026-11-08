import { z } from "zod";
export const PrintSettingsSchema = z.object({
  preset: z.string(),
  width: z.number().min(3).max(18),
  height: z.number().min(3).max(18),
  bleed: z.number().min(0).max(0.25),
  inside: z.number().min(0.25).max(2),
  outside: z.number().min(0.25).max(2),
  top: z.number().min(0.25).max(2),
  bottom: z.number().min(0.25).max(2),
  inset: z.number().min(0).max(2),
  gutter: z.number().min(0).max(2),
  dpi: z.number().int().min(150).max(600),
});
export const GridSchema = z.object({
  columns: z.number().int().min(1).max(48),
  rows: z.number().int().min(1).max(64),
  gap: z.number().min(0).max(40),
  visible: z.boolean(),
  snap: z.boolean(),
  edges: z.boolean(),
  free: z.boolean(),
});
export const LibraryAssetSchema = z.object({
  id: z.string(),
  familyId: z.string(),
  name: z.string().min(1).max(80),
  category: z.enum([
    "Characters",
    "Environments",
    "Buildings",
    "Props",
    "Decorative",
    "Puzzle components",
    "Frames",
    "Text templates",
  ]),
  tags: z.array(z.string().max(40)).max(20),
  favourite: z.boolean(),
  version: z.number().int().positive(),
  svg: z.string().max(150000),
  source: z.string().max(300),
  licence: z.string().min(1).max(1000),
  hash: z.string(),
  createdAt: z.string(),
  review: z.enum(["Needs Review", "Approved"]),
  reviewNote: z.string().max(1000),
});
export const ComponentSchema = z.object({
  id: z.string(),
  kind: z.enum(["puzzle", "text", "scenery", "character", "frame", "asset"]),
  name: z.string().max(100),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().min(12).max(1800),
  height: z.number().min(12).max(1800),
  lineWeight: z.number().min(0.75).max(5).default(1.5),
  rotation: z.number().min(-180).max(180),
  visible: z.boolean(),
  locked: z.boolean(),
  group: z.string().optional(),
  variant: z.string().max(80),
  text: z.string().max(1000),
  font: z.enum(["OpenSans", "Fredoka", "Nunito"]),
  fontSize: z.number().min(8).max(100),
  align: z.enum(["left", "center", "right"]),
  lineHeight: z.number().min(1).max(2.5),
  puzzleRef: z.string().optional(),
  assetId: z.string().optional(),
  character: z
    .object({
      characterId: z.string(),
      assetRef: z.string(),
      poseRef: z.string(),
      expression: z.string(),
      facing: z.enum(["left", "right"]),
      role: z.string(),
      clue: z.string(),
    })
    .optional(),
});
export const CanvasStateSchema = z.object({
  print: PrintSettingsSchema,
  grid: GridSchema,
  components: z.array(ComponentSchema).max(100),
  assets: z.array(LibraryAssetSchema).max(30),
  activity: z
    .object({
      mechanic: z.enum(["route", "maze", "reveal", "word-search", "cipher"]),
      seed: z.string(),
      difficulty: z.enum(["gentle", "standard", "challenging"]),
      config: z.record(z.string(), z.unknown()),
    })
    .optional(),
  style: z.literal("colouring-book-bold"),
});
export const EditorSchema = z.object({
  schemaVersion: z.literal(1),
  state: CanvasStateSchema,
  past: z.array(CanvasStateSchema).max(30),
  future: z.array(CanvasStateSchema).max(30),
});
export type PrintSettings = z.infer<typeof PrintSettingsSchema>;
export type CanvasComponent = z.infer<typeof ComponentSchema>;
export type CanvasState = z.infer<typeof CanvasStateSchema>;
export type Editor = z.infer<typeof EditorSchema>;
export type LibraryAsset = z.infer<typeof LibraryAssetSchema>;
