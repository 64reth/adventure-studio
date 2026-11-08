import { EditorSchema } from "../editor/schema";
import { z } from "zod";
export const mechanics = [
  "route",
  "maze",
  "reveal",
  "word-search",
  "cipher",
] as const;
export const Status = z.enum([
  "Draft",
  "Generated",
  "Validation Failed",
  "Needs Review",
  "Approved",
  "Exported",
]);
export const AssetSchema = z.object({
  id: z.string(),
  type: z.literal("svg"),
  provider: z.string(),
  source: z.string(),
  creationRecord: z.string(),
  version: z.string(),
  createdAt: z.string(),
  licence: z.string(),
  rightsReview: z.enum(["Needs Review", "Approved"]),
  contentHash: z.string(),
  file: z.string(),
});
export const SceneSchema = z.object({
  perspective: z.enum(["top-down", "isometric", "panoramic"]),
  layers: z.array(z.string()),
  protectedGeometry: z.boolean(),
  theme: z.string(),
});
export const PageSchema = z.object({
  id: z.string().min(1),
  chapterId: z.string(),
  number: z.number().int().positive(),
  title: z.string().min(1).max(70),
  story: z.string().max(280),
  instructions: z.string().max(300),
  mechanic: z.enum(mechanics),
  seed: z.string().min(1).max(100),
  difficulty: z.enum(["gentle", "standard", "challenging"]),
  config: z.record(z.string(), z.unknown()),
  dependencies: z.array(z.string()),
  requiredClues: z.array(z.string()),
  rewards: z.array(z.string()),
  status: Status,
  scene: SceneSchema,
  assets: z.array(AssetSchema),
  reviewNote: z.string(),
  revision: z.number().int().nonnegative(),
  editor: EditorSchema.optional(),
});
export const ChapterSchema = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string(),
  location: z.string(),
  pages: z.array(z.string()),
  entryConditions: z.array(z.string()),
  completionRewards: z.array(z.string()),
});
export const AdventureSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().uuid(),
  title: z.string().min(1).max(120),
  series: z.string(),
  theme: z.string().min(1).max(60),
  premise: z.string().max(1000),
  targetAge: z.tuple([
    z.number().int().min(4).max(18),
    z.number().int().min(4).max(18),
  ]),
  difficultyRange: z.tuple([z.number(), z.number()]),
  chapters: z.array(ChapterSchema),
  pages: z.array(PageSchema).max(100),
  characters: z.array(z.string()),
  locations: z.array(z.string()),
  inventory: z.array(z.string()),
  status: Status,
  version: z.number().int().positive(),
  updatedAt: z.string(),
});
export type Adventure = z.infer<typeof AdventureSchema>;
export type Page = z.infer<typeof PageSchema>;
export type Mechanic = (typeof mechanics)[number];
export type Asset = z.infer<typeof AssetSchema>;
export function migrate(input: unknown): Adventure {
  return AdventureSchema.parse(input);
}
export function createAdventure(
  title: string,
  theme = "Enchanted Kingdom",
): Adventure {
  return AdventureSchema.parse({
    schemaVersion: 1,
    id: crypto.randomUUID(),
    title,
    series: "Explore, Colour & Solve",
    theme,
    premise: "Investigate the disappearance of the last dragon.",
    targetAge: [7, 10],
    difficultyRange: [1, 3],
    chapters: [],
    pages: [],
    characters: ["Princess Mira — mapmaker", "Rowan — apprentice naturalist"],
    locations: [],
    inventory: [],
    status: "Draft",
    version: 1,
    updatedAt: new Date().toISOString(),
  });
}
export interface StorageAdapter {
  list(): Promise<Adventure[]>;
  get(id: string): Promise<Adventure | null>;
  save(adventure: Adventure): Promise<void>;
  remove(id: string): Promise<void>;
}
