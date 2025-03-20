// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { getNotificationsQuery } from "@repository/_notifications_repo/NotificationsQueries.ts";


function mockSupabaseResponse(data: any, error: any) {
    return {
        from: () => ({
            select: () => ({
                eq: () => ({
                    order: () => ({
                        limit: () => Promise.resolve({ data, error }),
                    }),
                }),
            }),
        }),
    };
}

Deno.test("getNotificationsQuery should return notifications when successful", async () => {
    const data = [{ id: "1", meme_id: "123", user_id: "456", likeable_type: "meme" }];
    const error = null;
    const mockquery = mockSupabaseResponse(data, error);
    const result = await getNotificationsQuery("123", mockquery as any);
    
    console.log("Result:", result);
    assertEquals(result.data, data);
});

Deno.test("getNotificationsQuery should return error when failed", async () => {
    const data = null;
    const error = { message: "Database connection failed" };
    const mockquery = mockSupabaseResponse(data, error);

    const result = await getNotificationsQuery("123", mockquery as any);
    
    console.log(result);

    assertEquals(result.error, error);
});
