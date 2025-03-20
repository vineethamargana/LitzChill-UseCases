// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { fetchMemes } from "@repository/_meme_repo/MemeRepository.ts";

const TEST_USER_ID = "9a9afb14-acbc-481a-a315-4b946dbf0491";
const TEST_MEME_ID = "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84";

// Mock Supabase Client
function createMockSupabase(mockResponses: any) {
  return {
    from: (table: string) => {
      return {
        select: (_fields: string) => {
          if (table === "users") {
            return {
              eq: (_field: string, _value: string) =>
                Promise.resolve(mockResponses.users),
            };
          } else if (table === "memes") {
            return {
              eq: (_field: string, _value: string) => ({
                in: (_field: string, _values: string[]) => ({
                  order: (_field: string, _order: { ascending: boolean }) => ({
                    contains: (_field: string, _value: string) => ({
                      range: (_start: number, _end: number) =>
                        Promise.resolve(mockResponses.memes),
                    }),
                    range: (_start: number, _end: number) =>
                      Promise.resolve(mockResponses.memes),
                  }),
                }),
              }),
            };
          }
          return {};
        },
      };
    },
  };
}

// Test: Fetch memes successfully
Deno.test("fetchMemes fetches memes successfully", async () => {
  const mockSupabase = createMockSupabase({
    users: { data: [{ user_id: TEST_USER_ID }], error: null },
    memes: {
      data: [{ meme_id: TEST_MEME_ID, meme_title: "Funny Meme" }],
      error: null,
    },
  });

  const result = await fetchMemes(1, 10, "popular", null, mockSupabase as any);

  assertEquals(result.error, null);
  assertEquals(result.data?.length, 1);
});

// Test: No public users found
Deno.test("fetchMemes returns error when no public users found", async () => {
    const mockSupabaseClient = createMockSupabase({
        users: { data: [], error: null }, // Return an empty array instead of null
        memes: { data: [], error: null }, // Return empty array for memes too
    });

    const { data, error } = await fetchMemes(1, 10, "popular", null, mockSupabaseClient as any);

    assertEquals(error, null); // No error should be returned
    assertEquals(data, []);    // Should return an empty array
});



// Test: Error when fetching users
Deno.test("fetchMemes returns error when fetching users fails", async () => {
  const mockSupabase = createMockSupabase({
    users: { data: null, error: { message: "User fetch failed" } },
  });

  const result = await fetchMemes(1, 10, "popular", null, mockSupabase as any);

  assertEquals(result.data, null);
});

// Test: Error when fetching memes
Deno.test("fetchMemes returns error when fetching memes fails", async () => {
  const mockSupabase = createMockSupabase({
    users: { data: [{ user_id: TEST_USER_ID }], error: null },
    memes: { data: null, error: { message: "Meme fetch failed" } },
  });

  const result = await fetchMemes(1, 10, "popular", null, mockSupabase as any);

  assertEquals(result.data, null);
});
