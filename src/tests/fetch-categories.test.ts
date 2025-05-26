import { describe, it, expect, vi } from "vitest";
import { fetchCategories } from "./fetch-categories";

// Mock supabase
vi.mock("@/db/supabase", () => {
    return {
        supabase: {
            from: () => ({
                select: () => ({
                    data: [{ id: 1, name: "Tech" }, { id: 2, name: "Science" }],
                    error: null,
                }),
            }),
        },
    };
});

describe("fetchCategories", () => {
    it("returns category list from supabase", async () => {
        const result = await fetchCategories();
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("Tech");
    });
});
